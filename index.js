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

  Class._setCompositionStrategy = function(strategy) { 
    var m = meta.get(this)
    m.compositionStrategy = strategy
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

  _.each(proto, function(value, name) {
    if ( typeof value === 'function') 
      value._methodName = name;
  });

  child.prototype = proto
  child.prototype.constructor = child

  meta.set(child, { 
    superclass:    base,
    superproto:    base.prototype, 
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

  for(var i = 0; i < len; ++i) 
    args[i] = arguments[i];

  cobble.into(proto, args, defaultMixinStrategy)
}

ClankObject.create = function(){
  var len = arguments.length
    , args = new Array(len);

  for(var i = 0; i < len; ++i) 
    args[i] = arguments[i];

  this._initProperties(args)
  return new this()
}


module.exports = {
  Object: ClankObject,
  cobble: cobble
}


function findSuper(method, current, impl){
  var foundImpl = current[method] === impl
    , proto = current

  while (proto = Object.getPrototypeOf(proto)) {
    if (!proto[method]) break
    else if (foundImpl) return proto[method]
    else if (proto[method] === impl) foundImpl = true; 
  }

  if ( !foundImpl ) throw new Error("`super` may not be called outside a method implementation");
}

function removeInPlace(array, item){
  var idx = array.indexOf(item)

  if ( idx !== -1) array.splice(idx, 1)
}