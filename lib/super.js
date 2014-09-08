var _ = require('lodash')

module.exports = function _super(method) {
  var called = _super.caller
    , foundImpl = contains(this[method], called)
    , proto = this;
  
  while (proto = Object.getPrototypeOf(proto)) {
    if ( !proto[method] ) break
    else if (contains(proto[method], called)) foundImpl = true
    else if (foundImpl) 
      return typeof proto[method] === 'function'
        ? _.bind(proto[method], proto)
        : proto[method]
  }

  if ( !foundImpl) 
    throw new Error("`super` may not be called outside a method implementation")
}

function contains(method, called){
  var i = 0;

  while ( called.caller && called !== method && i++ < 100 ) 
    called = called.caller 
  
  return called === method
}