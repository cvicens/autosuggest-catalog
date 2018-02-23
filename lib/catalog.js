var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var port = process.env.DB_PORT || 27017;
var host = process.env.DB_HOST || '0.0.0.0';

const user = process.env.MONGODB_USER || 'mongo';
const password = process.env.MONGODB_PASSWORD || 'xR5T6543gF';
const admin_password = process.env.MONGODB_ADMIN_PASSWORD || 'yT5Tht43WF';
const database = process.env.MONGODB_DATABASE || 'mydb';

const productsCollectionName = process.env.MONGODB_PRODUCTS_COLLECTION_NAME || 'products';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const mongoUrl = 'mongodb://' + host + ':' + port;

function getCollection (db, collectionName) {
  return new Promise(function(resolve, reject) {
    console.log('getCollection', db, collectionName);
    db.collection(collectionName, function(err, collection) {
      console.log('db.collection', err, collection);
      if (err) {
        reject(err);
      } else {
        resolve(collection);
      }
    });
  });
}

function searchProduct (db, collection, term) {
  console.log('searchProduct', db, term);
  return new Promise(function(resolve, reject) {
    if (typeof db === 'undefined' || typeof collection === 'undefined' || typeof term === 'undefined') {
      reject({err: 'Wrong parameters in searchProduct'});
      return;
    }

    collection.find({'name': new RegExp(term, 'i') }).toArray(function(err, items) {
      console.log('collection.find', err, items);
      if (err) {
        reject(err);
      } else {
        resolve(items);
      }
    });
  });
}

function route() {
  var router = new express.Router();
  router.use(cors());
  router.use(bodyParser());

  router.get('/', function(req, res) {
    console.log(new Date(), 'In catalog route GET / req.query=', req.query);
    var world = req.query && req.query.hello ? req.query.hello : 'World';

    // see http://expressjs.com/4x/api.html#res.json
    res.json({msg: 'Hello ' + world});
  });

  // Use connect method to connect to the server
  MongoClient.connect(mongoUrl, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(database);

    router.post('/', function(req, res) {
      console.log(new Date(), 'In catalog route POST / req.body=', req.body);
      var term = req.body && req.body.term ? req.body.term : '';
  
      getCollection(db, productsCollectionName)
      .then((collection) => {
        return searchProduct(db, collection, term);
      })
      .then((items) => {
        res.status(200).json(items);
      })
      .catch((err) => {
        res.status(500).json({result:'ERROR', msg: err})
      });
    });
  });

  

  return router;
}

module.exports = route;
