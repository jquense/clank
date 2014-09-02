var _ = require('lodash')
  , cobble = require('cobble')
  , apply = require('cobble/lib/apply');

module.exports = Clank

function Clank(){
  var concatedProps = this.concatenatedProperties

}

Clank.extend = function(){
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
        : function SurrogateCtor(){ return apply(base, this, arguments) }

  child.prototype = proto
  child.prototype.constructor = child
  _.extend(child, base);
  //console.log(defaultMixinStrategy)
  return child
}

Clank.reopen = function(){
  var len = arguments.length
    , args = new Array(len)
    , defaultMixinStrategy = this.__spec__ || {}
    , proto = this.prototype;

  for(var i = 0; i < len; ++i) 
    args[i] = arguments[i];

  cobble.composeInto(proto, args, defaultMixinStrategy)
}

Clank.create = function(){
  var len = arguments.length
    , args = new Array(len);

  for(var i = 0; i < len; ++i) 
    args[i] = arguments[i];

  return new this(args)
}


function getMixinStrategy(parent, ctor){

}