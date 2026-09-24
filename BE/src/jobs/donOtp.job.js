const { chay } = require('../repositories/co-so-du-lieu.repository');
const chayJob = () => chay(`DELETE FROM otp_xac_thuc WHERE expires_at<DATE_SUB(NOW(),INTERVAL 1 DAY) OR (da_su_dung=TRUE AND created_at<DATE_SUB(NOW(),INTERVAL 1 DAY))`);
module.exports = { chayJob };
