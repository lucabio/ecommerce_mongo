const MongoClient = require('mongodb').MongoClient;

const constants = require('./constants');

let _db;

const mongoConnect = (callback) => {
    
    const uri = "mongodb+srv://"+constants.mongoDBUser+":"+constants.mongoDBPassword+"@cluster0-eghqb.mongodb.net/shop?retryWrites=true&w=majority";
    
    const client = new MongoClient(uri, { useNewUrlParser: true });

    client.connect()
        .then(client => {
            _db = client.db();
            callback()
        })
        .catch(err => {
            console.log(`mongoDB connection Error : ${err}`);
            throw err;
        });
}

const getDb = () =>{
    if(_db){
        return _db;
    }else{
        throw 'No Database Found!';
    }
}

module.exports.mongoConnect = mongoConnect;
module.exports.getDb = getDb;