'use strict';
var hasOwn = Object.prototype.hasOwnProperty
  , KEY = '__meta__';

function Meta(obj, opts) {
	for(var key in opts)
    if(hasOwn.call(opts, key))
      this[key] = opts[key]

	this.src = obj
}

var m = module.exports = {

	set: function(obj, options) {
    Object.defineProperty(obj, KEY, {
        value: new Meta(obj, options)
      , configurable: false
      , writable: true
      , enumerable: false
    })

		return obj[KEY];
	},

	get: function(obj, opts) {
		return obj[KEY] || m.set(obj, opts);
	}
}

