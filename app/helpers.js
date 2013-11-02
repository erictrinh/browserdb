'use strict';
/* global _ */

// some utility functions
// times an async operation returning a promise
exports.time = function(promise) {
  var now = Date.now();

  promise.then(function(records) {
    var diff = Date.now() - now;
    console.log('That took ' + diff +
      ' ms and returned ' + records.length + ' records');
  });

  return promise;
};

// logs the result of a promise
exports.log = function(promise) {
  promise.then(function(result) {
    console.log(result);
  });

  return promise;
};

exports.logTime = _.compose(window.time, window.log);
