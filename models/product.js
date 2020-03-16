const mongoDb = require('mongodb');

const getDb = require('../util/database').getDb;

const collection = () => {
    const db = getDb();
    const prodCollection = db.collection('products');
    return prodCollection;
}

class Product {
    constructor(title, desc, imageUrl, price, id, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = desc;
        this.price = price;
        this._id = id ? new mongoDb.ObjectID(id) : null;
        this.userId = userId;
    }

    save() {
        let dbOps;
        if (!this._id) {
            //inserting new product
            dbOps = collection().insertOne(this)
        } else {
            dbOps = collection().updateOne({ _id: this._id }, { $set: this })
        }

        return dbOps.then(result => {
            return result;
        })
            .catch(err => {
                throw err;
            });

    }

    static fetchAll() {
        return collection().find({})
            .toArray()
            .then(products => {
                return products;
            })
            .catch(err => {
                throw err;
            });
    }

    static findById(id) {
        const prodId = id;
        return collection()
            .find({ _id: new mongoDb.ObjectID(prodId) })
            .next()
            .then(product => {
                return product;
            })
            .catch(err => {
                throw err;
            });
    }

    static deleteById(id){
        const prodId = id;
        return collection()
        .deleteOne({_id : new mongoDb.ObjectID(prodId)})
        .then(()=>{return})
        .catch(err => {
            throw err;
        })
    }
}

module.exports = Product;