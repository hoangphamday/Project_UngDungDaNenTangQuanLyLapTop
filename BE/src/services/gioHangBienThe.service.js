const { trongGiaoDich } = require('../config/database');
const { mot, nhieu, chay } = require('../repositories/co-so-du-lieu.repository');
const variants = require('./bienThe.service');
const LoiUngDung = require('../utils/loi-ung-dung');
const khach = (uid, db) => require('./api.service').khach(uid, db);

async function stock(variantId, quantity, db) {
  const row = await mot('SELECT COALESCE(SUM(so_luong-so_luong_da_dat),0) available FROM ton_kho WHERE bien_the_id=?', [variantId], db);
  if (quantity > row.available) throw new LoiUngDung('Không đủ tồn kho cho cấu hình đã chọn',409);
}
async function cart(uid) {
  const items = await nhieu(`SELECT g.id,g.laptop_id laptopId,g.bien_the_id bienTheId,l.ten_san_pham tenSanPham,
    COALESCE(v.anh_dai_dien,l.anh_dai_dien) anhDaiDien,v.ma_sku maSku,v.mau_sac mauSac,v.ram_gb ramGb,v.ssd_gb ssdGb,
    v.trang_thai trangThai,l.trang_thai laptopTrangThai,g.so_luong soLuong,COALESCE(v.gia_khuyen_mai,v.gia_ban) donGia,
    g.so_luong*COALESCE(v.gia_khuyen_mai,v.gia_ban) thanhTien,
    COALESCE((SELECT SUM(t.so_luong-t.so_luong_da_dat) FROM ton_kho t WHERE t.bien_the_id=v.id),0) tonKho
    FROM chi_tiet_gio_hang g JOIN laptop l ON l.id=g.laptop_id JOIN bien_the_laptop v ON v.id=g.bien_the_id
    WHERE g.khach_hang_id=? ORDER BY g.id`, [await khach(uid)]);
  return { items, tongTien: items.reduce((s,i)=>s+Number(i.thanhTien),0) };
}
async function cartAdd(uid,b) {
  return trongGiaoDich(async db=>{
    const kid=await khach(uid,db), v=await variants.resolve(b.laptopId,b.bienTheId,db);
    const old=await mot('SELECT so_luong FROM chi_tiet_gio_hang WHERE khach_hang_id=? AND bien_the_id=? FOR UPDATE',[kid,v.id],db);
    const quantity=Number(old?.so_luong||0)+Number(b.soLuong||1);
    if(quantity>99) throw new LoiUngDung('Số lượng tối đa là 99',422);
    await stock(v.id,quantity,db);
    await chay(`INSERT INTO chi_tiet_gio_hang(khach_hang_id,laptop_id,bien_the_id,so_luong) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE so_luong=VALUES(so_luong)`,[kid,v.laptop_id,v.id,quantity],db);
  });
}
// New clients address a variant. Legacy laptop routes work only for an unambiguous cart line.
async function cartLine(kid,laptopId,variantId,db) {
  const rows=await nhieu(`SELECT * FROM chi_tiet_gio_hang WHERE khach_hang_id=? AND ${variantId?'bien_the_id':'laptop_id'}=? FOR UPDATE`,[kid,variantId||laptopId],db);
  if(rows.length!==1) throw new LoiUngDung(rows.length?'Vui lòng chọn đúng biến thể trong giỏ':'Không tìm thấy sản phẩm trong giỏ',rows.length?422:404);
  return rows[0];
}
async function cartUpdate(uid,laptopId,quantity,variantId) {
  return trongGiaoDich(async db=>{
    if(!Number.isInteger(Number(quantity))||quantity<1||quantity>99) throw new LoiUngDung('Số lượng phải từ 1 đến 99',422);
    const line=await cartLine(await khach(uid,db),laptopId,variantId,db);
    await variants.resolve(line.laptop_id,line.bien_the_id,db);
    await stock(line.bien_the_id,quantity,db);
    await chay('UPDATE chi_tiet_gio_hang SET so_luong=? WHERE id=?',[quantity,line.id],db);
  });
}
async function cartRemove(uid,laptopId,variantId) {
  return trongGiaoDich(async db=>{
    const line=await cartLine(await khach(uid,db),laptopId,variantId,db);
    await chay('DELETE FROM chi_tiet_gio_hang WHERE id=?',[line.id],db);
  });
}
module.exports={cart,cartAdd,cartUpdate,cartRemove};
