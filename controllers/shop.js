const Product = require('../models/product');

const User = require('../models/user');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                path: '/',
                pageTitle: 'Home Page',
                isAuthenticated : req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.log(`shop/index fetchAll error ${err}`);
        });
}

exports.getProducts = (req, res, next) => {
    //in this case set automatically the headers to text/html
    //res.send('<h1>Hello from Express</h1>');
    Product.find()
        //.select('title price -_id') 
        // with this i can retrieve ONLY the fields specified here
        //.populate('userId','name') 
        // with this i populate the object with the data of relation (we can even use for example user.userId if we have nested relations)
        // in populate,in the second argument i can ask for some certain field instead of all (ex : 'userId','name')

        .then((products) => {
            console.log(products)
            res.render('shop/product-list', {
                prods: products,
                path: '/products',
                pageTitle: 'Shop',
                isAuthenticated : req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.log(`shop/product-list fetchAll error ${err}`);
        });
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                path: '/products',
                pageTitle: 'Product Detail',
                isAuthenticated : req.session.isLoggedIn
            })
        })
        .catch(err => {
            console.log(err);
        })
}

exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        console.log(user.cart.items);
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Cart',
            products: user.cart.items,
            isAuthenticated : req.session.isLoggedIn
        });
    })
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    const quantity = req.body.quantity;
    Product.findById(prodId)
        .then(product => {
            //Cart.addProduct(prodId,product.price);
            return req.user.addToCart(product, quantity)
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(`error while adding product in carts ${err}`);
        })

}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;

    req.user.removeCartItem(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(`error while deleting prodCart item ${err}`);
    })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        isAuthenticated : req.session.isLoggedIn
    })
}

exports.getOrder = (req, res, next) => {
    Order.find({'user.userId' : req.user})
    .then(orders => {
        console.log(orders)
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Orders',
            orders : orders,
            isAuthenticated : req.session.isLoggedIn
        })
    })

}

exports.addOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: {...i.productId._doc} }
            });

            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            })

            return order.save();
        })
        .then(result => {
            return req.user.clearCart();           
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => {
            console.log(`error while creating order ${err}`);
        })
}