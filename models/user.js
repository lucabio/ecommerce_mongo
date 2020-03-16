const mongoDb = require('mongodb');

const getDb = require('../util/database').getDb;

const ObjectId = mongoDb.ObjectID;

const collection = () => {
    const db = getDb();
    const prodCollection = db.collection('user');
    return prodCollection;
}

class User {
    constructor(id, email, password, isAdmin, cart) {
        this._id = id ? id : null;
        this.email = email;
        this.password = password;
        this.admin = isAdmin;
        this.cart = cart ? cart : { products: [] };
    }

    save() {
        return collection()
            .insertOne(this)
            .then(result => {
                console.log('User create successfully');
            })
            .catch(err => {
                console.log(`error on user creation ${err}`);
            })
    }

    static fetch(query) {
        const _q = query ? query : {};
        return collection()
            .find(_q)
            .next()
            .then(users => {
                return users;
            })
            .catch(err => {
                return err;
            })
    }

    static findById(userId) {
        return collection().findOne({ _id: ObjectId(userId) });
    }

    addCartProduct(productId, qty) {
        //check if user has already the same product in the cart embedded document
        let updatedProducts = [...this.cart.products];

        const updatedProdIndex = this.cart.products.findIndex(p => p._id.toString() === productId.toString());
        if (updatedProdIndex === -1) {
            updatedProducts.push({_id: new ObjectId(productId), qty: +qty})
        } else {
            // product IS present,adjust only quantity field
            updatedProducts[updatedProdIndex].qty = +qty + +updatedProducts[updatedProdIndex].qty;
        }

        //this.cart.products.push(updatedProducts);

        return collection()
            .updateOne({ _id: ObjectId(this._id) }, { $set: { cart: { products: updatedProducts } } })
            .then(result => {
                return result;
            })
            .catch(err => {
                return err;
            })
    }

    getCartItems() {
        //return this.cart.products;
        const db = getDb();
        let productIds = [];
        if (this.cart) {
            productIds = this.cart.products.map(p => {
                return p._id;
            })
        }

        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        qty: this.cart.products.find(i => {
                            return i._id.toString() === p._id.toString()
                        }).qty
                    }
                });

            })
            .catch(err => {
                return err;
            })



    }

    deleteItemFromCart(productID) {
        var cartProducts = this.cart.products.filter(p => p._id.toString() !== productID.toString());
        return collection()
            .updateOne({ _id: this._id }, { $set: { cart: { products: cartProducts } } })
            .then(result => {
                return result;
            })
            .catch(err => {
                return err;
            })
    }

    addOrder() {
        const db = getDb();
        return this.getCartItems()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new ObjectId(this._id),
                        name: this.email
                    }
                }
                return db.collection('orders').insertOne(order)
            })
            .then(result => {
                this.cart = { products: [] };
                return collection()
                    .updateOne(
                        { _id: new ObjectId(this._id) },
                        { $set: { cart: { products: [] } } }
                    )
            })
            .catch(err => {
                return err;
            })
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
            .find({'user._id': new ObjectId(this._id)})
            .toArray()
            .then(order => {
                return order;
            })
            .catch(err => {
                return err;
            })
    }
}

module.exports = User;