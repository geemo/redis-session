'use strict';

module.exports = exports = Session;

function Session(req, sess) {
    if (!(this instanceof Session)) return new Session(req, sess);

    if (!req) throw new Error('req is required!');

    Object.defineProperty(this, 'req', { value: req });

    this.expires = new Date(Date.now() + this.req.sessionStore.ttl * 1000);
    if (sess && typeof sess === 'object') {
        let prop;
        for(prop in sess){
        	if(sess.hasOwnProperty(prop))
        		this[prop] = sess[prop];
        }
    }
}

Session.prototype.constructor = Session;

Session.prototype.save = function(fn) {
    this.req.sessionStore.set(this.req.sessionId, this, fn);
};

Session.prototype.destory = function(fn) {
    this.req.session = null;
    this.req.sessionStore.destory(this.id, fn);
};

Session.prototype.resetExpires = function() {
    this.expires = new Date(Date.now() + this.req.sessionStore.ttl * 1000);
}

Session.prototype.reload = function(fn) {
    let store = this.req.sessionStore;
    let self = this;

    store.get(this.id, (err, sess) => {
        if (err) fn(err);
        if (!sess) fn(new Error('failed to reload session!'));

        store.createSession(self.req, sess);
        fn(null);
    });
};
