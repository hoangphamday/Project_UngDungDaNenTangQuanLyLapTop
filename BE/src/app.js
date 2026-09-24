require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const corsConfig = require('./config/cors');
const { ganSwagger } = require('./config/swagger');
const apiRoutes = require('./routes');
const { webhookRouter } = require('./routes/thanhToan.routes');
const khongTimThay = require('./middlewares/khongTimThay.middleware');
const xuLyLoi = require('./middlewares/xuLyLoi.middleware');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', env.trustProxy);
app.use(helmet());
app.use(cors(corsConfig));
app.use('/api/v1/payments', webhookRouter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(morgan(env.laProduction ? 'combined' : 'dev', { skip: (req) => req.path === '/health' }));

app.get('/health', (_req, res) => res.status(200).json({ success: true, message: 'OK', data: null }));
ganSwagger(app);
app.use('/api/v1', apiRoutes);
app.use('/uploads', express.static(require('node:path').resolve(__dirname, '../uploads')));
app.use(khongTimThay);
app.use(xuLyLoi);

module.exports = app;
