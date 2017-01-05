var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
//var counters = require('mongodb-counter').createCounters({mongoUrl: config.connectionString, collectionName: 'usecases.counter'});
db.bind('fs'); //function specification
//counters.bind('counters');

var service = {};

service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.deleteAllUseCases = _deleteAllUseCases;
service.getAll = getAll;
service.getDSs = getDSs;

module.exports = service;

function getAll()
{
    console.log("getting all Functions");

    var deferred = Q.defer();

    db.fs.find().toArray(function(err, result) {

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

    console.log("getting function from DB with ID: " + _id);

    db.fs.findById(_id, function (err, usecase) {
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

function getDSs(_id) {

  //todo

    var deferred = Q.defer();

    console.log("getting design spez. from DB with Function ID: " + _id);

    db.fs.find({linkedDS: _id}).toArray(function (err, func) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (func) {
            // return user (without hashed password)
            deferred.resolve(_.omit(func, 'hash'));
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
    db.fs.findOne(
        { functionname: userParam.functionname },
        function (err, usecase) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (usecase) {
                // username already exists
                deferred.reject('usecase "' + userParam.functionname + '" is already taken');
            } else {
                createUseCase();
            }
        });

    function createUseCase() {
        // set user object to userParam without the cleartext password
        var usecase = _.omit(userParam, 'password');

        // db.counters.insert(
        //    {
        //       _id: "usecases-hid",
        //       seq: 1
        //    }
        // )
        //
        // usecase.hid = getNextSequence("usecases-hid");
        // console.log("------- new ID: " + usecase.hid);

        // add hashed password to user object
        //user.hash = bcrypt.hashSync(userParam.password, 10);

        db.fs.insert(
            usecase,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function getNextSequence(name) {
   var ret = db.counters.findAndModify(
          {
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
}

function update(_id, userParam) {
    var deferred = Q.defer();
    // fields to update
    var set = {
        functionname: userParam.functionname,
        description: userParam.description,
        categories: userParam.categories,
        tags: userParam.tags,
        linkedDS: userParam.linkedDS,
    };

    // // update password if it was entered
    // if (userParam.password) {
    //     set.hash = bcrypt.hashSync(userParam.password, 10);
    // }

    db.fs.update(
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

    db.fs.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function _deleteAllUseCases(userid) {

    var deferred = Q.defer();

    console.log("deleting functionspez from db level by user " + userid);

    db.fs.remove({},function (err) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    return deferred.promise;
}
