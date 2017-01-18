var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var ObjectID = require('mongodb').ObjectID;
var db = mongo.db(config.connectionString, {
  native_parser: true
});
db.bind('usecases');
db.bind('fs');


//mongoose
var mongoose = require('mongoose');
mongoose.connect(config.connectionString);

var models = require('./schemas.db.js')(mongoose); //http://stackoverflow.com/questions/9960486/defining-mongoose-models-in-separate-module



var service = {};

service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.deleteAllUseCases = _deleteAllUseCases;
service.getAll = getAll;
service.getFSs = getFSs;
service.duplicate = duplicate;

module.exports = service;

function getAll() {

  var deferred = Q.defer();

  models.UseCases.find(function(err, usecases) {

    if (err) deferred.reject(err.name + ': ' + err.message);

    if (usecases) {
      deferred.resolve(usecases);

      //return entries;
    } else {
      deferred.resolve();
    }

  });

  return deferred.promise;

  // 
  // db.usecases.find().toArray(function(err, result) {
  //
  //   if (err) deferred.reject(err.name + ': ' + err.message);
  //
  //   if (result) {
  //     deferred.resolve(result);
  //     //return entries;
  //   } else {
  //     deferred.resolve();
  //   }
  // });
  //
  // return deferred.promise;
}

function getById(_id) {
  var deferred = Q.defer();

  console.log("getting usecase from DB with ID: " + _id);

  models.UseCases.findOne({"_id": _id}, function(err, usecases) {

    if (err) deferred.reject(err.name + ': ' + err.message);

    if (usecases) {
      deferred.resolve(usecases);
      //return entries;
    } else {
      deferred.resolve();
    }
  });


  // db.usecases.findById(_id, function(err, usecase) {
  //   if (err) deferred.reject(err.name + ': ' + err.message);

  //   if (usecase) {
  //     // return user (without hashed password)
  //     deferred.resolve(_.omit(usecase, 'hash'));
  //   } else {
  //     // user not found
  //     deferred.resolve();
  //   }
  // });

  return deferred.promise;
}

function getFSs(_id) {

  var deferred = Q.defer();

  db.usecases.findById(_id, function(err, usecase) {
    if (err) deferred.reject(err.name + ': ' + err.message);

    if (usecase) {
      //now get the actual FS with the IDs

      console.log("getting functions from DB with usecase ID: " + usecase._id +
        " and got linked FS: " + usecase.linkedFS);

      if (usecase.linkedFS) {
        var objIDs = [];

        for (var i = 0; i < usecase.linkedFS.length; i++) {
          console.log("converting id " + usecase.linkedFS[i]);
          objIDs.push(new ObjectID(usecase.linkedFS[i]));
        }


        db.fs.find({
          _id: {
            $in: objIDs
          }
        }).toArray(function(err, funcs) {

          deferred.resolve(funcs);
        });
      }

    } else {
      // no linked fs
      console.log("no linked fs to usecase " + _id);
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function duplicate(usecase) {
  var deferred = Q.defer();

  usecase._id = new ObjectId();

  db.usecases.insert(
    usecase,
    function(err, doc) {
      if (err) {
        deferred.reject(err.name + ': ' + err.message);
      }

      deferred.resolve(usecase);
      //break;
    });
}

function create(userParam) {
  var deferred = Q.defer();

  // validation
  db.usecases.findOne({
      usecasename: userParam.usecasename
    },
    function(err, usecase) {
      if (err) deferred.reject(err.name + ': ' + err.message);

      if (usecase) {
        // username already exists
        deferred.reject('usecase "' + userParam.usecasename +
          '" is already taken');
      } else {
        createUseCase();
      }
    });

  function createUseCase() {

    console.log("in createUseCase");

    // models.UseCases.find({}).sort({hid: -1}).limit(1).toArray(function (err, cursor){
    //   var myFirstDocument = cursor[0]; //cursor.hasNext() ? cursor.next() : null;

    //   var nextHID = -1;
    //   if (myFirstDocument != null && !isNaN(myFirstDocument.hid)) {
    //     console.log("current last usecase is: " + myFirstDocument.usecasename +
    //       " with id: " + myFirstDocument.hid);
    //     nextHID = myFirstDocument.hid + 1;
    //   } else {
    //     console.log("no number or entry");
    //     nextHID = 1;
    //   }

    //   usecase.hid = nextHID;
    //   console.log("created new HID:" + nextHID);

    //   if (usecase.version == null) {
    //     usecase.version = '1';
    //   }

    //   db.usecases.insert(
    //     usecase,
    //     function(err, doc) {
    //       if (err) {
    //         deferred.reject(err.name + ': ' + err.message);
    //       }

    //       deferred.resolve();
    //       //break;
    //     });
    // });







    db.usecases.find({}).sort({
      hid: -1
    }).limit(1).toArray(function(err, cursor) {

      var myFirstDocument = cursor[0]; //cursor.hasNext() ? cursor.next() : null;

      var nextHID = -1;
      if (myFirstDocument != null && !isNaN(myFirstDocument.hid)) {
        //console.log("document is: " + myFirstDocument);
        console.log("current last usecase is: " + myFirstDocument.usecasename +
          " with id: " + myFirstDocument.hid);
        nextHID = myFirstDocument.hid + 1;
      } else {
        console.log("no number or entry");
        nextHID = 1;
      }

      usecase.hid = nextHID;
      console.log("created new HID:" + nextHID);

      if (usecase.version == null) {
        usecase.version = '1';
      }

      db.usecases.insert(
        usecase,
        function(err, doc) {
          if (err) {
            deferred.reject(err.name + ': ' + err.message);
          }

          deferred.resolve();
          //break;
        });
    });
  }

  return deferred.promise;
}

function update(_id, userParam) {
  var deferred = Q.defer();
  // fields to update
  var set = {
    usecasename: userParam.usecasename,
    description: userParam.description,
    categories: userParam.categories,
    linkedFS: userParam.linkedFS,
    tags: userParam.tags,
    version: userParam.version,
  };

  // // update password if it was entered
  // if (userParam.password) {
  //     set.hash = bcrypt.hashSync(userParam.password, 10);
  // }

  db.usecases.update({
      _id: mongo.helper.toObjectID(_id)
    }, {
      $set: set
    },
    function(err, doc) {
      if (err) deferred.reject(err.name + ': ' + err.message);

      deferred.resolve();
    });

  return deferred.promise;
};

function _delete(_id) {
  var deferred = Q.defer();

  db.usecases.remove({
      _id: mongo.helper.toObjectID(_id)
    },
    function(err) {
      if (err) deferred.reject(err.name + ': ' + err.message);

      deferred.resolve();
    });

  return deferred.promise;
}

function _deleteAllUseCases(userid) {

  var deferred = Q.defer();

  console.log("deleting usecase from db level");

  db.usecases.remove({}, function(err) {
    if (err) deferred.reject(err.name + ': ' + err.message);

    deferred.resolve();
  });

  return deferred.promise;
}
