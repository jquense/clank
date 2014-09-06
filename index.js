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

    if ( props && props.length )
      cobble.into(this, props, defaultMixinStrategy)
  }

  Class.prototype._super = function(method) {
    var self = this
      , m    = meta.get(this, { currentSuper: {} })
      , superchain = m.currentSuper[method] || (m.currentSuper[method] = [])
      , currentObj = superchain[superchain.length - 1] || this
      , parentObj  = findSuper(method, currentObj)
      , prop;

    if (parentObj !== currentObj) //otherwise top of the chain
      superchain.push(parentObj)

    prop = parentObj[method];
    
    return typeof prop !== 'function' 
      ? prop
      : function superMethod(){ 
          var r = prop.apply(currentObj, arguments)
          removeInPlace(superchain, parentObj)
          return r
        }
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


function findSuper(method, childObj){
  var obj = childObj;

  //walk down the prototype chain
  while (obj[method] === childObj[method]) 
    obj = meta.get(obj.constructor).superproto;
  
  return obj;
}

function removeInPlace(array, item){
  var idx = array.indexOf(item)

  if ( idx !== -1) array.splice(idx, 1)
}