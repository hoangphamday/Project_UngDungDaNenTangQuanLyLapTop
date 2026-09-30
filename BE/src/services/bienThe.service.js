const { trongGiaoDich } = require('../config/database');
const { mot, nhieu, chay, capNhat } = require('../repositories/co-so-du-lieu.repository');
const LoiUngDung = require('../utils/loi-ung-dung');

const fields = { maSku:'ma_sku', mauSac:'mau_sac', ramGb:'ram_gb', ssdGb:'ssd_gb', giaNhap:'gia_nhap', giaBan:'gia_ban', giaKhuyenMai:'gia_khuyen_mai', anhDaiDien:'anh_dai_dien', trangThai:'trang_thai' };
const select = `SELECT v.*,l.ten_san_pham,l.ma_san_pham,
  COALESCE((SELECT SUM(t.so_luong-t.so_luong_da_dat) FROM ton_kho t WHERE t.bien_the_id=v.id),0) tonKho
  FROM bien_the_laptop v JOIN laptop l ON l.id=v.laptop_id`;

async function list(laptopId, publicOnly = false, db) {
  const where = [], params = [];
  if (laptopId) { where.push('v.laptop_id=?'); params.push(laptopId); }
  if (publicOnly) where.push("v.trang_thai='ACTIVE' AND l.trang_thai='ACTIVE'");
  return nhieu(`${select}${where.length ? ' WHERE '+where.join(' AND ') : ''} ORDER BY v.laptop_id,v.id`, params, db);
}
async function resolve(laptopId, variantId, db, forImport=false) {
  if (!variantId) {
    const rows = await nhieu(`SELECT id FROM bien_the_laptop WHERE laptop_id=? ${forImport?'':"AND trang_thai='ACTIVE'"} ORDER BY id LIMIT 2`, [laptopId], db);
    if (rows.length !== 1) throw new LoiUngDung('Vui lòng chọn màu sắc, RAM và SSD của laptop', 422);
    variantId = rows[0].id;
  }
  const row = await mot(`SELECT v.*,l.ten_san_pham FROM bien_the_laptop v JOIN laptop l ON l.id=v.laptop_id
    WHERE v.id=? AND v.laptop_id=? ${forImport?'':"AND v.trang_thai='ACTIVE' AND l.trang_thai='ACTIVE'"} FOR UPDATE`, [variantId,laptopId], db);
  if (!row) throw new LoiUngDung('Biến thể không tồn tại hoặc đã ngừng bán', 422);
  return row;
}
async function syncParent(laptopId, db) {
  const cheapest = await mot("SELECT * FROM bien_the_laptop WHERE laptop_id=? AND trang_thai='ACTIVE' ORDER BY COALESCE(gia_khuyen_mai,gia_ban),id LIMIT 1", [laptopId], db);
  if (cheapest) await chay('UPDATE laptop SET gia_nhap=?,gia_ban=?,gia_khuyen_mai=?,ram_gb=?,ssd_gb=? WHERE id=?',
    [cheapest.gia_nhap,cheapest.gia_ban,cheapest.gia_khuyen_mai,cheapest.ram_gb,cheapest.ssd_gb,laptopId], db);
}
async function createDefault(laptopId, db, b={}) {
  const l = await mot('SELECT * FROM laptop WHERE id=?', [laptopId], db);
  let specs = l.thong_so_ky_thuat || {};
  if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch { specs = {}; } }
  await chay(`INSERT INTO bien_the_laptop(laptop_id,ma_sku,mau_sac,ram_gb,ssd_gb,gia_nhap,gia_ban,gia_khuyen_mai,anh_dai_dien,trang_thai) VALUES(?,?,?,?,?,?,?,?,?,?)`,
    [laptopId,`${l.ma_san_pham}-DEFAULT`,b.mauSac || specs.mau_sac || 'Tiêu chuẩn',l.ram_gb || 8,l.ssd_gb || 256,l.gia_nhap,l.gia_ban,l.gia_khuyen_mai,l.anh_dai_dien,l.trang_thai], db);
}
async function save(id, b) {
  return trongGiaoDich(async db => {
    let laptopId;
    if (id) {
      const old = await mot('SELECT * FROM bien_the_laptop WHERE id=? FOR UPDATE', [id], db);
      if (!old) throw new LoiUngDung('Không tìm thấy biến thể', 404);
      laptopId = old.laptop_id;
      const nextPrice=b.giaBan ?? old.gia_ban;
      const nextPromo=b.giaKhuyenMai === undefined ? old.gia_khuyen_mai : b.giaKhuyenMai;
      if(nextPromo!==null && Number(nextPromo)>Number(nextPrice)) throw new LoiUngDung('Giá khuyến mãi không được lớn hơn giá bán',422);
      const used = await mot(`SELECT id FROM chi_tiet_don_hang WHERE bien_the_id=?
        UNION ALL SELECT id FROM chi_tiet_phieu_nhap WHERE bien_the_id=?
        UNION ALL SELECT id FROM ton_kho WHERE bien_the_id=? AND so_luong>0 LIMIT 1`, [id,id,id], db);
      if (used && ['maSku','mauSac','ramGb','ssdGb'].some(k => b[k] !== undefined && String(b[k]) !== String(old[fields[k]])))
        throw new LoiUngDung('Biến thể đã có nhập kho hoặc đơn hàng. Hãy tạo biến thể mới khi đổi cấu hình hoặc SKU.', 409);
      await capNhat('bien_the_laptop', id, b, fields, '', [], db);
    } else {
      laptopId = b.laptopId;
      if (!await mot('SELECT id FROM laptop WHERE id=? FOR UPDATE', [laptopId], db)) throw new LoiUngDung('Laptop không tồn tại',404);
      const keys = Object.keys(fields).filter(k => b[k] !== undefined);
      const r = await chay(`INSERT INTO bien_the_laptop(laptop_id,${keys.map(k=>fields[k]).join(',')}) VALUES(?,${keys.map(()=>'?').join(',')})`, [laptopId,...keys.map(k=>b[k])], db);
      id = r.insertId;
    }
    await syncParent(laptopId, db);
    return mot(`${select} WHERE v.id=?`, [id], db);
  });
}
module.exports = { list, resolve, save, syncParent, createDefault };
