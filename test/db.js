'use strict';
var DB = require('../app/db.js');

describe('DB', function() {
  var db = new DB('test', 1, {
    books: {
      index: {
        barcode: ['unique'],
        tags: ['array'],
        author: []
      }
    },
    users: {
      index: {
        email: ['unique']
      }
    }
  });

  var connected = db.connect();

  describe('schema creation', function() {
    it('should create the object stores', function(done) {
      connected.then(function() {
        var stores = db.stores();
        expect(stores).to.have.length(2);
        done();
      }).fail(done);
    });

    it('should set the names of the object store', function(done) {
      connected.then(function() {
        var stores = db.stores();
        expect(stores).to.contain('books');
        expect(stores).to.contain('users');
        done();
      }).fail(done);
    });
  });

  // describe('schema modification', function() {
  //   it('should delete the user object store', function(done) {
  //     dump('finished db1');
  //     var db2 = new DB('test', 5, {
  //       books: {
  //         index: {
  //           barcode: ['unique'],
  //           tags: ['array'],
  //           author: []
  //         }
  //       }
  //     });

  //     db2.connect().then(function() {
  //       var stores = db.stores();
  //       expect(stores).to.have.length(1);
  //       done();
  //     }).fail(done);
  //   });
  // });

});
