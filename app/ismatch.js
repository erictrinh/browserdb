'use strict';
/* global _ */

module.exports = function(query, record) {
  if (!_.isObject(query)) {
    throw new Error('query must be an object');
  }

  if (_.isEmpty(record)) {
    return true;
  }

  return _.every(_.pairs(query), function(prop) {
    var key = prop[0],
      value = prop[1];

    if (_.isRegExp(value)) {
      return value.test(record[key]);
    }

    if (_.isArray(value)) {
      // checks if query is a subset of the record value
      return _.every(value, function(valElem) {
        return _.contains(record[key], valElem);
      });
    }

    if (_.isFunction(value)) {
      return value.call(this, record[key]);
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
          return specials[specialKey](record[key], value[specialKey]);
        } else {
          return true;
        }
      });
    }

    if (_.isArray(record[key])) {
      return _.contains(record[key], value);
    }

    return record[key] === value;
  });
};
