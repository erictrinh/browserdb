'use strict';
/* global _ */

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

    createIndexes(storeSchema.index, objStore);

  });

  function createIndexes(schemaIndex, objStore) {
    _.each(schemaIndex, function(keys, index) {
      var attrs = _.object(_.map(keys, function(key) {
        if (key === 'array') {
          return ['multiEntry', true];
        }

        return [key, true];
      }));

      objStore.createIndex(index, index, attrs);
    });
  }
};

var removeStores = function(db, schema) {
  // delete stores that are not part of the schema
  _.each(db.objectStoreNames, function(storeName) {
    if (!_.contains(_.keys(schema), storeName)) {
      db.deleteObjectStore(storeName);
    }
  });
};

module.exports = function(dbName, dbVersion, schema) {
  var db;

  var connect = function() {
    var deferred = _.Deferred(),
      // every time this is called,
      // a new number bigger than the last is generated
      openRequest = indexedDB.open(dbName, dbVersion);

    // this gets run every time we open a connection
    openRequest.onupgradeneeded = function(e) {
      db = e.target.result;
      addStores(db, schema);
      removeStores(db, schema);
    };

    openRequest.onsuccess = function(e) {
      db = e.target.result;

      db.onversionchange = function() {
        db.close();
      };
      deferred.resolve(db);
    };

    openRequest.onerror = function(e) {
      console.log(e.target.error);
      //Do something for the error
      deferred.reject(new Error('could not connect db'));
    };

    return deferred.promise();
  };

  var close = function() {
    var deferred = _.Deferred();

    if (db && _.isFunction(db.close)) {
      db.close();
    }

    _.defer(function() {
      deferred.resolve();
    });

    return deferred.promise();
  };

  var store = require('./store.js');

  var listStores = function() {
    return _.toArray(db.objectStoreNames);
  };

  return {
    connect: connect,
    close: close,
    store: store,
    stores: listStores
  };
};
