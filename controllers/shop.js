const Product = require('../models/product');

const User = require('../models/user');
const Order = require('../models/order');

const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    //pagination
    Product.countDocuments().then(prodNumber => {
        totalItems = prodNumber;
        return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
    }).then((products) => {
        res.render('shop/index', {
            prods: products,
            path: '/',
            pageTitle: 'Home Page',
            currentPage : page,
            hasNextPage : ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage : page > 1,
            nextPage : page + 1,
            previousPage : page - 1,
            lastPage : Math.ceil(totalItems / ITEMS_PER_PAGE) 
        });
    })
    .catch(err => {
        const error = new Error();
        error.httpStatusCode = 500;
        error.message = err;
        return next(error);
    });
}

exports.getProducts = (req, res, next) => {
    //in this case set automatically the headers to text/html
    //res.send('<h1>Hello from Express</h1>');
    const page = +req.query.page || 1;
    let totalItems;
    //pagination
    Product.countDocuments().then(prodNumber => {
        totalItems = prodNumber;
        return Product.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
    })
    .then((products) => {
        res.render('shop/product-list', {
            prods: products,
            path: '/products',
            pageTitle: 'Home Page',
            currentPage : page,
            hasNextPage : ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage : page > 1,
            nextPage : page + 1,
            previousPage : page - 1,
            lastPage : Math.ceil(totalItems / ITEMS_PER_PAGE) 
        });
    })
    .catch(err => {
        const error = new Error();
        error.httpStatusCode = 500;
        error.message = err;
        return next(error);
    });
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                path: '/products',
                pageTitle: 'Product Detail'
            })
        })
        .catch(err => {
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
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
                products: user.cart.items
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
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
        })

}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;

    req.user.removeCartItem(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
        })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}

exports.getOrder = (req, res, next) => {
    Order.find({ 'user.userId': req.user })
        .then(orders => {
            console.log(orders)
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders
            })
        })

}

exports.addOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } }
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
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
        })
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('Order not found.'))
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Not Authorized.'))
        } else {
            const invoiceName = 'invoice-' + orderId + '.pdf';

            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();

            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(20);
            pdfDoc.text('Invoice', { underline: true });

            pdfDoc.text('-------------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
                totalPrice += prod.quantity * prod.product.price;
            });

            pdfDoc.text('Total Price :' + totalPrice + '$');

            pdfDoc.end();
        }
    }).catch(err => {
        return next(err);
    });
}