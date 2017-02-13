var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
//var ObjectID = require('mongodb').ObjectID;
var db = mongo.db(config.connectionString, {
  native_parser: true
});
db.bind('usecases');
db.bind('fs');


//mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

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



  //http://stackoverflow.com/questions/21739827/mongoose-how-to-query-within-date-range-and-extract-highest-values-for-each-day
  //https://www.mongodb.com/presentations/aggregation-framework-0?jmp=docs&_ga=1.241480898.1132359820.1481563559


  models.UseCases.aggregate([{
    $group: {
      _id: "$_base",
      highestVersion: {
        $max: "$version"
      }
    }


  }]).then(function (result) {

    console.log("got usecases: " + result.length);

    var documentids = [];

    if (result) {

      for (var i = 0; i < result.length; i++)
        documentids.push({
          _base: result[i]._id,
          version: result[i].highestVersion
        }); //_id is baseID and highestVersion the version

      //now populate
      models.UseCases.find({
        $or: documentids
      }).populate('_base').lean().exec(function (err, usecases) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (usecases) {
          deferred.resolve(usecases);
        } else {
          deferred.resolve();
        }

      });


      //deferred.resolve(result);
    } else {
      deferred.resolve();
    }

  });

  // models.UseCases.find({}).populate('_base').lean().exec(function (err, usecases) {

  //   if (err) deferred.reject(err.name + ': ' + err.message);

  //   if (usecases) {
  //     deferred.resolve(usecases);
  //   } else {
  //     deferred.resolve();
  //   }
  // });

  return deferred.promise;
}

function getById(_id) {
  var deferred = Q.defer();

  console.log("getting usecase from DB with ID: " + _id);

  models.UseCases.findOne({
    "_id": _id
  }).populate('_base linkedFS').lean().exec(function (err, usecase) {

    if (err) deferred.reject(err.name + ': ' + err.message);

    //find other versions and ref them // usecase.otherVersions

    models.UseCases.find({
      _base: usecase._base
    }).lean().exec(function (err, otherUCsFull) {

      var otherUCs = [];

      if (otherUCsFull) {

        for (var i = 0; i < otherUCsFull.length; i++) {

          if (otherUCsFull[i]._id.equals(usecase._id))
            continue;

          var tmp = {
            _id: otherUCsFull[i]._id,
            version: otherUCsFull[i].version
          };
          otherUCs.push(tmp);
        }

        usecase.otherUCs = otherUCs;
      }

      if (usecase) {
        deferred.resolve(usecase);
        //return entries;
      } else {
        deferred.resolve();
      }

    });
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

function duplicate(_id) {
  var deferred = Q.defer();

  models.UseCases.findById(_id, function (err, uc) {
    if (err)
      deferred.reject(err.name + ': ' + err.message);

    uc._id = mongoose.Types.ObjectId();
    //maybe increasing version shld be done somewhere else
    if (!isNaN(uc.version)) {
      try {
        uc.version = uc.version + 1;
      } catch (err2) {
        console.log(err2);
      }
    }
    uc.isNew = true;
    uc.save(function (err, newUseCase) {
      if (err)
        deferred.reject(err.name + ': ' + err.message);

      deferred.resolve(newUseCase);
    });
  });

  return deferred.promise;
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

    models.Bases.find({}).sort({
      'hid': -1
    }).limit(1).lean().exec(function (err, cursor) {
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
        newUseCase.trackingcodes = userParam.trackingcodes;


        var tags = [];

        for (var key in userParam.tags) {
          if (userParam.tags.hasOwnProperty(key)) {
            var element = userParam.tags[key];
            tags.push(element['text']);
          }
        }

        newUseCase.tags = tags;

        if (isNaN(newUseCase.version))
          newUseCase.version = '1';

        newUseCase.save(function (err) {
          if (err) {
            deferred.reject(err.name + ': ' + err.message);
            return deferred.promise;
          } else {
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
    //uc.tags = userParam.tags;

    var tags = [];

    for (var key in userParam.tags) {
      if (userParam.tags.hasOwnProperty(key)) {
        var element = userParam.tags[key];
        tags.push(element['text']);
      }
    }

    uc.tags = tags;

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

  models.UseCases.findById(_id).exec(function (err, data) {
    if (err)
      deferred.reject(err.name + ': ' + err.message);

    var baseId = data._base;

    //query if there are any other usecases with that baseid, if not then delete the base too

    models.UseCases.find({
      _base: baseId
    }, function (err, otherUCs) {
      if (err)
        deferred.reject(err.name + ': ' + err.message);

      if (otherUCs.length < 2) //not more than the one we are going to delete
      {
        models.Bases.findById(baseId).remove().exec(function (err) {
          if (err)
            deferred.reject(err.name + ': ' + err.message);
        });
      }
      models.UseCases.findById(_id).remove().exec(function (err, data) {
        if (err)
          deferred.reject(err.name + ': ' + err.message);
        deferred.resolve();
      });


    });
  });


  // models.UseCases.findById(_id).remove().exec(function (err, data) {
  //   if (err)
  //     deferred.reject(err.name + ': ' + err.message);
  //   deferred.resolve();
  // });

  return deferred.promise;
}

function _deleteAllUseCases(userid) {

  var deferred = Q.defer();

  console.log("deleting usecase from db level by user: " + userid);

  models.UseCases.remove({}, function (err) {
    console.log(err);
    models.Bases.remove({}, function (err) {
      if (err) deferred.reject(err.name + ': ' + err.message);
      deferred.resolve();
    });
  });

  //todo delete bases

  return deferred.promise;
}