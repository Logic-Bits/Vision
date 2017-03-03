var util = require('util')
var mongoose = require('mongoose')
var Schema = mongoose.Schema

function SpecificationBaseSchema () {
  Schema.apply(this, arguments)

  this.add({
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
    trackingcodes: [{ // like jira
      type: String
    }],
    archivedate: Date
  })
}

util.inherits(SpecificationBaseSchema, Schema)

module.exports = function (mongoose) {
  var BaseSchema = new Schema({
    type: {
      type: String,
      enum: ['UseCase', 'Function', 'Design'] // https://gist.github.com/bnoguchi/953059
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
    hid: Number
  })

  var UsecaseSchema = new SpecificationBaseSchema({
    linkedFS: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Function'
    }]
  })

  var FunctionSchema = new SpecificationBaseSchema({
    linkedDS: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design'
    }]
  })

  var SpecificationBase = new SpecificationBaseSchema()
  SpecificationBase.virtual('type').get(function () { return this.__t; })

  var models

  if (mongoose.models.UseCase) // already in module
  {
    models = {
      UseCases: mongoose.model('UseCase'),
      Functions: mongoose.model('Function'),
      Bases: mongoose.model('Base')
    }
  }else {
    var spb = mongoose.model('SpecificationBase', SpecificationBase)
    var ucs = spb.discriminator('UseCase', UsecaseSchema)
    var fs = spb.discriminator('Function', FunctionSchema)

    models = {
      UseCases: ucs,
      Functions: fs,
      Bases: mongoose.model('Base', BaseSchema)
    }
  }

  return models
}
