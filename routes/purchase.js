var express = require('express');
var router = express.Router();

var { verifyToken } = require('../middleware/jwtMiddleware');

module.exports = router;