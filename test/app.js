"use strict";

const express = require('express');
const session = require('../index.js');
const PORT = process.env.PORT || 80;
let app = express();

app.use(session({
    url: 'redis://127.0.0.1:6379/0',
    sidKey: 'my.sid',
    ttl: 20 * 60 * 60, //sec
    resave: false,
    saveUninit: false
}));

app.get('/', (req, res) => {
	if(req.session.isVisited){
		req.session.obj = {
			aa: 55,
			bb: 66
		};

		res.end('asdfsad');
	} else {
		req.session.isVisited = true;
		res.end('bbbb');
	}
});

app.listen(PORT, () => {
    console.log(`server start on port: ${PORT}!`);
});
