var DB = require('../app/db.js');

describe('DB', function() {
  var db = new DB('test', {
    books: {
      index: {
        barcode: ['unique'],
        tags: ['array'],
        author: []
      }
    }
  });

  var connected = db.connect();

  describe('#connect()', function() {
    it('should connect the database', function(done) {
      connected.then(function(db) {
        done();
      }).fail(done);
    });
  });

  describe('schema creation', function() {
    it('should create the object stores', function(done) {
      connected.then(function() {
        var stores = db.stores();
        expect(stores).to.have.length(1);
        done();
      }).fail(done);
    });

    it('should set the name of the object store', function(done) {
      connected.then(function() {
        var stores = db.stores();
        expect(stores).to.contain('books');
        done();
      }).fail(done);
    });
  });

});
