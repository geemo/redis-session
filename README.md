# redis-session

## Installation

```bash
$ git clone https://github.com/geemo/redis-session.git
```

## Usage

```js
const app = express();
const session = require('redis-session');

app.use(session({
	url: 'redis://127.0.0.1:6379/0',
	sidKey: 'redis.sid',
	cookie: {
		maxAge: 24 * 60 * 60 * 1000	//ms
	},
	ttl: 24 * 60 * 60,	//sec
	resave: true,
	saveUninit: false
}));
```

### session(options)

Create a session middleware with the given `options`.

##### url 

Redis server url. The default value is "redis://127.0.0.1:6379/0".

##### sidKey

Session ID cookie name. The default value is "redis.sid".

##### cookie

Settings for the session ID cookie.

The default value is `{ path: '/', httpOnly: true, maxAge: 604800000 \*7 days*\}`.

##### ttl

Redis session TTL (expiration) in seconds. The default value is one day.

##### resave

Forces the session to be saved back to the session store. The default value is true.

##### saveUninit

Forces a session that is "uninitialized" to be saved to the store. The default value is true.