const path = require('path');

const express = require('express');

const productsController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/',productsController.getIndex);

router.get('/products',productsController.getProducts);

router.get('/products/:productId',productsController.getProduct);

router.get('/cart',isAuth,productsController.getCart);

router.get('/orders',isAuth,productsController.getOrder);

router.get('/downloadInvoice/:orderId',isAuth,productsController.getInvoice);

router.post('/cart',isAuth,productsController.postCart);

router.get('/checkout',isAuth,productsController.getCheckout);

router.get('/checkout/success',isAuth,productsController.getCheckoutSuccess);

router.get('/checkout/cancel',isAuth,productsController.getCheckout);

router.post('/cart-delete-item',isAuth,productsController.postCartDeleteItem);

//router.post('/create-order',isAuth,productsController.postOrder);

module.exports = router;