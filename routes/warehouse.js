var express = require('express');
var router = express.Router();

var { verifyToken } = require('../middleware/jwtMiddleware');

const productsController = require('../controllers/warehouse/productsController');
const productUnitsController = require('../controllers/warehouse/productUnitsController');

// RoutePermissions Routes
router.get('/products', [verifyToken], productsController.ReadProduct);
router.get('/product/id', [verifyToken], productsController.ReadProductId);
router.post('/product', [verifyToken], productsController.CreateProduct);
router.put('/product/id', [verifyToken], productsController.UpdateProduct);
router.delete('/product/id', [verifyToken], productsController.DeleteProduct);

// RoutePermissions Routes
router.get('/units', [verifyToken], productUnitsController.ReadProductUnit);
router.get('/unit/id', [verifyToken], productUnitsController.ReadProductUnitId);
router.post('/unit', [verifyToken], productUnitsController.CreateProductUnit);
router.put('/unit/id', [verifyToken], productUnitsController.UpdateProductUnit);
router.delete('/unit/id', [verifyToken], productUnitsController.DeleteProductUnit);


module.exports = router;