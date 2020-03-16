const fs = require('fs');

const path = require('path');

const Product = require('./product');

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports = class Cart {
    // constructor (){
    //     this.products = [];
    //     this.totalPrice = 0;
    // }

    static addProduct(id, productPrice) {
        // fetch cart(previous eventually)
        // Analyze the cart => find existing product
        // ad new product / increase quantity
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            const existingProdIndex = cart.products.findIndex(p => p.id === id);
            const existingProd = cart.products[existingProdIndex];
            let updatedProd;
            if (existingProd) {
                updatedProd = { ...existingProd };
                updatedProd.quantity = updatedProd.quantity + 1;
                cart.products[existingProdIndex] = updatedProd;
            } else {
                updatedProd = {
                    id: id,
                    quantity: 1
                };
                cart.products = [...cart.products, updatedProd];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err => {
                if (err)
                    console.log(`error while writing cart file ${err}`);
            }))
        })
    }

    static deleteProduct(id, productPrice,cb) {
        fs.readFile(p, (err, fileContent) => {
            let cart;
            if (err) {
                return;
            }
            cart = JSON.parse(fileContent);
            const updatedCart = { ...cart };
            const cartProduct = updatedCart.products.find(p => p.id === id);
            if(!cartProduct){
                return;
            }
            const quantity = cartProduct.quantity;
            updatedCart.totalPrice = updatedCart.totalPrice - +productPrice * quantity;
            updatedCart.products = updatedCart.products.filter(p => p.id !== id);
            
            fs.writeFile(p, JSON.stringify(updatedCart), (err => {
                if (err){
                    console.log(`error while writing cart file ${err}`);
                }else{
                    cb();
                }
                    
            }));
        })
    }

    static getCart(cb){
        fs.readFile(p, (err, fileContent) => {
            let cart;
            if(!err){
                cart = JSON.parse(fileContent);
                cb(cart);
            }
        })
    }
}