"use strict";
/*!
 * redis-session
 * Copyright(c) 2016 geemo
 * MIT Licensed
 */

const Store = require('./lib/store.js');
const Session = require('./lib/session.js');
const Cookie = require('./lib/cookie.js');

const urlParse = require('url').parse;

module.exports = exports = session;

exports.Store = Store;
exports.Session = Session;
exports.Cookie = Cookie;

/*	session({
		url: 'redis://127.0.0.1:6379/0',
		sidKey: 'redis.sid',
		cookie: {
			maxAge: 24 * 60 * 60 * 1000	//ms
		},
		ttl: 24 * 60 * 60	//sec
	})
 */

function session(options) {
    let opts = options || {},
        url = opts.url,
        sidKey = opts.sidKey || 'redis.sid',
        cookie = opts.cookie || {},
        ttl = opts.ttl,
        resave = opts.resave,
        saveUninit = opts.saveUninit;

    if (resave === undefined) resave = true;
    if (saveUninit === undefined) saveUninit = true;

    let store = new Store({
        url: url,
        ttl: ttl
    });
    let storeReady = false;

    store.once('connect', () => storeReady = true);
    store.once('disconnect', () => console.log('store disconnect!'));
    store.once('error', err => console.log(err));

    store.generate = function(req) {
        req.sessionId = genId();
        req.session = new Session(req);
        req.session.cookie = new Cookie(cookie);
    }

    return (req, res, next) => {
        if (req.session) return next();
        if (!storeReady) return next();

        let pathname = urlParse(req.url).pathname;
        if (pathname.indexOf(cookie.path || '/') !== 0) return next();

        req.sessionStore = store;
        let cookieObj = Cookie.parse(req.headers['cookie']) || {};
        req.sessionId = cookieObj[sidKey];

        let _writeHead = res.writeHead;
        let writed = false;
        let isExists = false;
        res.writeHead = function() {
            if (writed) return false;
            writed = true;

            if (!isExists) {
                res.setHeader('set-cookie',
                    Cookie.serialize(sidKey, req.sessionId, req.session.cookie));
            }

            _writeHead.apply(res, arguments);
        };

        let _end = res.end;
        let ended = false;
        let originSess;
        res.end = function() {
            if (ended) return false;
            ended = true;

            let setCookie = res.getHeader('set-cookie');
            if (!setCookie || setCookie.indexOf(sidKey) !== 0) {
                if (!isExists) {
                    res.setHeader('set-cookie',
                        Cookie.serialize(sidKey, req.sessionId, req.session.cookie));
                }
            }

            if (saveUninit || (!saveUninit && originSess !== hash(req.session))) {
                if (!isExists) {
                    req.session.save();
                } else if (isExists && resave) {
                    req.session.resetExpires();
                    req.session.save();
                }
            }

            _end.apply(res, arguments);
        };

        if (!req.sessionId) {
            generate(req);
            return next();
        }

        store.get(req.sessionId, (err, sess) => {
            if (err) {
                generate(req);
                return next(err);
            }

            if (!sess) {
                generate(req);
                return next();
            }

            isExists = true;
            store.createSession(req, sess);
            if (!saveUninit) {
                originSess = hash(req.session);
            }

            next();
        });

        function generate(req) {
            store.generate(req);
            if (!saveUninit) {
                originSess = hash(req.session);
            }

        }
    };
};

function genId() {
    return [Date.now(), Math.floor(Math.random() * 1000)].join('');
}

function hash(sess) {
    return JSON.stringify(sess, (k, v) => {
        if (k !== 'cookie') {
            return v;
        }
        return;
    });
}
