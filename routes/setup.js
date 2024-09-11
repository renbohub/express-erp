var express = require('express');
var router = express.Router();

var { verifyToken } = require('../middleware/jwtMiddleware');

var { ReadClient, UpdateClient } = require('../controllers/setups/clientController');
var { ReadUser, UpdateUser, ReadUserId, CreateUser, DeleteUser } = require('../controllers/setups/userController');
const appsController = require('../controllers/setups/appsController');
const packagesController = require('../controllers/setups/packagesController');
const rolesController = require('../controllers/setups/rolesController');
const routesController = require('../controllers/setups/routesController');
const appPermissionsController = require('../controllers/setups/appPermissionsController');
const routePermissionsController = require('../controllers/setups/routePermissionsController');


// Client CRUD
router.get('/client', [verifyToken], ReadClient);
router.put('/client', [verifyToken], UpdateClient);

// User CRUD
router.get('/user', [verifyToken], ReadUser);
router.get('/user/id', [verifyToken], ReadUserId);
router.post('/user', [verifyToken], CreateUser);
router.put('/user/id', [verifyToken], UpdateUser);
router.delete('/user/:id', [verifyToken], DeleteUser);

// User CRUD
router.get('/user', [verifyToken], ReadUser);
router.get('/user/id', [verifyToken], ReadUserId);
router.post('/user', [verifyToken], CreateUser);
router.put('/user/id', [verifyToken], UpdateUser);
router.delete('/user/id', [verifyToken], DeleteUser);

// Apps Routes
router.get('/app', [verifyToken], appsController.ReadApp);
router.get('/app/id', [verifyToken], appsController.ReadAppId);
router.post('/app', [verifyToken], appsController.CreateApp);
router.put('/app/id', [verifyToken], appsController.UpdateApp);
router.delete('/app/id', [verifyToken], appsController.DeleteApp);

// Packages Routes
router.get('/package', [verifyToken], packagesController.ReadPackage);
router.get('/package/id', [verifyToken], packagesController.ReadPackageId);
router.post('/package', [verifyToken], packagesController.CreatePackage);
router.put('/package/id', [verifyToken], packagesController.UpdatePackage);
router.delete('/package/id', [verifyToken], packagesController.DeletePackage);

// Roles Routes
router.get('/role', [verifyToken], rolesController.ReadRole);
router.get('/role/id', [verifyToken], rolesController.ReadRoleId);
router.post('/role', [verifyToken], rolesController.CreateRole);
router.put('/role/id', [verifyToken], rolesController.UpdateRole);
router.delete('/role/id', [verifyToken], rolesController.DeleteRole);

// Routes Routes
router.get('/route', [verifyToken], routesController.ReadRoute);
router.get('/route/id', [verifyToken], routesController.ReadRouteId);
router.post('/route', [verifyToken], routesController.CreateRoute);
router.put('/route/id', [verifyToken], routesController.UpdateRoute);
router.delete('/route/id', [verifyToken], routesController.DeleteRoute);

// AppPermissions Routes
router.get('/app_permission', [verifyToken], appPermissionsController.ReadAppPermission);
router.get('/app_permission/id', [verifyToken], appPermissionsController.ReadAppPermissionId);
router.post('/app_permission', [verifyToken], appPermissionsController.CreateAppPermission);
router.put('/app_permission/id', [verifyToken], appPermissionsController.UpdateAppPermission);
router.delete('/app_permission/id', [verifyToken], appPermissionsController.DeleteAppPermission);

// RoutePermissions Routes
router.get('/route_permission', [verifyToken], routePermissionsController.ReadRoutePermission);
router.get('/route_permission/id', [verifyToken], routePermissionsController.ReadRoutePermissionId);
router.post('/route_permission', [verifyToken], routePermissionsController.CreateRoutePermission);
router.put('/route_permission/id', [verifyToken], routePermissionsController.UpdateRoutePermission);
router.delete('/route_permission/id', [verifyToken], routePermissionsController.DeleteRoutePermission);

module.exports = router;