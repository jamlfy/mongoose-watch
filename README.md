# Mongoose Watch
This plugin has the capacity to generate queries in a certain time. This is to avoid using the "cappde" mongo while having certain documents, according as they changed, all based on dates.

So you will have control of a "real-time", but is the closest thing you can do.

> Note: Do not use with `.stream()`

## Install
You need

- Nodejs
- Npm

```
npm install mongosee-watch
```
## Use
In your model
```javascript
var mongoseeWatch = require('mongosee-watch');
var Player = new Schema({ ... });
Player.plugin( mongoseeWatch( "inLast" ) );
```
We build a query in mongoose, and give one or two parameters a watch.
```javascript
var Query =  Player.find().where()...;
var watchPlayers = Query.watch( 'inLast', new Date() );
var player = 0;

watchPlayers.start(function (err, doc){
	if(err) return console.log(err);
	players = docs.length;
	console.log(players);
	if(players === 10 ) watchPlayers.stop();
});
```
Can modify parameters such as

- the time the function returns.
- Date query

Also you can build asynchronously
```javascript
var Query = Player.find().where()...;
var player = 0;

Query.watch( 'inLast', function (err, timer){
	console.log("Start watch! ");
	timer.start(1200, function (err, doc){
		if(err) return console.log(err);
		players = docs.length;
		console.log(players);
		if(players === 10 ) timer.stop();
	});
});

```