var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(mongoose) {
    var BaseSchema = new Schema({
      type: {
        type: String,
        enum: ['UseCase', 'Function', 'Design'] //https://gist.github.com/bnoguchi/953059
      },
      createdate: {
        type: Date,
        default: Date.now
      },
      lastmodified: {
        type: Date,
        default: Date.now
      },
      hidden: {
        type: Boolean,
        default: false
      },
      hid: Number,
    });

    var UsecaseSchema = new Schema({
      name: String,
      description: String,
      _base: {
        type: Number,
        ref: 'Base'
      },
      version: Number,
      Tags: [{
        type: String
      }],
      trackingcodes: [{ //like jira
        type: String
      }],
      archivedate: Date,
    });

    var models = {
      UseCases: mongoose.model('UseCases', UsecaseSchema),
      Bases: mongoose.model('Bases', BaseSchema)
    };
    return models;
  }
  //
  //
  //
  // var mongoose = require('mongoose');
  // var Schema = mongoose.Schema;
  //
  // var BaseSchema = new Schema({
  //   type: {
  //     type: String,
  //     enum: ['UseCase', 'Function', 'Design'] //https://gist.github.com/bnoguchi/953059
  //   },
  //   createdate: {
  //     type: Date,
  //     default: Date.now
  //   },
  //   lastmodified: {
  //     type: Date,
  //     default: Date.now
  //   },
  //   hidden: {
  //     type: Boolean,
  //     default: false
  //   },
  //   hid: Number,
  // });
  //
  // var UsecaseSchema = new Schema({
  //   name: String,
  //   description: String,
  //   _base: {
  //     type: Number,
  //     ref: 'Base'
  //   },
  //   version: Number,
  //   Tags: [{
  //     type: String
  //   }],
  //   trackingcodes: [{ //like jira
  //     type: String
  //   }],
  //   archivedate: Date,
  // });
