require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const configuredOrigins = new Set((process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim()));
const isLocalViteOrigin = (origin) => process.env.NODE_ENV !== 'production'
  && /^http:\/\/(localhost|127\.0\.0\.1):517[3-9]$/.test(origin);

app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.has(origin) || isLocalViteOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin tidak diizinkan oleh kebijakan CORS.'));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '..', process.env.UPLOAD_PATH || 'uploads')));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`PerpusKu API berjalan di http://localhost:${port}`));
}

module.exports = app;