require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const xacThucRoutes = require('./routes/xac-thuc.routes');
const { khongTimThay, xuLyLoi } = require('./middlewares/xu-ly-loi.middleware');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', env.trustProxy);
app.use(helmet());
app.use(cors({
  origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
  credentials: !env.corsOrigins.includes('*'),
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(morgan(env.laProduction ? 'combined' : 'dev', { skip: (req) => req.path === '/health' }));

app.get('/health', (_req, res) => res.status(200).json({ success: true, message: 'OK', data: null }));
app.use('/api/v1/auth', xacThucRoutes);
app.use(khongTimThay);
app.use(xuLyLoi);

module.exports = app;
