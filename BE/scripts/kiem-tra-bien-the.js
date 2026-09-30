// Runs against a temporary database. Never writes test orders to the working database.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
require('dotenv').config({path:path.resolve(__dirname,'../.env'),quiet:true});

async function main() {
  const database=`codex_variant_test_${Date.now()}`;
  assert.match(database,/^codex_variant_test_\d+$/);
  const connection=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD||'',multipleStatements:true});
  let server, pool;
  try {
    const sql=await fs.readFile(path.resolve(__dirname,'../../Laptop_StoreVer3.sql'),'utf8');
    await connection.query(sql.replace(/\bLaptop_StoreVer3\b/g,database));
    process.env.DB_NAME=database;
    pool=require('../src/config/database').pool;
    const app=require('../src/app');
    const {taoAccessToken}=require('../src/utils/bao-mat');
    const admin=taoAccessToken({id:1,ten_vai_tro:'ADMIN'}),customer=taoAccessToken({id:3,ten_vai_tro:'CUSTOMER'});
    server=app.listen(0,'127.0.0.1');
    await new Promise(resolve=>server.once('listening',resolve));
    const base=`http://127.0.0.1:${server.address().port}/api/v1`;
    async function request(url,token,method='GET',body,status=200) {
      const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
      const data=await response.json();
      assert.equal(response.status,status,`${method} ${url}: ${JSON.stringify(data)}`);
      return data.data;
    }
    const product=await request('/admin/laptops',admin,'POST',{maSanPham:'VARIANT-TEST',tenSanPham:'Variant test',hangLaptopId:1,danhMucId:1,giaBan:10000000,giaNhap:7000000,ramGb:8,ssdGb:256,mauSac:'Đen'},201);
    const [first]=await request(`/laptops/${product.id}/variants`);
    assert.equal(first.mau_sac,'Đen');
    const payload={laptopId:product.id,maSku:'VARIANT-TEST-SILVER',mauSac:'Bạc',ramGb:16,ssdGb:512,giaNhap:9000000,giaBan:13000000,giaKhuyenMai:12000000};
    const second=await request('/admin/variants',admin,'POST',payload,201);
    await request('/admin/variants',admin,'POST',payload,409);
    await request('/admin/variants',customer,'POST',{...payload,maSku:'BLOCKED'},403);
    await request('/admin/variants',null,'GET',undefined,401);
    await request('/admin/variants',admin,'POST',{...payload,giaKhuyenMai:14000000},422);
    const warehouse=await request('/admin/warehouses',admin,'POST',{maKho:'VARIANT-WH',tenKho:'Variant warehouse'},201);
    const supplier=await request('/admin/suppliers',admin,'POST',{maNcc:'VARIANT-SUP',tenNcc:'Variant supplier'},201);
    const receipt=await request('/admin/import-receipts',admin,'POST',{nhaCungCapId:supplier.id,khoId:warehouse.id,items:[{laptopId:product.id,bienTheId:first.id,soLuong:3,donGia:7000000},{laptopId:product.id,bienTheId:second.id,soLuong:5,donGia:9000000}]},201);
    await request(`/admin/import-receipts/${receipt.id}/complete`,admin,'POST',{},200);
    async function inventory(){return request(`/admin/inventory?warehouseId=${warehouse.id}`,admin);}
    let stocks=await inventory();assert.equal(stocks.length,2);assert.deepEqual(stocks.map(s=>s.so_luong).sort(),[3,5]);
    await request('/cart',customer,'DELETE');
    await request('/cart/items',customer,'POST',{laptopId:product.id,soLuong:1},422);
    await request('/cart/items',customer,'POST',{laptopId:1,bienTheId:second.id,soLuong:1},422);
    for(const v of [first,second])await request('/cart/items',customer,'POST',{laptopId:product.id,bienTheId:v.id,soLuong:1},201);
    let cart=await request('/cart',customer);assert.equal(cart.items.length,2);assert.equal(cart.tongTien,22000000);
    const quote=await request('/orders/quote',customer,'POST',{items:[{laptopId:product.id,bienTheId:first.id,soLuong:1},{laptopId:product.id,bienTheId:second.id,soLuong:1}]});
    assert.equal(quote.total,22000000);assert.ok((await inventory()).every(s=>s.so_luong_da_dat===0));
    const filtered=await request('/laptops?ram=8&ssd=512');
    assert.ok(!filtered.items.some(p=>p.id===product.id),'filters must match a single configuration');
    await request(`/cart/items/${product.id}`,customer,'PUT',{soLuong:2},422);
    await request(`/cart/variants/${second.id}`,customer,'PUT',{soLuong:2});
    await request(`/cart/variants/${second.id}`,customer,'PUT',{soLuong:99},409);
    const order=await request('/orders',customer,'POST',{phuongThucNhan:'PICKUP',phuongThucThanhToan:'COD'},201);
    assert.equal(order.tong_thanh_toan,34000000);
    assert.equal(order.items.length,2);
    let snapshot=order.items.find(i=>i.bien_the_id===second.id).cau_hinh;if(typeof snapshot==='string')snapshot=JSON.parse(snapshot);
    assert.equal(snapshot.mauSac,'Bạc');assert.equal(snapshot.ramGb,16);
    stocks=await inventory();assert.equal(stocks.find(s=>s.bien_the_id===first.id).so_luong_da_dat,1);assert.equal(stocks.find(s=>s.bien_the_id===second.id).so_luong_da_dat,2);
    await request(`/admin/variants/${second.id}`,admin,'PUT',{...payload,giaBan:15000000,giaKhuyenMai:null});
    const historical=await request(`/orders/${order.id}`,customer);assert.equal(historical.items.find(i=>i.bien_the_id===second.id).don_gia,12000000);
    await request(`/orders/${order.id}/cancel`,customer,'PATCH',{});stocks=await inventory();assert.ok(stocks.every(s=>s.so_luong_da_dat===0));
    // A failed multi-variant order must roll back every earlier reservation.
    await request('/orders',customer,'POST',{phuongThucNhan:'PICKUP',items:[{laptopId:product.id,bienTheId:first.id,soLuong:1},{laptopId:product.id,bienTheId:second.id,soLuong:99}]},409);
    assert.ok((await inventory()).every(s=>s.so_luong_da_dat===0));
    await request(`/admin/variants/${second.id}/status`,admin,'PATCH',{trangThai:'INACTIVE'});
    assert.equal((await request(`/laptops/${product.id}/variants`)).length,1);
    await request('/orders',customer,'POST',{phuongThucNhan:'PICKUP',items:[{laptopId:product.id,bienTheId:second.id,soLuong:1}]},422);
    await request(`/admin/variants/${second.id}/status`,admin,'PATCH',{trangThai:'ACTIVE'});
    const delivered=await request('/orders',customer,'POST',{phuongThucNhan:'PICKUP',items:[{laptopId:product.id,bienTheId:second.id,soLuong:1}]},201);
    assert.equal(delivered.tong_thanh_toan,15000000);
    for(const status of ['CONFIRMED','PROCESSING','SHIPPING','DELIVERED'])await request(`/admin/orders/${delivered.id}/status`,admin,'PATCH',{trangThai:status});
    stocks=await inventory();assert.equal(stocks.find(s=>s.bien_the_id===first.id).so_luong,3);assert.equal(stocks.find(s=>s.bien_the_id===second.id).so_luong,4);assert.ok(stocks.every(s=>s.so_luong_da_dat===0));
    // Two competing orders for the last units cannot oversell.
    const competing=await Promise.all([1,2].map(()=>fetch(base+'/orders',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${customer}`},body:JSON.stringify({phuongThucNhan:'PICKUP',items:[{laptopId:product.id,bienTheId:first.id,soLuong:2}]})})));
    assert.deepEqual(competing.map(r=>r.status).sort(),[201,409]);
    console.log('PASS: fresh SQL import, variant CRUD/roles/validation, default migration, separate cart lines, variant pricing, imports, reservations, rollback, cancellation, historical snapshot, delivery and concurrent stock checks.');
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));
    if(pool)await pool.end();
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await connection.end();
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
