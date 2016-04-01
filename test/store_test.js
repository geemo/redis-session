'use strict';

const Store = require('../lib/store.js');


let store = new Store({
	url: 'redis://127.0.0.1:6379/1'
});

store.on('connect', () => {
	console.log('connect');
});

store.on('error', err => {
	console.log(err);
});

store.set('111', {a: 5, b: 6}, err => {
	console.log(err);
});

store.destory('111', () => {
	store.get('111', (err, data) => {
		console.log(err, data);
	});
})