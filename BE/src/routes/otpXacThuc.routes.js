const router=require('express').Router();const c=require('../controllers/otpXacThuc.controller');const v=require('../validators/otpXacThuc.validator');const {gioiHanTanSuat}=require('../middlewares/gioiHanYeuCau.middleware');
const limit=gioiHanTanSuat({windowMs:10*60_000,max:5,message:'Qua nhieu yeu cau OTP, vui long thu lai sau'});
router.post('/forgot-password',limit,v.quenMatKhau,c.quenMatKhau);router.post('/verify-otp',limit,v.xacMinh,c.xacMinhOtp);router.post('/reset-password',limit,v.datLai,c.datLaiMatKhau);
module.exports=router;
