"use strict";
var _ = require('lodash')
  , cobble = require('cobble')
  , meta   = require('./lib/meta')
  , apply  = require('cobble/lib/apply')
  , _super = require('./lib/super');

var ClankObject = getClass()

function getClass(){
  var initProps;

  function Class(){
    var props = initProps || []
      , defaultMixinStrategy = meta.get(this.constructor).compositionStrategy || {};

    initProps = null

    if ( props && props.length )
      cobble.into(this, props, defaultMixinStrategy)
  }

  Class.prototype._super = _super

  Class._initProperties = function(args) { 
    initProps = args; 
  };

  Class.setCompositionStrategy = function(strategy) { 
    meta.get(this).compositionStrategy = strategy
  };

  return Class
}


ClankObject.extend = function(){
  var len   = arguments.length
    , args  = new Array(len)
    , base  = this
    , defaultMixinStrategy = meta.get(this).compositionStrategy || {}
    , proto = Object.create(base.prototype)
    , child; 

  for(var i = 0; i < len; ++i) args[i] = arguments[i];

  cobble.into(proto, args, defaultMixinStrategy)

  child = proto && _.has(proto, 'constructor')
        ? proto.constructor
        : function DefaultConstructor(){ return apply(base, this, arguments) }

  child.prototype = proto
  child.prototype.constructor = child

  meta.set(child, { 
    superclass:    base,
    compositionStrategy: _.clone(defaultMixinStrategy)
  })
  
  _.extend(child, base);

  return child
}

ClankObject.reopen = function(){
  var len = arguments.length
    , args = new Array(len)
    , defaultMixinStrategy = meta.get(this).compositionStrategy || {}
    , proto = this.prototype;

  for(var i = 0; i < len; ++i) args[i] = arguments[i];

  cobble.into(proto, args, defaultMixinStrategy)
}

ClankObject.create = function(){
  var len  = arguments.length
    , args = new Array(len);

  for(var i = 0; i < len; ++i) 
    args[i] = arguments[i];

  this._initProperties(args)
  return new this()
}

cobble.Object = ClankObject

module.exports = cobble

function removeInPlace(array, item){
  var idx = array.indexOf(item)
  if ( idx !== -1) array.splice(idx, 1)
}