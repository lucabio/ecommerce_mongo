const Product = require('../models/product');

const {validationResult} = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError : false,
        errorMessage: null,
        validationErrors: [],
        product: {
            title: '',
            imageUrl: '',
            price : '',
            description: ''
        }
    })
};

exports.postAddProduct = (req, res, next) => {
    const data = req.body;
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            errorMessage: errors.array()[0].msg,
            hasError : true,
            product : {
                title: data.title,
                imageUrl: data.imageUrl,
                price : data.price,
                description: data.description
            },
            validationErrors: errors.array(),
            editing: false,
        })

    }

    const product = new Product({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        // userId : req.user._id --> instead
        userId : req.user // --> we use the entire user obj and mongoose will pick the _id automatically due to the relation between user and product
    });
    product.save()
        .then(res.redirect('/'))
        .catch(err => {
            console.log(`postAddproduct error ${err}`);
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
                    hasError:false,
                    validationErrors:[],
                    errorMessage: null,
                })
            }
        })
        .catch(err => {
            console.log(`edit product error ${err}`);
        })
};

exports.postEditProduct = (req, res, next) => {
    const data = req.body;

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/add-product',
            errorMessage: errors.array()[0].msg,
            hasError : true,
            product : {
                title: data.title,
                imageUrl: data.imageUrl,
                price : data.price,
                description: data.description,
                _id : data.id
            },
            validationErrors: errors.array(),
            editing: true,
        })

    }
    
    Product.findById(data.id)
    .then(product => {
        console.log(product);
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        console.log(product);
        product.title = data.title;
        product.description = data.description;
        product.imageUrl = data.imageUrl;
        product.price = data.price;

        return product.save().then(result => {
            console.log('product updated' + result);
            res.redirect('/admin/products')
        });
    })
    .catch(err => {
        console.log('error while update ' + err);
    })
};

exports.getProductList = (req, res, next) => {
    //added authorization to allow only the user that created the item to edit or delete it
    Product.find({userId : req.user._id})
        .then(products => {
            res.render('admin/products', {
                pageTitle: 'Admin Products List',
                path: '/admin/products',
                prods: products
            })
        })
        .catch(err => {
            console.log(`fetch all adminProducts error ${err}`);
        })
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id : prodId,userId : req.user._id})
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(`delete product error ${err}`);
    });
}