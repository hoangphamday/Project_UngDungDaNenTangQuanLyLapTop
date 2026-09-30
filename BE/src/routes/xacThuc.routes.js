const router=require('express').Router();const c=require('../controllers/xacThuc.controller');const v=require('../validators/xacThuc.validator');const {xacThuc}=require('./middleware');const {gioiHanTanSuat}=require('../middlewares/gioiHanYeuCau.middleware');
const loginLimit=gioiHanTanSuat({windowMs:15*60_000,max:10,message:'Qua nhieu lan dang nhap, vui long thu lai sau'});
router.post('/register',v.dangKy,c.dangKy);router.post('/login',loginLimit,v.dangNhap,c.dangNhap);router.post('/refresh-token',v.refreshToken,c.lamMoiToken);router.post('/logout',v.refreshToken,c.dangXuat);router.post('/logout-all',xacThuc,c.dangXuatTatCa);router.get('/me',xacThuc,c.thongTinCuaToi);
module.exports=router;
