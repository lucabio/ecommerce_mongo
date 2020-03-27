const Product = require('../models/product');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        product: {
            title: '',
            imageUrl: '',
            price: '',
            description: ''
        }
    })
};

exports.postAddProduct = (req, res, next) => {
    const data = req.body;
    const image = req.file;
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            errorMessage: errors.array()[0].msg,
            hasError: true,
            product: {
                title: data.title,
                price: data.price,
                description: data.description
            },
            validationErrors: errors.array(),
            editing: false,
        })

    }

    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            errorMessage: 'Attached file is not an image',
            hasError: true,
            product: {
                title: data.title,
                price: data.price,
                description: data.description
            },
            validationErrors: [],
            editing: false,
        })
    }

    const product = new Product({
        title: data.title,
        description: data.description,
        imageUrl: image.path,
        price: data.price,
        // userId : req.user._id --> instead
        userId: req.user // --> we use the entire user obj and mongoose will pick the _id automatically due to the relation between user and product
    });
    product.save()
        .then(result => {
            console.log('Inserted Product');
            res.redirect('/')
        })
        .catch(err => {
            // req.flash('error', err);
            // res.redirect('/500')
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
        })
};

exports.getEditProduct = (req, res, next) => {
    //in this case set automatically the headers to text/html
    //res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">Send</button></form>');
    //res.sendFile(path.join(routeDir, 'views', 'add-product.html'));
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                res.redirect('/');
            } else {
                res.render('admin/edit-product', {
                    pageTitle: 'Edit Product',
                    path: '/admin/add-product',
                    editing: editMode,
                    product: product,
                    hasError: false,
                    validationErrors: [],
                    errorMessage: null,
                })
            }
        })
        .catch(err => {
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
        })
};

exports.postEditProduct = (req, res, next) => {
    const data = req.body;
    const image = req.file;
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/add-product',
            errorMessage: errors.array()[0].msg,
            hasError: true,
            product: {
                title: data.title,
                price: data.price,
                description: data.description,
                _id: data.id
            },
            validationErrors: errors.array(),
            editing: true,
        })
    }

    Product.findById(data.id)
        .then(product => {
            console.log(product);
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            console.log(product);
            product.title = data.title;
            product.description = data.description;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            product.price = data.price;

            return product.save().then(result => {
                console.log('product updated' + result);
                res.redirect('/admin/products')
            });
        })
        .catch(err => {
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
        })
};

exports.getProductList = (req, res, next) => {
    //added authorization to allow only the user that created the item to edit or delete it
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render('admin/products', {
                pageTitle: 'Admin Products List',
                path: '/admin/products',
                prods: products
            })
        })
        .catch(err => {
            const error = new Error();
            error.httpStatusCode = 500;
            error.message = err;
            return next(error);
        })
};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (product) {
                fileHelper.deleteFile(product.imageUrl);
                return Product.deleteOne({ _id: prodId, userId: req.user._id })
            } else {
                return next(new Error('no product found'));
            }
        })
        .then(() => {
            res.status(200).json({ message: 'product delect correctly' })
            //res.redirect('/admin/products');
        })
        .catch(err => {
            // const error = new Error();
            // error.httpStatusCode = 500;
            // error.message = err;
            // return next(error);
            res.status(500).json({ message: 'error while deleting product' })
        })
}