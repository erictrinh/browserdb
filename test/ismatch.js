var isMatch = require('../app/ismatch.js');

describe('Matcher', function() {

  describe('empty query', function() {
    it('should match any number', function() {
      var query = {};

      var match = isMatch(query, {
        a: 123
      });

      expect(match).to.be.true;
    });

    it('should match any string', function() {
      var query = {};

      var match = isMatch(query, {
        a: 'blah blah blah'
      });

      expect(match).to.be.true;
    });

    it('should match any object', function() {
      var query = {};

      var match = isMatch(query, {
        a: new Date()
      });

      expect(match).to.be.true;
    });
  });

  describe('regexp query', function() {
    it('should accept regex matches', function() {
      var query = {
        a: /^abc/
      };

      var match = isMatch(query, {
        a: 'abcdef'
      });

      expect(match).to.be.true;
    });

    it('should reject bad regex matches', function() {
      var query = {
        a: /^abc$/
      };

      var match = isMatch(query, {
        a: 'abcdef'
      });

      expect(match).to.be.false;
    });
  });

  describe('function query', function() {
    var startsWithA = function(str) { return str.substr(0, 1) === 'a'; };

    it('should accept function query', function() {
      var query = {
        a: startsWithA
      };

      var match = isMatch(query, {
        a: 'abcdef'
      });

      expect(match).to.be.true;
    });

    it('should reject bad function query', function() {
      var query = {
        a: startsWithA
      };

      var match = isMatch(query, {
        a: 'bcdef'
      });

      expect(match).to.be.false;
    });
  });

  describe('lt/gt query', function() {
    var lt = {
      a: { $lt: 5 }
    };

    it('should accept lesser values', function() {
      var query = lt;

      var match = isMatch(query, {
        a: 4
      });

      expect(match).to.be.true;
    });

    it('should reject larger values', function() {
      var query = lt;

      var match = isMatch(query, {
        a: 5
      });

      expect(match).to.be.false;
    });

    var gt = {
      a: { $gt: 5 }
    };

    it('should accept larger values', function() {
      var query = gt;

      var match = isMatch(query, {
        a: 6
      });

      expect(match).to.be.true;
    });

    it('should reject smaller values', function() {
      var query = gt;

      var match = isMatch(query, {
        a: 5
      });

      expect(match).to.be.false;
    });
  });

  describe('queries against an array', function() {
    var query = {
      a: 5
    };

    it('should match values within an array', function() {
      var match = isMatch(query, {
        a: [1, 2, 3, 4, 5]
      });

      expect(match).to.be.true;
    });

    it('should not match values in array', function() {
      var match = isMatch(query, {
        a: [1, 2, 3, 4]
      });

      expect(match).to.be.false;
    });
  });

  describe('queries with array', function() {
    var query = {
      a: [1, 2, 3]
    };

    it('should test for subset', function() {
      var match = isMatch(query, {
        a: [1, 2, 3, 4, 5]
      });

      expect(match).to.be.true;
    });

    it('should not match when not a subset', function() {
      var match = isMatch(query, {
        a: [1, 3, 5]
      });

      expect(match).to.be.false;
    });
  });

});
