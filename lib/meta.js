
var _ = require('lodash')
  , KEY = '__meta__';

function Meta(obj, options) {
	_.extend(this, options)
	this.target = obj
}

var traitMeta = module.exports = {

	set: function(obj, options) {
		return obj[KEY] = new Meta(obj, options);
	},

	get: function(obj){
		return obj[KEY] || traitMeta.set(obj, {});
	}
}
