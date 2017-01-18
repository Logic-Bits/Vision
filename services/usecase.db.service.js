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
if (mongoose.connection.readyState != 1) // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting 
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

  models.UseCases.find({}).populate('_base').lean().exec(function (err, usecases) {

    if (err) deferred.reject(err.name + ': ' + err.message);

    if (usecases) {
      deferred.resolve(usecases);
    } else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function getById(_id) {
  var deferred = Q.defer();

  console.log("getting usecase from DB with ID: " + _id);

  models.UseCases.findOne({ "_id": _id }).populate('_base linkedFS').exec(function (err, usecases) {

    if (err) deferred.reject(err.name + ': ' + err.message);

    if (usecases) {
      deferred.resolve(usecases);
      //return entries;
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function getFSs(_id) {

  var deferred = Q.defer();

  db.usecases.findById(_id, function (err, usecase) {
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
        }).toArray(function (err, funcs) {

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
    function (err, doc) {
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
  models.UseCases.findOne({
    usecasename: userParam.usecasename
  },
    function (err, usecase) {
      if (err) deferred.reject(err.name + ': ' + err.message);

      if (usecase) {
        // usecase already exists
        deferred.reject('usecase "' + userParam.usecasename +
          '" is already taken');
      } else {
        createUseCase();
      }
    });

  function createUseCase() {

    console.log("in createUseCase");

    models.Bases.find({}).sort({ 'hid': -1 }).limit(1).lean().exec(function (err, cursor) {
      var myFirstDocument = cursor[0]; //cursor.hasNext() ? cursor.next() : null;

      //if we only need the HID then we can search directly in Bases

      //--find next HID --//
      var nextHID = -1;
      if (myFirstDocument != null && !isNaN(myFirstDocument.hid)) {
        console.log("current last base is: " + myFirstDocument._id +
          " with id: " + myFirstDocument.hid);
        nextHID = myFirstDocument.hid + 1;
      } else {
        console.log("no number or entry");
        nextHID = 1;
      }
      //----//

      console.log("created new HID:" + nextHID);

      var newBase = new models.Bases();
      newBase.hid = nextHID;
      newBase.type = 'UseCase';

      newBase.save(function (err) {
        if (err) {
          deferred.reject(err.name + ': ' + err.message);
          return deferred.promise;
        }

        var newUseCase = new models.UseCases();
        newUseCase._base = newBase._id;
        //newUseCase.hid = nextHID;
        newUseCase.usecasename = userParam.usecasename;
        newUseCase.description = userParam.description;
        newUseCase.tags = userParam.tags;
        newUseCase.trackingcodes = userParam.trackingcodes;

        if (isNaN(newUseCase.version))
          newUseCase.version = '1';

        newUseCase.save(function (err) {
          if (err) {
            deferred.reject(err.name + ': ' + err.message);
            return deferred.promise;
          }
          else {
            deferred.resolve(newUseCase);
          }
        });
      });
    });
  }
  return deferred.promise;
}

function update(_id, userParam) {

  var deferred = Q.defer();
  models.UseCases.findById(_id, function (err, uc) {
    if (err) {
      deferred.reject(err.name + ': ' + err.message);
    }

    //safe set all values
    uc.usecasename = userParam.usecasename;
    uc.description = userParam.description;
    uc.categories = userParam.categories;
    uc.linkedFS = userParam.linkedFS;
    uc.tags = userParam.tags;
    uc.trackingcodes = userParam.trackingcodes;

    uc.save(function (err, updatedUC) {
      if (err)
        deferred.reject(err.name + ': ' + err.message);
      deferred.resolve(updatedUC);
    });
  });

  return deferred.promise;
};

function _delete(_id) {
  var deferred = Q.defer();
  models.UseCases.findById(_id).remove().exec(function (err, data) {
    if (err)
      deferred.reject(err.name + ': ' + err.message);
    deferred.resolve();
  });

  return deferred.promise;
}

function _deleteAllUseCases(userid) {

  var deferred = Q.defer();

  console.log("deleting usecase from db level by user: " + userid);

  models.UseCases.remove({}, function (err) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    deferred.resolve();
  });
  return deferred.promise;
}
