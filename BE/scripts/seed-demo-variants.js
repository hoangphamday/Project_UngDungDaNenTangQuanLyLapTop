// Adds purchasable demo configurations only to the SEED26 Acer sample laptop.
// Existing variants, stock, carts and orders are left untouched.
const { pool, trongGiaoDich } = require('../src/config/database');

const LAPTOP_ID = 103;
const RECEIPT_CODE = 'SEED26-VAR-L03';

async function main() {
  const outcome = await trongGiaoDich(async (db) => {
    const [[laptop]] = await db.execute('SELECT * FROM laptop WHERE id=? FOR UPDATE', [LAPTOP_ID]);
    if (!laptop || laptop.ma_san_pham !== 'SEED26-L03') {
      throw new Error('Chỉ hỗ trợ laptop mẫu SEED26-L03; không thay đổi dữ liệu khác.');
    }
    const [[receipt]] = await db.execute('SELECT id FROM phieu_nhap WHERE ma_phieu=?', [RECEIPT_CODE]);
    if (receipt) return 'Đã tạo các biến thể mẫu trước đó.';

    const [existing] = await db.execute('SELECT * FROM bien_the_laptop WHERE laptop_id=? FOR UPDATE', [LAPTOP_ID]);
    if (existing.length !== 1 || existing[0].ma_sku !== 'SEED26-L03-BAC') {
      throw new Error('Dữ liệu biến thể Acer đã thay đổi; không thể tự thêm dữ liệu mẫu.');
    }
    const base = existing[0];
    if (base.mau_sac !== 'Bạc' || base.ram_gb !== 16 || base.ssd_gb !== 512) {
      throw new Error('Cấu hình mặc định không khớp dữ liệu mẫu.');
    }
    const [references] = await db.execute('SELECT (SELECT COUNT(*) FROM nha_cung_cap WHERE id=103) supplier, (SELECT COUNT(*) FROM kho WHERE id=103) warehouse, (SELECT COUNT(*) FROM nhan_vien WHERE id=103) staff');
    if (!references[0].supplier || !references[0].warehouse || !references[0].staff) {
      throw new Error('Thiếu nhà cung cấp, kho hoặc nhân viên của dữ liệu mẫu.');
    }

    const added = [];
    for (const [color, colorCode] of [['Bạc', 'BAC'], ['Xám', 'XAM']]) {
      for (const ram of [16, 32]) {
        for (const ssd of [512, 1024]) {
          if (color === 'Bạc' && ram === 16 && ssd === 512) continue;
          const ramExtra = ram === 32 ? 1_200_000 : 0;
          const ssdExtra = ssd === 1024 ? 600_000 : 0;
          const price = Number(base.gia_ban) + (ram === 32 ? 2_000_000 : 0) + (ssd === 1024 ? 1_000_000 : 0);
          const cost = Number(base.gia_nhap) + ramExtra + ssdExtra;
          const [result] = await db.execute(
            'INSERT INTO bien_the_laptop(laptop_id,ma_sku,mau_sac,ram_gb,ssd_gb,gia_nhap,gia_ban,trang_thai) VALUES(?,?,?,?,?,?,?,?)',
            [LAPTOP_ID, `SEED26-L03-${colorCode}-${ram}-${ssd}`, color, ram, ssd, cost, price, 'ACTIVE'],
          );
          added.push({ id: result.insertId, cost });
        }
      }
    }

    const quantity = 3;
    const total = added.reduce((sum, item) => sum + item.cost * quantity, 0);
    const [created] = await db.execute(
      "INSERT INTO phieu_nhap(ma_phieu,nha_cung_cap_id,kho_id,nhan_vien_id,tong_tien,ghi_chu,trang_thai) VALUES(?,?,?,?,?,?,'COMPLETED')",
      [RECEIPT_CODE, 103, 103, 103, total, 'Nhập cấu hình mẫu Acer Swift Go 14',],
    );
    for (const item of added) {
      await db.execute('INSERT INTO chi_tiet_phieu_nhap(phieu_nhap_id,laptop_id,bien_the_id,so_luong,don_gia) VALUES(?,?,?,?,?)', [created.insertId, LAPTOP_ID, item.id, quantity, item.cost]);
      await db.execute('INSERT INTO ton_kho(kho_id,laptop_id,bien_the_id,so_luong) VALUES(?,?,?,?)', [103, LAPTOP_ID, item.id, quantity]);
    }
    return `Đã thêm ${added.length} SKU mẫu và phiếu nhập ${RECEIPT_CODE}.`;
  });
  console.log(outcome);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
