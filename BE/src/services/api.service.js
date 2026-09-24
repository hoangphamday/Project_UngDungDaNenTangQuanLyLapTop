const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const { trongGiaoDich } = require('../config/database');
const { mot, nhieu, chay, capNhat } = require('../repositories/co-so-du-lieu.repository');
const { phanTrang } = require('../utils/phan-trang');
const LoiUngDung = require('../utils/loi-ung-dung');

const khongCo = (ten = 'Du lieu') => { throw new LoiUngDung(`${ten} khong ton tai`, 404); };
const khach = async (taiKhoanId, db) => {
  const row = await mot('SELECT id FROM khach_hang WHERE tai_khoan_id=?', [taiKhoanId], db);
  if (!row) throw new LoiUngDung('Tai khoan khong co ho so khach hang', 403);
  return row.id;
};
const nhanVien = async (taiKhoanId, db) => {
  let row = await mot('SELECT id FROM nhan_vien WHERE tai_khoan_id=? AND trang_thai=\'ACTIVE\'', [taiKhoanId], db);
  if (!row) {
    const tk = await mot('SELECT vai_tro FROM tai_khoan WHERE id=?', [taiKhoanId], db);
    if (tk?.vai_tro === 'ADMIN') {
      const result = await chay(`INSERT INTO nhan_vien(tai_khoan_id,ma_nhan_vien,ho_ten,chuc_vu) VALUES(?,?,?,'Quan tri')`,
        [taiKhoanId, `ADMIN-${taiKhoanId}`, 'Quan tri vien'], db);
      row = { id: result.insertId };
    }
  }
  if (!row) throw new LoiUngDung('Tai khoan khong co ho so nhan vien ACTIVE', 403);
  return row.id;
};
const maTuDong = (prefix) => `${prefix}${Date.now()}${crypto.randomInt(100, 999)}`;

const devices = {
  list: (uid) => nhieu('SELECT id,expo_push_token AS expoPushToken,device_id AS deviceId,platform,app_version AS appVersion,trang_thai AS trangThai,created_at AS ngayTao FROM thiet_bi WHERE tai_khoan_id=? ORDER BY id DESC', [uid]),
  create: async (uid, b) => {
    await chay(`INSERT INTO thiet_bi(tai_khoan_id,expo_push_token,device_id,platform,app_version)
      VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE tai_khoan_id=VALUES(tai_khoan_id),device_id=VALUES(device_id),platform=VALUES(platform),app_version=VALUES(app_version),trang_thai=TRUE`,
    [uid, b.expoPushToken, b.deviceId || null, b.platform, b.appVersion || null]);
    return mot('SELECT * FROM thiet_bi WHERE expo_push_token=?', [b.expoPushToken]);
  },
  remove: async (uid, id) => { const r = await chay('DELETE FROM thiet_bi WHERE id=? AND tai_khoan_id=?', [id, uid]); if (!r.affectedRows) khongCo('Thiet bi'); },
};

const profile = {
  get: async (uid) => (await mot(`SELECT kh.id,kh.ho_ten AS hoTen,kh.ngay_sinh AS ngaySinh,kh.gioi_tinh AS gioiTinh,kh.avatar_url AS avatarUrl,kh.diem_tich_luy AS diemTichLuy,
    tk.ten_dang_nhap AS tenDangNhap,tk.email,tk.so_dien_thoai AS soDienThoai FROM khach_hang kh JOIN tai_khoan tk ON tk.id=kh.tai_khoan_id WHERE tk.id=?`, [uid])) || khongCo('Ho so'),
  update: async (uid, b) => {
    await trongGiaoDich(async (db) => {
    const kid = await khach(uid, db);
    if (b.email !== undefined || b.soDienThoai !== undefined) await capNhat('tai_khoan', uid, b, { email: 'email', soDienThoai: 'so_dien_thoai' }, '', [], db);
    if (['hoTen', 'ngaySinh', 'gioiTinh'].some((k) => b[k] !== undefined)) await capNhat('khach_hang', kid, b, { hoTen: 'ho_ten', ngaySinh: 'ngay_sinh', gioiTinh: 'gioi_tinh' }, '', [], db);
    });
    return profile.get(uid);
  },
  avatar: async (uid, url) => { const kid = await khach(uid); await chay('UPDATE khach_hang SET avatar_url=? WHERE id=?', [url, kid]); return { avatarUrl: url }; },
};

const addresses = {
  list: async (uid) => nhieu('SELECT * FROM dia_chi WHERE khach_hang_id=? ORDER BY mac_dinh DESC,id DESC', [await khach(uid)]),
  create: async (uid, b) => trongGiaoDich(async (db) => {
    const kid = await khach(uid, db);
    if (b.macDinh) await chay('UPDATE dia_chi SET mac_dinh=FALSE WHERE khach_hang_id=?', [kid], db);
    const r = await chay(`INSERT INTO dia_chi(khach_hang_id,nguoi_nhan,so_dien_thoai,tinh_thanh,quan_huyen,phuong_xa,dia_chi_chi_tiet,mac_dinh)
      VALUES(?,?,?,?,?,?,?,?)`, [kid,b.nguoiNhan,b.soDienThoai,b.tinhThanh,b.quanHuyen,b.phuongXa,b.diaChiChiTiet,!!b.macDinh], db);
    return mot('SELECT * FROM dia_chi WHERE id=?', [r.insertId], db);
  }),
  update: async (uid, id, b) => trongGiaoDich(async (db) => {
    const kid = await khach(uid, db); if (b.macDinh) await chay('UPDATE dia_chi SET mac_dinh=FALSE WHERE khach_hang_id=?', [kid], db);
    await capNhat('dia_chi', id, b, {nguoiNhan:'nguoi_nhan',soDienThoai:'so_dien_thoai',tinhThanh:'tinh_thanh',quanHuyen:'quan_huyen',phuongXa:'phuong_xa',diaChiChiTiet:'dia_chi_chi_tiet',macDinh:'mac_dinh'}, ' AND khach_hang_id=?',[kid],db);
    return mot('SELECT * FROM dia_chi WHERE id=?', [id], db);
  }),
  remove: async (uid,id) => { const r=await chay('DELETE FROM dia_chi WHERE id=? AND khach_hang_id=?',[id,await khach(uid)]); if(!r.affectedRows) khongCo('Dia chi'); },
  makeDefault: async (uid,id) => trongGiaoDich(async(db)=>{const kid=await khach(uid,db);const a=await mot('SELECT id FROM dia_chi WHERE id=? AND khach_hang_id=?',[id,kid],db);if(!a)khongCo('Dia chi');await chay('UPDATE dia_chi SET mac_dinh=(id=?) WHERE khach_hang_id=?',[id,kid],db);}),
};

const laptopSelect = `SELECT l.*,h.ten_hang AS tenHang,d.ten_danh_muc AS tenDanhMuc,
  COALESCE(SUM(t.so_luong-t.so_luong_da_dat),0) AS tonKho FROM laptop l JOIN hang_laptop h ON h.id=l.hang_laptop_id JOIN danh_muc d ON d.id=l.danh_muc_id LEFT JOIN ton_kho t ON t.laptop_id=l.id`;
const products = {
  list: async (q) => { const p=phanTrang(q), where=['l.trang_thai=\'ACTIVE\''], params=[];
    if(q.search){where.push('(l.ten_san_pham LIKE ? OR l.ma_san_pham LIKE ?)');params.push(`%${q.search}%`,`%${q.search}%`);} if(q.brandId){where.push('l.hang_laptop_id=?');params.push(q.brandId);} if(q.categoryId){where.push('l.danh_muc_id=?');params.push(q.categoryId);} if(q.minPrice){where.push('COALESCE(l.gia_khuyen_mai,l.gia_ban)>=?');params.push(q.minPrice);} if(q.maxPrice){where.push('COALESCE(l.gia_khuyen_mai,l.gia_ban)<=?');params.push(q.maxPrice);} if(q.ram){where.push('l.ram_gb=?');params.push(q.ram);}
    const total=(await mot(`SELECT COUNT(*) total FROM laptop l WHERE ${where.join(' AND ')}`,params)).total;
    const items=await nhieu(`${laptopSelect} WHERE ${where.join(' AND ')} GROUP BY l.id ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,[...params,p.limit,p.offset]); return {items,pagination:{page:p.page,limit:p.limit,total,totalPages:Math.ceil(total/p.limit)}}; },
  get: async (field,value) => { const row=await mot(`${laptopSelect} WHERE l.${field}=? AND l.trang_thai='ACTIVE' GROUP BY l.id`,[value]);if(!row)khongCo('Laptop');row.images=await nhieu('SELECT id,image_url AS imageUrl,la_anh_chinh AS laAnhChinh,thu_tu AS thuTu FROM hinh_anh_laptop WHERE laptop_id=? ORDER BY la_anh_chinh DESC,thu_tu',[row.id]);return row;},
};

const catalog = {
  list: (table) => nhieu(`SELECT * FROM ${table} WHERE trang_thai=TRUE ORDER BY ${table==='danh_muc'?'thu_tu,ten_danh_muc':'ten_hang'}`),
  get: async(table,id)=>{const r=await mot(`SELECT * FROM ${table} WHERE id=? AND trang_thai=TRUE`,[id]);if(!r)khongCo();return r;},
  tree: async()=>{const rows=await nhieu('SELECT * FROM danh_muc WHERE trang_thai=TRUE ORDER BY thu_tu,ten_danh_muc');const map=new Map(rows.map(r=>[r.id,{...r,children:[]}]));const roots=[];for(const r of map.values())(r.parent_id&&map.has(r.parent_id)?map.get(r.parent_id).children:roots).push(r);return roots;},
  create: async(table,b)=>{const brand=table==='hang_laptop';const cols=brand?'ten_hang,mo_ta,logo_url':'ten_danh_muc,parent_id,thu_tu,mo_ta';const vals=brand?[b.tenHang,b.moTa||null,b.logoUrl||null]:[b.tenDanhMuc,b.parentId||null,b.thuTu||0,b.moTa||null];const r=await chay(`INSERT INTO ${table}(${cols}) VALUES(${vals.map(()=>'?').join(',')})`,vals);return mot(`SELECT * FROM ${table} WHERE id=?`,[r.insertId]);},
  update: async(table,id,b)=>{await capNhat(table,id,b,table==='hang_laptop'?{tenHang:'ten_hang',moTa:'mo_ta',logoUrl:'logo_url'}:{tenDanhMuc:'ten_danh_muc',parentId:'parent_id',thuTu:'thu_tu',moTa:'mo_ta'});return mot(`SELECT * FROM ${table} WHERE id=?`,[id]);},
  status: (table,id,status)=>capNhat(table,id,{status},{status:'trang_thai'}),
};

const wishCart = {
  wishlist: async(uid)=>nhieu(`${laptopSelect} JOIN san_pham_yeu_thich y ON y.laptop_id=l.id WHERE y.khach_hang_id=? GROUP BY l.id ORDER BY y.created_at DESC`,[await khach(uid)]),
  wishAdd: async(uid,lid)=>{await chay('INSERT IGNORE INTO san_pham_yeu_thich(khach_hang_id,laptop_id) VALUES(?,?)',[await khach(uid),lid]);},
  wishRemove: async(uid,lid)=>{await chay('DELETE FROM san_pham_yeu_thich WHERE khach_hang_id=? AND laptop_id=?',[await khach(uid),lid]);},
  cart: async(uid)=>{const items=await nhieu(`SELECT g.laptop_id AS laptopId,l.ten_san_pham AS tenSanPham,l.anh_dai_dien AS anhDaiDien,g.so_luong AS soLuong,COALESCE(l.gia_khuyen_mai,l.gia_ban) AS donGia,(g.so_luong*COALESCE(l.gia_khuyen_mai,l.gia_ban)) AS thanhTien FROM chi_tiet_gio_hang g JOIN laptop l ON l.id=g.laptop_id WHERE g.khach_hang_id=?`,[await khach(uid)]);return {items,tongTien:items.reduce((s,i)=>s+i.thanhTien,0)};},
  cartAdd: async(uid,b)=>{await chay(`INSERT INTO chi_tiet_gio_hang(khach_hang_id,laptop_id,so_luong) VALUES(?,?,?) ON DUPLICATE KEY UPDATE so_luong=so_luong+VALUES(so_luong)`,[await khach(uid),b.laptopId,b.soLuong||1]);},
  cartUpdate: async(uid,lid,qty)=>{if(Number(qty)<1)throw new LoiUngDung('So luong phai lon hon 0',422);const r=await chay('UPDATE chi_tiet_gio_hang SET so_luong=? WHERE khach_hang_id=? AND laptop_id=?',[qty,await khach(uid),lid]);if(!r.affectedRows)khongCo('San pham trong gio');},
  cartRemove: async(uid,lid)=>chay('DELETE FROM chi_tiet_gio_hang WHERE khach_hang_id=? AND laptop_id=?',[await khach(uid),lid]),
  cartClear: async(uid)=>chay('DELETE FROM chi_tiet_gio_hang WHERE khach_hang_id=?',[await khach(uid)]),
};

const tinhKhuyenMai = async(code,items,db)=>{if(!code)return {promotion:null,discount:0};const km=await mot(`SELECT * FROM khuyen_mai WHERE ma_khuyen_mai=? AND trang_thai='ACTIVE' AND NOW() BETWEEN ngay_bat_dau AND ngay_ket_thuc FOR UPDATE`,[code],db);if(!km)throw new LoiUngDung('Khuyen mai khong hop le hoac da het han',422);if(km.so_luong>0&&km.so_luong_da_dung>=km.so_luong)throw new LoiUngDung('Khuyen mai da het luot',422);const total=items.reduce((s,i)=>s+i.donGia*i.soLuong,0);if(total<km.don_hang_toi_thieu)throw new LoiUngDung('Don hang chua dat gia tri toi thieu',422);let eligible=items;if(km.pham_vi_ap_dung==='PRODUCT'){const ids=(await nhieu('SELECT laptop_id FROM chi_tiet_khuyen_mai WHERE khuyen_mai_id=?',[km.id],db)).map(x=>x.laptop_id);eligible=items.filter(i=>ids.includes(Number(i.laptopId)));}if(km.pham_vi_ap_dung==='CATEGORY')eligible=items.filter(i=>i.danhMucId===km.danh_muc_id);if(km.pham_vi_ap_dung==='BRAND')eligible=items.filter(i=>i.hangId===km.hang_laptop_id);const base=eligible.reduce((s,i)=>s+i.donGia*i.soLuong,0);let discount=km.loai_giam==='PERCENT'?base*km.gia_tri_giam/100:Math.min(base,km.gia_tri_giam);if(km.giam_toi_da!==null)discount=Math.min(discount,km.giam_toi_da);return {promotion:km,discount:Math.round(discount)};};
const promotions={available:async()=>nhieu(`SELECT * FROM khuyen_mai WHERE trang_thai='ACTIVE' AND NOW() BETWEEN ngay_bat_dau AND ngay_ket_thuc AND (so_luong=0 OR so_luong_da_dung<so_luong) ORDER BY ngay_ket_thuc`),validate:async(uid,code)=>{const cart=await nhieu(`SELECT g.laptop_id laptopId,g.so_luong soLuong,COALESCE(l.gia_khuyen_mai,l.gia_ban) donGia,l.danh_muc_id danhMucId,l.hang_laptop_id hangId FROM chi_tiet_gio_hang g JOIN laptop l ON l.id=g.laptop_id WHERE g.khach_hang_id=?`,[await khach(uid)]);return tinhKhuyenMai(code,cart);}};

const orders={
  create:(uid,b)=>trongGiaoDich(async(db)=>{const kid=await khach(uid,db);const cart=await nhieu(`SELECT g.laptop_id laptopId,g.so_luong soLuong,l.ten_san_pham tenSanPham,COALESCE(l.gia_khuyen_mai,l.gia_ban) donGia,l.danh_muc_id danhMucId,l.hang_laptop_id hangId FROM chi_tiet_gio_hang g JOIN laptop l ON l.id=g.laptop_id WHERE g.khach_hang_id=? AND l.trang_thai='ACTIVE' FOR UPDATE`,[kid],db);if(!cart.length)throw new LoiUngDung('Gio hang trong',422);if((b.phuongThucNhan||'DELIVERY')==='DELIVERY'){const a=await mot('SELECT id FROM dia_chi WHERE id=? AND khach_hang_id=?',[b.diaChiId,kid],db);if(!a)throw new LoiUngDung('Dia chi khong hop le',422);}for(const item of cart){const stocks=await nhieu(`SELECT id,so_luong,so_luong_da_dat FROM ton_kho WHERE laptop_id=? AND so_luong>so_luong_da_dat ORDER BY kho_id FOR UPDATE`,[item.laptopId],db);let need=item.soLuong;for(const s of stocks){const take=Math.min(need,s.so_luong-s.so_luong_da_dat);if(take){await chay('UPDATE ton_kho SET so_luong_da_dat=so_luong_da_dat+? WHERE id=?',[take,s.id],db);need-=take;}if(!need)break;}if(need)throw new LoiUngDung(`Khong du ton kho cho ${item.tenSanPham}`,409);}const subtotal=cart.reduce((s,i)=>s+i.donGia*i.soLuong,0);const promo=await tinhKhuyenMai(b.maKhuyenMai,cart,db);const shipping=Number(b.phiVanChuyen)||0;const r=await chay(`INSERT INTO don_hang(ma_don_hang,khach_hang_id,dia_chi_id,khuyen_mai_id,phuong_thuc_nhan,tong_tien_hang,phi_van_chuyen,tien_giam,tong_thanh_toan,ghi_chu_khach_hang) VALUES(?,?,?,?,?,?,?,?,?,?)`,[maTuDong('DH'),kid,b.diaChiId||null,promo.promotion?.id||null,b.phuongThucNhan||'DELIVERY',subtotal,shipping,promo.discount,subtotal+shipping-promo.discount,b.ghiChu||null],db);for(const i of cart)await chay('INSERT INTO chi_tiet_don_hang(don_hang_id,laptop_id,ten_san_pham,don_gia,so_luong) VALUES(?,?,?,?,?)',[r.insertId,i.laptopId,i.tenSanPham,i.donGia,i.soLuong],db);if(promo.promotion)await chay('UPDATE khuyen_mai SET so_luong_da_dung=so_luong_da_dung+1 WHERE id=?',[promo.promotion.id],db);await chay('INSERT INTO thanh_toan(don_hang_id,phuong_thuc,so_tien) VALUES(?,?,?)',[r.insertId,b.phuongThucThanhToan||'COD',subtotal+shipping-promo.discount],db);await chay('DELETE FROM chi_tiet_gio_hang WHERE khach_hang_id=?',[kid],db);await chay(`INSERT INTO thong_bao(tai_khoan_id,loai_thong_bao,tieu_de,noi_dung,du_lieu) VALUES(?,'ORDER_CREATED','Dat hang thanh cong','Don hang da duoc tao',JSON_OBJECT('orderId',?))`,[uid,r.insertId],db);return mot('SELECT * FROM don_hang WHERE id=?',[r.insertId],db);}),
  list:async(uid,q)=>{const p=phanTrang(q),kid=await khach(uid);const total=(await mot('SELECT COUNT(*) total FROM don_hang WHERE khach_hang_id=?',[kid])).total;return {items:await nhieu('SELECT * FROM don_hang WHERE khach_hang_id=? ORDER BY id DESC LIMIT ? OFFSET ?',[kid,p.limit,p.offset]),pagination:{...p,total,totalPages:Math.ceil(total/p.limit)}};},
  get:async(uid,id,admin=false)=>{const params=admin?[id]:[id,await khach(uid)];const row=await mot(`SELECT * FROM don_hang WHERE id=?${admin?'':' AND khach_hang_id=?'}`,params);if(!row)khongCo('Don hang');row.items=await nhieu('SELECT * FROM chi_tiet_don_hang WHERE don_hang_id=?',[id]);return row;},
  cancel:(uid,id,reason)=>trongGiaoDich(async(db)=>{const kid=await khach(uid,db);const o=await mot(`SELECT * FROM don_hang WHERE id=? AND khach_hang_id=? FOR UPDATE`,[id,kid],db);if(!o)khongCo('Don hang');if(!['PENDING','CONFIRMED'].includes(o.trang_thai))throw new LoiUngDung('Khong the huy don o trang thai hien tai',409);await chay(`UPDATE don_hang SET trang_thai='CANCELLED',ly_do_huy=? WHERE id=?`,[reason||'Khach hang huy',id],db);await orders.releaseStock(id,db);if(o.khuyen_mai_id)await chay('UPDATE khuyen_mai SET so_luong_da_dung=GREATEST(0,so_luong_da_dung-1) WHERE id=?',[o.khuyen_mai_id],db);}),
  releaseStock:async(id,db)=>{const items=await nhieu('SELECT laptop_id,so_luong FROM chi_tiet_don_hang WHERE don_hang_id=? ORDER BY laptop_id',[id],db);for(const i of items){let qty=i.so_luong;const stocks=await nhieu('SELECT id,so_luong_da_dat FROM ton_kho WHERE laptop_id=? AND so_luong_da_dat>0 ORDER BY kho_id FOR UPDATE',[i.laptop_id],db);for(const s of stocks){const take=Math.min(qty,s.so_luong_da_dat);await chay('UPDATE ton_kho SET so_luong_da_dat=so_luong_da_dat-? WHERE id=?',[take,s.id],db);qty-=take;if(!qty)break;}}},
};

const reviews={list:(lid)=>nhieu(`SELECT dg.id,dg.so_sao AS soSao,dg.noi_dung AS noiDung,dg.anh_url AS anhUrl,dg.created_at AS ngayTao,kh.ho_ten AS nguoiDanhGia FROM danh_gia dg JOIN khach_hang kh ON kh.id=dg.khach_hang_id WHERE dg.laptop_id=? AND dg.trang_thai='APPROVED' ORDER BY dg.id DESC`,[lid]),create:async(uid,lid,b)=>{const kid=await khach(uid);const bought=await mot(`SELECT dh.id FROM don_hang dh JOIN chi_tiet_don_hang ct ON ct.don_hang_id=dh.id WHERE dh.khach_hang_id=? AND dh.trang_thai='DELIVERED' AND ct.laptop_id=? LIMIT 1`,[kid,lid]);if(!bought)throw new LoiUngDung('Chi khach da mua va nhan hang moi duoc danh gia',403);const exists=await mot('SELECT id FROM danh_gia WHERE khach_hang_id=? AND laptop_id=?',[kid,lid]);if(exists)throw new LoiUngDung('Ban da danh gia san pham nay',409);const r=await chay('INSERT INTO danh_gia(khach_hang_id,laptop_id,don_hang_id,so_sao,noi_dung,anh_url) VALUES(?,?,?,?,?,?)',[kid,lid,bought.id,b.soSao,b.noiDung||null,b.anhUrl||null]);return mot('SELECT * FROM danh_gia WHERE id=?',[r.insertId]);},update:async(uid,id,b)=>{await capNhat('danh_gia',id,b,{soSao:'so_sao',noiDung:'noi_dung',anhUrl:'anh_url'},' AND khach_hang_id=?',[await khach(uid)]);},remove:async(uid,id)=>{const r=await chay('DELETE FROM danh_gia WHERE id=? AND khach_hang_id=?',[id,await khach(uid)]);if(!r.affectedRows)khongCo('Danh gia');}};

const notifications={list:async(uid,q)=>{const p=phanTrang(q);const total=(await mot('SELECT COUNT(*) total FROM thong_bao WHERE tai_khoan_id=?',[uid])).total;return {items:await nhieu('SELECT * FROM thong_bao WHERE tai_khoan_id=? ORDER BY id DESC LIMIT ? OFFSET ?',[uid,p.limit,p.offset]),pagination:{page:p.page,limit:p.limit,total,totalPages:Math.ceil(total/p.limit)}};},count:async(uid)=>(await mot('SELECT COUNT(*) count FROM thong_bao WHERE tai_khoan_id=? AND da_doc=FALSE',[uid])).count,read:async(uid,id)=>{const r=await chay('UPDATE thong_bao SET da_doc=TRUE WHERE id=? AND tai_khoan_id=?',[id,uid]);if(!r.affectedRows)khongCo('Thong bao');},readAll:(uid)=>chay('UPDATE thong_bao SET da_doc=TRUE WHERE tai_khoan_id=? AND da_doc=FALSE',[uid])};

module.exports={khach,nhanVien,khongCo,maTuDong,devices,profile,addresses,products,catalog,wishCart,promotions,tinhKhuyenMai,orders,reviews,notifications};
