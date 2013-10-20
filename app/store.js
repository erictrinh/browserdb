var _ = require('underscore');
_.mixin(require('underscore.deferred'));

module.exports = function(objectStoreName) {
  var objectStore = function(db) {
    var transaction = db.transaction([objectStoreName], 'readwrite');
    var store = transaction.objectStore(objectStoreName);
    return store;
  };

  var addRecord = function(record) {

    return connected.then(function(db) {
      var deferred = _.Deferred();

      var store = objectStore(db);

      //Perform the add
      var request = store.add(record);

      request.onerror = function(e) {
        //some type of error handler
        deferred.reject(e.target.error.name);
      };

      request.onsuccess = function() {
        deferred.resolve(record);
      };

      return deferred.promise();
    });

  };

  var replaceRecord = function(primaryKey, record) {

    return connected.then(function(db) {
      var deferred = _.Deferred();

      var store = objectStore(db);

      //Perform the add
      var request = store.put(record, primaryKey);

      request.onerror = function(e) {
        //some type of error handler
        deferred.reject(e.target.error.name);
      };

      request.onsuccess = function() {
        deferred.resolve(record);
      };

      return deferred.promise();
    });

  };

  var isMatch = function(query, object) {
    if (!_.isObject(query)) {
      throw new Error('query must be an object');
    }

    if (_.isEmpty(object)) {
      return true;
    }

    return _.every(_.pairs(query), function(prop) {
      var key = prop[0],
        value = prop[1];

      if (_.isRegExp(value)) {
        return value.test(object[key]);
      }

      if (_.isArray(value)) {
        throw new Error('query cannot be an array');
      }

      if (_.isFunction(value)) {
        return value.call(this, object[key]);
      }

      if (_.isObject(value)) {
        var specials = {
          '$gt': function(a, b) { return a > b; },
          '$gte': function(a, b) { return a >= b; },
          '$lt': function(a, b) { return a < b; },
          '$lte': function(a, b) { return a <= b; }
        };

        return _.every(_.keys(specials), function(specialKey) {
          if (_.has(value, specialKey)) {
            return specials[specialKey](object[key], value[specialKey]);
          } else {
            return true;
          }
        });
      }

      if (_.isArray(object[key])) {
        return _.contains(object[key], value);
      }

      return object[key] === value;
    });
  };

  var constructBounds = function(query, index) {
    if (!query || !index || !_.has(query, index)) {
      return null;
    }

    var queryIndex = query[index],
      $lt = _.has(queryIndex, '$lt'),
      $lte = _.has(queryIndex, '$lte'),
      $gt = _.has(queryIndex, '$gt'),
      $gte = _.has(queryIndex, '$gte'),

      less = $lt || $lte,
      more = $gt || $gte;

    // return a bounded range
    if (less && more) {
      return IDBKeyRange.bound(
        queryIndex[$gt ? '$gt' : '$gte'],
        queryIndex[$lt ? '$lt' : '$lte'],
        $gt, $lt);
    } else {
      // order is important here
      // go from strict condition -> lax
      if ($lt) {
        return IDBKeyRange.upperBound(queryIndex.$lt, true);
      }

      if ($lte) {
        return IDBKeyRange.upperBound(queryIndex.$lte, false);
      }

      if ($gt) {
        return IDBKeyRange.lowerBound(queryIndex.$gt, true);
      }

      if ($gte) {
        return IDBKeyRange.lowerBound(queryIndex.$gte, false);
      }
    }

    return IDBKeyRange.only(query[index]);
  };

  var find = function(query, options) {
    var defaults = {
      index: null,
      limit: null,
      direction: 'next',
      includeKey: false
    };

    var ops = _.extend(defaults, options);

    var index = ops.index;
    var direction = ops.direction;
    var limit = ops.limit;
    var includeKey = ops.includeKey;

    if (query && index) {

      if (_.isRegExp(query[index])) {
        throw new Error('querying index cannot be a regexp');
      }

      if (_.isFunction(query[index])) {
        throw new Error('querying index cannot be a function');
      }

    }

    return connected.then(function(db) {
      var deferred = _.Deferred();

      var results = [];

      var store = index ? objectStore(db).index(index) : objectStore(db);

      var bound = constructBounds(query, index);

      store.openCursor(bound, direction).onsuccess = function(e) {
        var cursor = e.target.result;
        var value;

        if (cursor) {

          value = cursor.value;

          if (isMatch(query || {}, cursor.value)) {

            if (includeKey) {
              value._id = cursor.primaryKey;
            }

            results.push(cursor.value);
          }

          if (_.isNumber(limit) && results.length >= limit) {
            deferred.resolve(results);
          } else {
            cursor.continue();
          }
        } else {
          // done getting all records
          deferred.resolve(results);
        }
      };

      return deferred.promise();
    });

  };

  var findOne = function(query, options) {
    var ops = options || {};
    ops.limit = 1;

    // use find, but unwrap the value from array
    return find.call(this, query, ops).then(function(results) {
      return _.Deferred().resolve(results[0]);
    });
  };

  var update = function(query, record, options) {
    var ops = options || {};
    ops.includeKey = true;

    return findOne.call(this, query, ops).then(function(result) {
      var key = result._id;

      var foundRecord = _.omit(result, '_id');
      record = _.extend(foundRecord, record);

      return replaceRecord(key, record);
    });
  };

  return {
    insert: addRecord,
    find: find,
    findOne: findOne,
    update: update
  };
};
