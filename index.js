var _ = require('lodash')
  , cobble = require('cobble')
  , apply = require('cobble/lib/apply');

var ClankObject = getClass()

function getClass(){
  var initProps;

  function Class(){
    var props = initProps;

    initProps = null
    _.extend(this, props)
  }

  Class._initProperties = function(args) { 
    initProps = args; 
  };

  return Class
}


ClankObject.extend = function(){
  var len = arguments.length
    , args = new Array(len)
    , base = this
    , proto = Object.create(base.prototype)
    , defaultMixinStrategy = this.__spec__ || {}
    , child; 

  for(var i = 0; i < len; ++i) 
    args[i] = arguments[i];

  //console.log(proto.traits)
  cobble.composeInto(proto, args, defaultMixinStrategy)

  child = proto && _.has(proto, 'constructor')
        ? proto.constructor
        : function DefaultConstructor(){ return apply(base, this, arguments) }

  child.prototype = proto
  child.prototype.constructor = child
  _.extend(child, base);
  //console.log(defaultMixinStrategy)
  return child
}

ClankObject.reopen = function(){
  var len = arguments.length
    , args = new Array(len)
    , defaultMixinStrategy = this.__spec__ || {}
    , proto = this.prototype;

  for(var i = 0; i < len; ++i) 
    args[i] = arguments[i];

  cobble.composeInto(proto, args, defaultMixinStrategy)
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


function getMixinStrategy(parent, ctor){

}