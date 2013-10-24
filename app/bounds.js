'use strict';
/* global _, IDBKeyRange */

module.exports = function(query, index) {
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
