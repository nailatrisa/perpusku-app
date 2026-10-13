const express = require('express');
const loanController = require('../controllers/loanController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();
const librarianOrAdmin = [authenticate, authorize('pustakawan', 'admin')];

router.get('/loans/pending', ...librarianOrAdmin, loanController.pendingList);
router.post('/loans/:id/approve', ...librarianOrAdmin, loanController.approve);
router.post('/loans/:id/reject', ...librarianOrAdmin, loanController.reject);
router.get('/loans/returns', ...librarianOrAdmin, loanController.returns);

module.exports = router;