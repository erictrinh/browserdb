# BrowserDB

BrowserDB is a saner API for indexedDB. It abstracts the tedious details of transactions and DB schema changes so that you can be more productive using indexedDB. BrowserDB uses promises for async flow control.

One of the goals of BrowserDB is also to supplement indexedDB's relatively weak querying abilities. BrowserDB uses a Mongo-inspired querying syntax that makes queries concise yet powerful.

## Defining a schema

BrowserDB uses a declarative syntax for defining databases and their object stores. You declare a schema for a database upon initialization:

    var db = new DB('library', {
      books: {
        keypath: 'barcode',
        index: {
          barcode: ['unique'],
          tags: ['array'],
          author: []
        }
      }
    });

Here, `library` is the name of our database, and `books` is the name of our object store. You can think of an object store as a place where we can store a collection of Javascript objects. We can specify several things about our object store: its `keypath` and any `index`es we wish to use.

The keypath is a unique identifier that the database will use when storing and retrieving documents. In this case, we're using the barcode, because we're fairly sure individual books within our collection will have unique barcodes. Keep in mind that specifying a keypath means that every object that you store must have this key. Specifying a keypath is optional. If you don't specify a keypath, a keypath of `_id` will be used, and autoincremented when you add a new record.

The `index` key is used to determine which properties of our document we would like to index. Here, we're indexing `barcode`, `tags`, and `author`. Each index has as its value an array which specifies several things about the index. Including `unique` means that the database will enforce a uniqueness constraint on that property for us. Specifying `array` means that we know that property will be an array, and that we may later want to search for individual elements inside that array. For example, here we have a `tags` property that each book will have. Tags could be something like `['fav', 'scifi']`, and we may later want to search for all books with the tag 'fav.' Technically speaking, specifying `array` will cause indexedDB to add a new record to the index for each element in the array.

## Accessing a store

Most of your interactions with indexedDB will involve accessing object stores and reading/writing from/to them. Accessing a store is simple in BrowserDB:

    // db is defined above
    var store = db.store('books');

Now you can query the store:

    store.find({ author: 'Douglas Crockford' }).then(function(results) {
      console.log(results);
    });

`store.find()` actually returns a promise, so you have to attach `.then` or `.done` to use the results.

## Querying in depth

More later...
