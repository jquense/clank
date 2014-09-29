
var _ = require('lodash')

module.exports = function extend(parent, protoProps) {
    var child = protoProps && _.has(protoProps, 'constructor')
        ? protoProps.constructor
        : function (){ return parent.apply(this, arguments) }
    
    child.prototype = Object.create(parent.prototype, {
      constructor: {
        enumerable: false,
        writable: true,
        configurable: true,
        value: child
      }
    })

    _.extend(child, parent);
    _.extend(child.prototype, protoProps);

    return child;
};


