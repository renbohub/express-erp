var express = require('express');
var router = express.Router();

var { verifyToken } = require('../middleware/jwtMiddleware');
var { addSub,index,indexId, createQuotation, updateQuotation, deleteQuotation, updateStatusQuotation, pdfQuotation } = require('../controllers/sales/quotationController');
const customersController = require('../controllers/sales/customersController');
const salesOrderController = require('../controllers/sales/salesOrderController');
const invoicesController = require('../controllers/sales/invoicesController');
const dashboardController = require('../controllers/sales/dashboardController');


// Quotation
router.get('/quotation/', [verifyToken], index);
router.get('/quotation/edit', [verifyToken], indexId);
router.post('/quotation/', [verifyToken], createQuotation);
router.post('/quotation/store', [verifyToken], addSub);
router.put('/quotation/', [verifyToken], updateQuotation);
router.put('/quotation/edit', [verifyToken], updateQuotation);
router.delete('/quotation/', [verifyToken], deleteQuotation);
router.put('/quotation/status/', [verifyToken], updateStatusQuotation);
router.get('/quotation/export/', [verifyToken], pdfQuotation);

// RoutePermissions Routes
router.get('/customers', [verifyToken], customersController.ReadCustomer);
router.get('/customers/id', [verifyToken], customersController.ReadCustomerId);
router.post('/customers', [verifyToken], customersController.CreateCustomer);
router.put('/customers/id', [verifyToken], customersController.UpdateCustomer);
router.delete('/customers/id', [verifyToken], customersController.DeleteCustomer);

router.get('/order', [verifyToken], salesOrderController.indexSO);
router.post('/order', [verifyToken], salesOrderController.createSalesOrder);
router.get('/order/edit', [verifyToken], salesOrderController.indexSOId);
router.put('/order/status/', [verifyToken], salesOrderController.updateStatusSalesOrder);
router.put('/order/header', [verifyToken], salesOrderController.updateSalesOrder);
router.get('/order/export/', [verifyToken], salesOrderController.pdfSalesOrder);

router.get('/invoice', [verifyToken], invoicesController.indexInv);
router.post('/invoice', [verifyToken], invoicesController.createInv);
router.get('/invoice/edit', [verifyToken], invoicesController.indexInvId);
router.put('/invoice/status/', [verifyToken], invoicesController.updateStatusInv);
router.put('/invoice/header', [verifyToken], invoicesController.updateInv);
router.get('/invoice/export/', [verifyToken], invoicesController.pdfInv);

router.get('/dashboard', [verifyToken], dashboardController.IndexDashboard);
router.post('/dashboard', [verifyToken], dashboardController.QueryDashboard);

module.exports = router;