const express = require('express');
const router = express.Router();
// HEALTH CHECK (public)
router.get('/health', async (req, res) => {
  try {
    const db = require('../config/database');
    await db.raw('SELECT 1');
    res.json({ success: true, message: 'API dan database berjalan', data: { database: 'connected' } });
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database tidak dapat dihubungi' });
  }
});

const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');
const categoryController = require('../controllers/categoryController');
const userController = require('../controllers/userController');
const loanController = require('../controllers/loanController');
const fineController = require('../controllers/fineController');
const dashboardController = require('../controllers/dashboardController');
const reportController = require('../controllers/reportController');
const activityLogController = require('../controllers/activityLogController');
const backupController = require('../controllers/backupController');

const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

// ============ PUBLIC ============
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/books', bookController.index);
router.get('/books/:id', bookController.show);
router.get('/categories', categoryController.index);

// ============ PROTECTED ============
router.use(authenticate);

router.get('/auth/me', authController.me);
router.post('/auth/logout', authController.logout);

// DASHBOARD
router.get('/dashboard/admin', authorize('admin'), dashboardController.admin);
router.get('/dashboard/pustakawan', authorize('pustakawan', 'admin'), dashboardController.pustakawan);
router.get('/dashboard/user', authorize('masyarakat'), dashboardController.user);

// BOOKS (WRITE)
router.post('/books', authorize('admin'), upload.single('cover'), bookController.store);
router.put('/books/:id', authorize('admin'), upload.single('cover'), bookController.update);
router.delete('/books/:id', authorize('admin'), bookController.destroy);

// CATEGORIES (WRITE)
router.post('/categories', authorize('admin'), categoryController.store);
router.put('/categories/:id', authorize('admin'), categoryController.update);
router.delete('/categories/:id', authorize('admin'), categoryController.destroy);

// USERS
router.get('/users', authorize('admin'), userController.index);
router.get('/users/:id', authorize('admin'), userController.show);
router.post('/users', authorize('admin'), userController.store);
router.put('/users/:id', authorize('admin'), userController.update);
router.delete('/users/:id', authorize('admin'), userController.destroy);

// ============ LOANS ============
router.get('/loans', authorize('pustakawan', 'admin'), loanController.index);
router.get('/loans/pending', authorize('pustakawan', 'admin'), loanController.pendingList);
router.get('/loans/returns', authorize('pustakawan', 'admin'), loanController.returns);
router.get('/my-loans', loanController.myLoans);
router.post('/loans', authorize('pustakawan', 'admin'), loanController.store);
router.post('/loans/return', loanController.returnBook);
router.post('/loans/perpanjang', authorize('pustakawan', 'admin'), loanController.perpanjang);
router.post('/loans/request', authorize('masyarakat'), loanController.requestBorrow);
router.post('/loans/:id/approve', authorize('pustakawan', 'admin'), loanController.approve);
router.post('/loans/:id/reject', authorize('pustakawan', 'admin'), loanController.reject);
router.put('/loans/:id', authorize('pustakawan', 'admin'), loanController.update);
router.delete('/loans/:id', authorize('pustakawan', 'admin'), loanController.destroy);

// SCAN QR
router.post('/scan/user', authorize('pustakawan', 'admin'), loanController.scanUser);
router.post('/scan/book', authorize('pustakawan', 'admin'), loanController.scanBook);

// FINES
router.get('/fines', authorize('pustakawan', 'admin'), fineController.index);
router.post('/fines/:id/bayar', authorize('pustakawan', 'admin'), fineController.bayar);

// REPORTS
router.get('/reports/loans', authorize('admin', 'pustakawan'), reportController.loans);
router.get('/reports/books', authorize('admin', 'pustakawan'), reportController.books);
router.get('/reports/users', authorize('admin'), reportController.users);
router.get('/reports/activity-logs', authorize('admin'), reportController.activityLogs);

module.exports = router;