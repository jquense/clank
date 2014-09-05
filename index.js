var _ = require('lodash')
  , cobble = require('cobble')
  , meta   = require('./lib/meta')
  , apply  = require('cobble/lib/apply');

var ClankObject = getClass()

function getClass(){
  var initProps;

  function Class(){
    var props = initProps || []
      , defaultMixinStrategy = meta.get(this.constructor).compositionStrategy || {};

    initProps = null
    cobble.into(this, props, defaultMixinStrategy)
  }

  Class._initProperties = function(args) { 
    initProps = args; 
  };

  Class._setCompositionStrategy = function(strategy) { 
    m = meta.get(this)
    m.compositionStrategy = strategy
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

  for(var i = 0; i < len; ++i) args[i] = arguments[i];

  cobble.into(proto, args, defaultMixinStrategy)

  child = proto && _.has(proto, 'constructor')
        ? proto.constructor
        : function DefaultConstructor(){ return apply(base, this, arguments) }

  child.prototype = proto
  child.prototype.constructor = child

  meta.set(child, { 
    superclass:    base,
    superproto:    base.prototype, 
    compositionStrategy: _.clone(defaultMixinStrategy)
  })
  
  _.extend(child, base);

  child.proto.$super = function(method){
    return _.bind(base.prototype[method], this)
  }
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
  Object: ClankObject
}


function injectSuper(parent, ctor){

}