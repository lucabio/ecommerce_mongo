const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
};

exports.postAddProduct = (req, res, next) => {
    const data = req.body;
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
                    product: product
                })
            }
        })
        .catch(err => {
            console.log(`edit product error ${err}`);
        })
};

exports.postEditProduct = (req, res, next) => {
    const data = req.body;

    Product.findById(data.id)
    .then(product => {
        product.title = data.title;
        product.description = data.description;
        product.imageUrl = data.imageUrl;
        product.price = data.price;

        return product.save();
    })
    .then(result => {
        console.log('product updated' + result);
        res.redirect('/admin/products')
    })
    .catch(err => {
        console.log('error while update ' + err);
    })
};

exports.getProductList = (req, res, next) => {
    Product.find()
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
    Product.findByIdAndRemove(prodId)
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(`delete product error ${err}`);
    });
}