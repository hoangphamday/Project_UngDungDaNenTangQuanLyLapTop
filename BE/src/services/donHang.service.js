const a=require('./api.service').orders;const b=require('./admin.service').adminOrders;module.exports={...a,danhSachQuanTri:b.list,doiTrangThai:b.status};
