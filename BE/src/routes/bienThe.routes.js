const r = require('express').Router();
const { body } = require('express-validator');
const { manager, customer, idHopLe } = require('./middleware');
const { ketQua, laptopStatus } = require('../validators/api.validator');
const { traDuLieu } = require('../controllers/controller-helper');
const s = require('../services/bienThe.service');
const fields = () => [
  body('maSku').isString().trim().isLength({min:1,max:80}),
  body('mauSac').isString().trim().isLength({min:1,max:60}),
  body('ramGb').isInt({min:1,max:65535}).toInt(),
  body('ssdGb').isInt({min:1,max:65535}).toInt(),
  body('giaBan').isFloat({min:0}).toFloat(),
  body('giaNhap').optional().isFloat({min:0}).toFloat(),
  body('giaKhuyenMai').optional({nullable:true}).isFloat({min:0}).toFloat().custom((v,{req}) => v<=req.body.giaBan),
  body('anhDaiDien').optional({nullable:true}).isURL(),
  body('trangThai').optional().isIn(['ACTIVE','INACTIVE','OUT_OF_STOCK']),
  ketQua,
];
r.get('/laptops/:id/variants',idHopLe,traDuLieu(req=>s.list(req.params.id,true)));
r.get('/admin/variants',...manager,traDuLieu(req=>s.list(req.query.laptopId)));
r.post('/admin/variants',...manager,body('laptopId').isInt({min:1}).toInt(),...fields(),traDuLieu(req=>s.save(null,req.body),{statusCode:201}));
r.put('/admin/variants/:id',...manager,idHopLe,...fields(),traDuLieu(req=>s.save(req.params.id,req.body)));
r.patch('/admin/variants/:id/status',...manager,idHopLe,laptopStatus,traDuLieu(req=>s.save(req.params.id,{trangThai:req.body.trangThai})));
const cart=require('../controllers/gioHang.controller');
const quantity=require('../validators/api.validator').quantity;
r.put('/cart/variants/:bienTheId',...customer,idHopLe,quantity,cart.capNhat);
r.delete('/cart/variants/:bienTheId',...customer,idHopLe,cart.xoa);
r.post('/orders/quote',...customer,require('../validators/api.validator').order,traDuLieu(req=>require('../services/datHangBienThe.service').quote(req.user.id,req.body)));
module.exports = r;
