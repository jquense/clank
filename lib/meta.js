
var _ = require('lodash')
  , KEY = '__meta__';

function Meta(obj, options) {
	_.extend(this, options)

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
