var _ = require('underscore');
_.mixin(require('underscore.deferred'));

var addStores = function(db, schema) {
  // set up schema for db
  _.each(schema, function(storeSchema, storeName) {

    if (db.objectStoreNames.contains(storeName)) {
      return;
    }

    var auto;

    if (storeSchema.key) {
      auto = { keyPath: storeSchema.key };
    } else {
      auto = { keyPath: '_id', autoIncrement: true };
    }

    var objStore = db.createObjectStore(storeName, {
      autoIncrement: true
    });

    _.each(storeSchema.index, function(keys, index) {
      var attrs = _.object(_.map(keys, function(key) {
        if (key === 'array') {
          return ['multiEntry', true];
        }

        return [key, true];
      }));

      objStore.createIndex(index, index, attrs);
    });

  });
};

var removeStores = function(db, schema) {
  // delete stores that are not part of the schema
  _.each(db.objectStoreNames, function(storeName) {
    if (!_.contains(_.keys(schema), storeName)) {
      db.deleteObjectStore(storeName);
    }
  });
};

module.exports = function(dbName, schema) {
  var db;

  var connect = function() {
    var deferred = _.Deferred(),
      openRequest = indexedDB.open(dbName, Date.now());

    // this gets run every time we open a connection
    openRequest.onupgradeneeded = function(e) {
      db = e.target.result;
      addStores(db, schema);
      removeStores(db, schema);
    };

    openRequest.onsuccess = function(e) {
      db = e.target.result;
      deferred.resolve(db);
    };

    openRequest.onerror = function(e) {
      //Do something for the error
      deferred.reject(e);
    };

    return deferred.promise();
  };

  var store = require('./store.js');

  var listStores = function() {
    return _.toArray(db.objectStoreNames);
  };

  return {
    connect: connect,
    store: store,
    stores: listStores
  };
};