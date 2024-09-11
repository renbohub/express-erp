var express = require('express');
var router = express.Router();

var { verifyToken } = require('../middleware/jwtMiddleware');
var { login, menu } = require('../controllers/auth/loginController');

router.post('/', login);
router.get('/menu', [verifyToken], menu);

module.exports = router;