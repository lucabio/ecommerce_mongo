const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const validations = require('../controllers/validations/validations')

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',isAuth,adminController.getAddProduct);
router.get('/edit-product/:productId',isAuth,adminController.getEditProduct);
router.get('/products',isAuth,adminController.getProductList);

// /admin/add-product => POST
router.post('/add-product',validations.productValidation,isAuth,adminController.postAddProduct);
router.post('/edit-product',validations.productValidation,isAuth,adminController.postEditProduct);
//asyncronous javascript
router.delete('/product/:productId',isAuth,adminController.deleteProduct);

module.exports = router;