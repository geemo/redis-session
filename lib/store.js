'use strict';

module.exports = exports = Store;

const redis = require('redis');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

const Cookie = require('./cookie.js');
const Session = require('./session.js');

const ONE_DAY = 86400;

function Store(options) {
    if (!(this instanceof Store)) return new Store(options);

    this.url = 'redis://127.0.0.1:6379';
    if (options && typeof options === 'object') {
        let prop;
        for (prop in options) {
            if (options.hasOwnProperty(prop))
                this[prop] = options[prop];
        }
    }
    this.ttl = (typeof this.ttl === 'number') ? this.ttl : ONE_DAY;

    let self = this;

    EventEmitter.call(this);
    this.client = redis.createClient(this.url, options);
    this.client.once('connect', () => self.emit('connect'));
    this.client.once('disconnect', () => self.emit('disconnect'));
    this.client.once('error', err => self.emit('error', err));
};

util.inherits(Store, EventEmitter);

Store.prototype.constructor = Store;

Store.prototype.get = function(sid, fn) {
    this.client.get(sid, (err, data) => {
        if (err) return fn(err);
        if (!data) return fn();

        let result;
        try {
            result = JSON.parse(data);
        } catch (e) {
            return fn(e);
        }
        return fn(null, result);
    });
};

Store.prototype.set = function(sid, sess, fn) {
    let args = [sid];
    let jsess;
    try {
        jsess = JSON.stringify(sess);
    } catch (e) {
        return fn(e);
    }
    args.push(jsess);
    args.push('EX', this.ttl);

    this.client.set(args, fn);
};

Store.prototype.destory = function(sid, fn) {
    this.client.del(sid, fn);
};

Store.prototype.resetExpires = function(sid, fn) {
    this.client.expire(sid, this.ttl, fn);
};

Store.prototype.load = function(sid, req, fn){
    let self = this;
    this.get(sid, (err, sess) => {
        if(err) fn(err);
        if(!sess) fn();

        self.createSession(req, sess);
        fn(null, sess);
    });
};

Store.prototype.createSession = function(req, sess) {
    let cookie = new Cookie(sess.cookie);
    let session = new Session(req, sess);
    session.cookie = cookie;
    req.session = session;
    return session;
};
