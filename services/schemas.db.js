var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function (mongoose) {
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
    usecasename: String,
    description: String,
    _base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base'
    },
    version: Number,
    tags: [{
      type: String
    }],
    trackingcodes: [{ //like jira
      type: String
    }],
    archivedate: Date,
    linkedFS: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Function'
    }]
  });

  var FunctionSchema = new Schema({
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

var models;

if(mongoose.models.UseCase) //already in module
{
  models = {
    Functions: mongoose.model('Function'),
    UseCases: mongoose.model('UseCase'),
    Bases: mongoose.model('Base')
  };
}
else
{
  models = {
    Functions: mongoose.model('Function', FunctionSchema),
    UseCases: mongoose.model('UseCase', UsecaseSchema),
    Bases: mongoose.model('Base', BaseSchema)
  };
}

  return models;
}