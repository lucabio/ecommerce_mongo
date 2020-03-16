const Product = require('../models/product');

//const Cart = require('../models/cart');

const User = require('../models/user');

const ObjectId = require('mongodb').ObjectID; 

exports.getProducts = (req, res, next) => {
    //in this case set automatically the headers to text/html
    //res.send('<h1>Hello from Express</h1>');
    Product.fetchAll()
    .then((products) => {
        res.render('shop/product-list', {
            prods: products,
            path: '/products',
            pageTitle: 'Shop'
        });
    })
    .catch(err => {
        console.log(`shop/product-list fetchAll error ${err}`);
    });
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .then(product =>{
            console.log(`${product}`);
            res.render('shop/product-detail',{
                product : product,
                path: '/products',
                pageTitle : 'Product Detail'
            })
        })
        .catch(err => {
            console.log(err);
        })
    
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
    .then((products) => {
        res.render('shop/index', {
            prods: products,
            path: '/',
            pageTitle: 'Home Page'
        });
    })
    .catch(err=>{
        console.log(`shop/index fetchAll error ${err}`);
    });
}

exports.getCart = (req, res, next) => {
    req.user.getCartItems()
    .then(products => {
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Cart',
            products : products.length > 0? products : []
        });
    })

    // const cartProducts = req.user.getCartItems();
    // let _products = [];
    // let _prodIndex;
    // Product.fetchAll()
    // .then(products => {
    //     for(prod of products){
    //         _prodIndex = cartProducts.findIndex(p => p._id.toString() === prod._id.toString())
    //         if(!(_prodIndex < 0 )){                
    //             _products.push({...products[_prodIndex],qty:cartProducts[_prodIndex].qty})
    //         }
    //     }

    //     res.render('shop/cart', {
    //         path: '/cart',
    //         pageTitle: 'Cart',
    //         products : _products
    //     });
    // })
    // .catch(err => {
    //     console.log(`error while fetching all getCart products ${err}`);
    // })  
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    const quantity = req.body.quantity;
    Product.findById(prodId)
        .then(product => {
            //Cart.addProduct(prodId,product.price);
            return req.user.addCartProduct(product._id,quantity)
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(`error while adding product in carts ${err}`);
        })
    
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
    .then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Orders',
            orders : orders
        })
    })
    
}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;
    
    req.user.deleteItemFromCart(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(`error while deleting prodCart item ${err}`);
    })
}

exports.postAddOrder = (req, res, next) => {
    req.user.addOrder()
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => {
        console.log(`error while creating order ${err}`);
    })
}