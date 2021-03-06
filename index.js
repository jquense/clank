"use strict";
var cobble = require('cobble')
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
    , proto = Object.create(base.prototype)
    , defaultMixinStrategy = meta.get(this).compositionStrategy || {}
    , child;

  for(var i = 0; i < len; ++i)
    args[i] = arguments[i];

  cobble.into(proto, args, defaultMixinStrategy)

  child = proto && has(proto, 'constructor')
        ? proto.constructor
        : function DefaultConstructor(){ return apply(base, this, arguments) }

  child.prototype = proto
  child.prototype.constructor = child

  meta.set(child, {
    superclass:    base,
    compositionStrategy: defaultMixinStrategy
  })

  extend(child, base);

  return child
}

ClankObject.reopen = function(){
  var len = arguments.length
    , args = new Array(len)
    , defaultMixinStrategy = meta.get(this).compositionStrategy || {};

  for(var i = 0; i < len; ++i)
    args[i] = arguments[i];

  cobble.into(this.prototype, args, defaultMixinStrategy)
}

ClankObject.create = function(){
  var len   = arguments.length
    , args  = new Array(len)
    , Klass = this;

  for(var i = 0; i < len; ++i)
    args[i] = arguments[i];

  this._initProperties(args)
  return new Klass
}

module.exports = {
  Object: ClankObject,
  required: cobble.required
}

function extend(a, b){
  for(var key in b) if(has(b, key))
    a[key] = b[key]
}

function has(a, k) {
  return Object.prototype.hasOwnProperty.call(a, k)
}