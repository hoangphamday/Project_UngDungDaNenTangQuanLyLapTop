const { trongGiaoDich } = require('../config/database');
const { mot, nhieu, chay } = require('../repositories/co-so-du-lieu.repository');
const variants = require('./bienThe.service');
const LoiUngDung = require('../utils/loi-ung-dung');

async function create(uid,b) {
  const api = require('./api.service');
  return trongGiaoDich(async db=>{
    const kid = await api.khach(uid,db);
    const input = b.items || await nhieu('SELECT laptop_id laptopId,bien_the_id bienTheId,so_luong soLuong FROM chi_tiet_gio_hang WHERE khach_hang_id=? ORDER BY bien_the_id FOR UPDATE',[kid],db);
    if (!Array.isArray(input) || !input.length) throw new LoiUngDung('Giỏ hàng trống',422);
    if (new Set(input.map(i=>Number(i.bienTheId))).size!==input.length) throw new LoiUngDung('Biến thể bị trùng trong đơn hàng',422);
    const cart=[];
    for (const i of [...input].sort((a,b)=>Number(a.bienTheId)-Number(b.bienTheId))) {
      const v=await variants.resolve(i.laptopId,i.bienTheId,db);
      const l=await mot('SELECT danh_muc_id,hang_laptop_id FROM laptop WHERE id=?',[v.laptop_id],db);
      const quantity=Number(i.soLuong);
      if(!Number.isInteger(quantity)||quantity<1||quantity>99) throw new LoiUngDung('Số lượng phải từ 1 đến 99',422);
      const stocks=await nhieu('SELECT id,so_luong,so_luong_da_dat FROM ton_kho WHERE bien_the_id=? ORDER BY kho_id FOR UPDATE',[v.id],db);
      let need=quantity;
      for(const stock of stocks) {
        const take=Math.min(need,stock.so_luong-stock.so_luong_da_dat);
        if(take>0) { await chay('UPDATE ton_kho SET so_luong_da_dat=so_luong_da_dat+? WHERE id=?',[take,stock.id],db); need-=take; }
        if(!need)break;
      }
      if(need) throw new LoiUngDung(`Không đủ tồn kho cho ${v.ten_san_pham} (${v.ma_sku})`,409);
      cart.push({laptopId:v.laptop_id,bienTheId:v.id,soLuong:quantity,tenSanPham:v.ten_san_pham,donGia:Number(v.gia_khuyen_mai??v.gia_ban),danhMucId:l.danh_muc_id,hangId:l.hang_laptop_id,
        cauHinh:JSON.stringify({maSku:v.ma_sku,mauSac:v.mau_sac,ramGb:v.ram_gb,ssdGb:v.ssd_gb})});
    }
    if((b.phuongThucNhan||'DELIVERY')==='DELIVERY' && !await mot('SELECT id FROM dia_chi WHERE id=? AND khach_hang_id=?',[b.diaChiId||null,kid],db))
      throw new LoiUngDung('Vui lòng chọn địa chỉ giao hàng hợp lệ',422);
    const subtotal=cart.reduce((s,i)=>s+i.donGia*i.soLuong,0);
    const promo=await api.tinhKhuyenMai(b.maKhuyenMai,cart,db);
    const shipping=Number(b.phiVanChuyen)||0, total=subtotal+shipping-promo.discount;
    const r=await chay(`INSERT INTO don_hang(ma_don_hang,khach_hang_id,dia_chi_id,khuyen_mai_id,phuong_thuc_nhan,tong_tien_hang,phi_van_chuyen,tien_giam,tong_thanh_toan,ghi_chu_khach_hang) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [api.maTuDong('DH'),kid,b.phuongThucNhan==='PICKUP'?null:b.diaChiId,promo.promotion?.id||null,b.phuongThucNhan||'DELIVERY',subtotal,shipping,promo.discount,total,b.ghiChu||null],db);
    for(const i of cart) {
      await chay('INSERT INTO chi_tiet_don_hang(don_hang_id,laptop_id,bien_the_id,cau_hinh,ten_san_pham,don_gia,so_luong) VALUES(?,?,?,?,?,?,?)',[r.insertId,i.laptopId,i.bienTheId,i.cauHinh,i.tenSanPham,i.donGia,i.soLuong],db);
      await chay('DELETE FROM chi_tiet_gio_hang WHERE khach_hang_id=? AND bien_the_id=?',[kid,i.bienTheId],db);
    }
    if(promo.promotion)await chay('UPDATE khuyen_mai SET so_luong_da_dung=so_luong_da_dung+1 WHERE id=?',[promo.promotion.id],db);
    await chay('INSERT INTO thanh_toan(don_hang_id,phuong_thuc,so_tien) VALUES(?,?,?)',[r.insertId,b.phuongThucThanhToan||'COD',total],db);
    await chay(`INSERT INTO thong_bao(tai_khoan_id,loai_thong_bao,tieu_de,noi_dung,du_lieu) VALUES(?,'ORDER_CREATED','Đặt hàng thành công','Đơn hàng đã được tạo',JSON_OBJECT('orderId',?))`,[uid,r.insertId],db);
    const row=await mot('SELECT * FROM don_hang WHERE id=?',[r.insertId],db);
    row.items=await nhieu('SELECT * FROM chi_tiet_don_hang WHERE don_hang_id=?',[r.insertId],db);
    return row;
  });
}
async function quote(uid,b) {
  const api=require('./api.service');
  return trongGiaoDich(async db=>{
    const kid=await api.khach(uid,db);
    const input=b.items || await nhieu('SELECT laptop_id laptopId,bien_the_id bienTheId,so_luong soLuong FROM chi_tiet_gio_hang WHERE khach_hang_id=?',[kid],db);
    const items=[];
    for(const i of [...input].sort((a,b)=>Number(a.bienTheId)-Number(b.bienTheId))) {
      const v=await variants.resolve(i.laptopId,i.bienTheId,db);
      const l=await mot('SELECT danh_muc_id,hang_laptop_id FROM laptop WHERE id=?',[v.laptop_id],db);
      items.push({laptopId:v.laptop_id,soLuong:Number(i.soLuong),donGia:Number(v.gia_khuyen_mai??v.gia_ban),danhMucId:l.danh_muc_id,hangId:l.hang_laptop_id});
    }
    const subtotal=items.reduce((s,i)=>s+i.donGia*i.soLuong,0);
    const promo=await api.tinhKhuyenMai(b.maKhuyenMai,items,db);
    return {subtotal,discount:promo.discount,total:subtotal-promo.discount};
  });
}
module.exports={create,quote};
