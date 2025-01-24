const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 基礎路由日誌記錄
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/functions', require('./routes/functions'));
app.use('/api/roles', require('./routes/roles'));

// Purchase Management Routes
app.use('/api/vendors', require('./routes/vendors')); // 供應商管理路由

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error occurred:', new Date().toISOString());
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Error Stack:', err.stack);

  // 根據環境返回不同詳細程度的錯誤訊息
  const errorResponse = {
    success: false,
    message: '伺服器錯誤',
    error: process.env.NODE_ENV === 'development' 
      ? {
          message: err.message,
          stack: err.stack
        }
      : '系統發生錯誤'
  };

  res.status(err.status || 500).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: '找不到該路徑',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log('==================================');
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log('==================================');
});