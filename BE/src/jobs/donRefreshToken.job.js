const { chay } = require('../repositories/co-so-du-lieu.repository');
const chayJob = () => chay(`DELETE FROM refresh_token WHERE expires_at<NOW() OR (is_revoked=TRUE AND revoked_at<DATE_SUB(NOW(),INTERVAL 30 DAY))`);
module.exports = { chayJob };
