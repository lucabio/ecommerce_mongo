const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                require: true
            }
        }]
    }
})
//we should use that sintax (= function()) so we can use 'this' reference
userSchema.methods.addToCart = function (product, qty) {

    //check if user has already the same product in the cart embedded document
    let updatedProducts = [...this.cart.items];

    const updatedProdIndex = this.cart.items.findIndex(p => p.productId.toString() === product._id.toString());
    if (updatedProdIndex === -1) {
        updatedProducts.push(
            {
                productId: product._id,
                quantity: +qty
            })
    } else {
        // product IS present,adjust only quantity field
        updatedProducts[updatedProdIndex].quantity = +qty + +updatedProducts[updatedProdIndex].quantity;
    }

    this.cart.items = updatedProducts;

    return this.save()
}

userSchema.methods.getCartItems = function () {
    let productIds = [];
    if (this.cart) {
        productIds = this.cart.items.map(p => {
            return p.productId;
        })
    }
    return productIds;
}

userSchema.methods.removeCartItem = function (productId) {

    const cartProducts = this.cart.items.filter(p => p.productId._id.toString() !== productId.toString());

    this.cart.items = cartProducts;

    return this.save();

}

userSchema.methods.clearCart = function(){
    this.cart = {items : []};
    return this.save();
}

module.exports = mongoose.model('User', userSchema);