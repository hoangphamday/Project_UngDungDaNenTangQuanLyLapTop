const router = require('express').Router();
const { manager, idHopLe } = require('./middleware');
const { traDuLieu } = require('../controllers/controller-helper');
const { listPage } = require('../services/admin.service');
const { nhieu, mot } = require('../repositories/co-so-du-lieu.repository');
const { khongCo } = require('../services/api.service');

// Administrative lists include inactive records; public catalog stays unchanged.
for (const [path, table] of [['laptops', 'laptop'], ['brands', 'hang_laptop'], ['categories', 'danh_muc'], ['reviews', 'danh_gia']]) {
  router.get(`/admin/${path}`, ...manager, traDuLieu(req => listPage(table, req.query)));
}
router.get('/admin/customers', ...manager, traDuLieu(() => nhieu(`
  SELECT kh.id,kh.ho_ten,kh.diem_tich_luy,kh.created_at,
         tk.email,tk.so_dien_thoai,tk.trang_thai
  FROM khach_hang kh JOIN tai_khoan tk ON tk.id=kh.tai_khoan_id ORDER BY kh.id DESC
`)));
router.get('/admin/promotions/:id', ...manager, idHopLe, traDuLieu(async req => {
  const record = await mot('SELECT * FROM khuyen_mai WHERE id=?', [req.params.id]);
  if (!record) khongCo('Khuyen mai');
  record.laptopIds = (await nhieu('SELECT laptop_id FROM chi_tiet_khuyen_mai WHERE khuyen_mai_id=?', [record.id])).map(row => row.laptop_id);
  return record;
}));
module.exports = router;
