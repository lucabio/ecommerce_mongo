const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    //in this case set automatically the headers to text/html
    //res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">Send</button></form>');
    //res.sendFile(path.join(routeDir, 'views', 'add-product.html'));
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
};

exports.postAddProduct = (req, res, next) => {
    const data = req.body;
    const product = new Product(
        data.title,
        data.description,
        data.imageUrl,
        data.price,
        null,
        req.user._id
        );
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
    if(!editMode){
        res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product =>{
        if(!product){
            res.redirect('/');
        }else{
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/add-product',
                editing : editMode,
                product : product
            })
        }
    })
    .catch(err => {
        console.log(`edit product error ${err}`);
    })
};

exports.postEditProduct = (req, res, next) => {
    const data = req.body;
    const product = new Product(
        data.title,
        data.description,
        data.imageUrl,
        data.price,
        data.id
        );
    product.save()
    .then(res.redirect('/admin/products'))
    .catch(err => {
        console.log(`save error ${err}`)
    });
    
};

exports.getProductList = (req, res, next) => {
    Product.fetchAll()
    .then(products => {
        res.render('admin/products', {
            pageTitle: 'Admin Products List',
            path: '/admin/products',
            prods : products
        })
    })
    .catch(err => {
        console.log(`fetch all adminProducts error ${err}`);    
    })
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId)
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(`delete product error ${err}`);
    });
}