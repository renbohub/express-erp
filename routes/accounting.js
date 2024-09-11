var express = require('express');
var router = express.Router();

var { verifyToken } = require('../middleware/jwtMiddleware');

const topsController = require('../controllers/accounting/topsController');
const accountsController = require('../controllers/accounting/accountsController');

// RoutePermissions Routes
router.get('/tops', [verifyToken], topsController.ReadTop);
router.get('/top/id', [verifyToken], topsController.ReadTopId);
router.post('/top', [verifyToken], topsController.CreateTop);
router.put('/top/id', [verifyToken], topsController.UpdateTop);
router.delete('/top/id', [verifyToken], topsController.DeleteTop);

router.get('/accounts', [verifyToken], accountsController.ReadAccount);
router.get('/account/id', [verifyToken], accountsController.ReadAccountId);
router.post('/account', [verifyToken], accountsController.CreateAccount);
router.put('/account/id', [verifyToken], accountsController.UpdateAccount);
router.delete('/account/id', [verifyToken], accountsController.DeleteAccount);
module.exports = router;