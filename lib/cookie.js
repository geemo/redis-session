'use strict';

module.exports = exports = Cookie;

function setTime(self, time) {
    if (time instanceof Date) self._expires = time;
    else if (typeof time === 'number') self._expires = new Date(Date.now() + time);
}

function Cookie(options) {
    if (!(this instanceof Cookie)) return new Cookie(options);
    this.path = '/';
    this._expires = new Date(Date.now() + 604800000); // 7 days
    this.httpOnly = true;

    if (options && typeof options === 'object') {
        let prop;
        for (prop in options) {
            if (options.hasOwnProperty(prop)) {
                this[prop] = options[prop];
            }
        }
        if (options['expires'] && !(options['expires'] instanceof Date)) {
            this._expires = new Date(options['expires']);
        }
    }
}

Cookie.parse = function(str){
	if(!str || typeof str !== 'string') return null;
	let obj = {};

	let pairs = str.split(';');

	pairs.forEach(pair => {
		let kv = pair.trim().split('=');
		obj[kv[0]] = kv[1];
	});

	if(obj.hasOwnProperty('httpOnly')) obj['httpOnly'] = true;

	return obj;
}

Cookie.serialize = function(name, value, options){
	if(!name) throw new Error('name is required!');
	let attrs = [`${name}=${value ? value : ''}`];

	if(options && typeof options === 'object'){
		if(options['path']) attrs.push(`path=${options['path']}`);
		if(options['expires']) attrs.push(`expires=${options['expires'].toUTCString()}`);
		if(options['secure']) attrs.push(`secure=${options['secure']}`);
		if(options['domain']) attrs.push(`domain=${options['domain']}`);
		if(options['httpOnly']) attrs.push('httpOnly');
	}

	return attrs.join('; ');
}

//public
Cookie.prototype = {
    constructor: Cookie,

    get maxAge() {
        return this._expires.getTime() - Date.now();
    },

    set maxAge(ms) {
    	setTime(this, ms);
    },

    get expires() {
        return this._expires;
    },

    set expires(date) {
    	setTime(this, date);
    },

    get data() {
        return {
            'path': this.path,
            'expires': this._expires,
            'max-age': this._maxAge,
            'httpOnly': this.httpOnly,
            'secure': this.secure,
            'domain': this.domain
        };
    },

    serialize: function(name, value) {
        Cookie.serialize(name, value, this.data);
    },

    toJSON: function() {
        return this.data;
    }
};
