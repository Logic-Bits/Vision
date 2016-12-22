var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
//var counters = require('mongodb-counter').createCounters({mongoUrl: config.connectionString, collectionName: 'usecases.counter'});
db.bind('usecases');
//counters.bind('counters');

var service = {};

service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.deleteAllUseCases = _deleteAllUseCases;
service.getAll = getAll;

module.exports = service;

function getAll()
{
    var deferred = Q.defer();

    var entries = [];

    db.usecases.find().toArray(function(err, result) {

        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result) {
            deferred.resolve(result);
            //return entries;
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    console.log("getting usecase from DB with ID: " + _id);

    db.usecases.findById(_id, function (err, usecase) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (usecase) {
            // return user (without hashed password)
            deferred.resolve(_.omit(usecase, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.usecases.findOne(
        { usecasename: userParam.usecasename },
        function (err, usecase) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (usecase) {
                // username already exists
                deferred.reject('usecase "' + userParam.usecasename + '" is already taken');
            } else {
                createUseCase();
            }
        });

    function createUseCase() {
        // set user object to userParam without the cleartext password
          var usecase = _.omit(userParam, 'password');

          //Optimistic Loop for next ID
          while (1) {

            console.log("in while");

            var cursor = db.usecases.find( {}, { hid: 1 } ).sort( { hid: -1 } ).limit(1);

            console.log("cursor vor hid: " + cursor);

            var seq = cursor.hasNext() ? cursor.next()._id + 1 : 1;
            usecase.hid = seq;
            console.log("created new HID:" + seq);
            //var results = targetCollection.insert(doc);
            // if( results.hasWriteError() ) {
            //     if( results.writeError.code == 11000 /* dup key */ )
            //         continue;
            //     else
            //         print( "unexpected error inserting data: " + tojson( results ) );
            // }


            var results = db.usecases.insert(usecase);
            if(results.hasWriteError()) {

              if(results.writeError.code == 11000 /* dup key */ )
              {
                console.log("!!!!!!! duplicated HID in usecase: " + usecase._id);
                continue;//continue; //return true is like continue in loop
              }
              else {
                deferred.reject(err.name + ': ' + err.message);
              }
            }
            else {
              deferred.resolve();
            }

            // db.usecases.insert(
            //     usecase,
            //     function (err, doc) {
            //         if (err)
            //         {
            //           if(results.writeError.code == 11000 /* dup key */ )
            //           {
            //             console.log("!!!!!!! duplicated HID in usecase: " + usecase._id);
            //             continue;//continue; //return true is like continue in loop
            //           }
            //           deferred.reject(err.name + ': ' + err.message);
            //         }
            //
            //         deferred.resolve();
            //         break;
            //     });

            break;
        }

    return deferred.promise;
  }
}

function update(_id, userParam) {
    var deferred = Q.defer();
    // fields to update
    var set = {
        usecasename: userParam.usecasename,
        categories: userParam.categories,
        tags: userParam.tags,
    };

    // // update password if it was entered
    // if (userParam.password) {
    //     set.hash = bcrypt.hashSync(userParam.password, 10);
    // }

    db.usecases.update(
        { _id: mongo.helper.toObjectID(_id) },
        { $set: set },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
      });

      return deferred.promise;
};

function _delete(_id) {
    var deferred = Q.defer();

    db.usecases.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function _deleteAllUseCases(userid) {

    var deferred = Q.defer();

    console.log("deleting usecase from db level");

    db.usecases.remove({},function (err) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    return deferred.promise;
}
