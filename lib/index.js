/**
* Query watch
*
* ####Example:
*
* var mongoseeWatch = require('mongosee-watch');
* var watchingPlayer = Model.find().watch( 'lastMod' );
* watchingPlayer.start( function (err, doc){
*	console.log("Player :");
*	console.log(doc);
*	watchingPlayer.stop(function(){
*		console.log('Close the watch!');
*	});
* });
*
* @param {String} [path]
* @param {Date} [val]
* @return {Function} [callback]
*/

var Query = require('mongoose').Query;
var _ = require('underscore');

Query.prototype.watch = function (){
	var sleft = {};
	for (var i = arguments.length - 1; i >= 0; i--) {
		if( _.isString(arguments[i]) )
			sleft.label = arguments[i];
		if( _.isDate(arguments[i] ) )
			sleft.time = arguments[i];
		if( _.isFunction(arguments[i] ) )
			sleft.callback = arguments[i];
	}
	if( _.isString( sleft.label ) ) throw new Error('Is not a path');
	sleft.time = sleft.time || new Date();
	sleft.query = sleft.label === '_id' ? this : this.where( sleft.label ).gte( sleft.time );
	sleft.timer = null;

/*
* Query watch start
*
* ####Example:
*
* var watchingPlayer = Model.find().watch( 'lastMod' );
* watchingPlayer.start( function (err, doc){
*	console.log("Player :");
*	console.log(doc);
*	watchingPlayer.stop(function(){
*		console.log('Close the watch!');
*	});
* });
*
* @param {Number} [Time return]
* @param {Function} [Callback]
* @return {Promise}
*
*/

	this._start = function ( times, cb ){
		if( !_.isFunction(times) && !_.isFunction( cb ) ) throw new Error('Is not a function');
		var callback = _.isFunction(times) ? times : cb;
		sleft.timer = setInterval( function(){
			sleft.query.exec('find', callback);
		}, _.isNumber(times) ? times : 350 );
	};

/*
* Query watch Stop
*
* ####Example:
*
* var watchingPlayer = Model.find().watch( 'lastMod' );
* watchingPlayer.start( function (err, doc){
*	console.log("Player :");
*	console.log(doc);
*	watchingPlayer.stop(function(){
*		console.log('Close the watch!');
*	});
* });
*
* @param {Function} [callback]
* @api public
*/

	this._stop = function ( cb ){
		clearInterval(sleft.timer);
		sleft.timer = null;
		if( _.isFunction(cb) ) return cb();
	};
	return sleft.callback ? sleft.callback( this._start, this._stop ) : { start : this._start, stop : this._stop };
};

/*
* Plugin update Date
*
* ####Example:
*
* var mongoseeWatch = require('mongosee-watch');
* var Player = new Schema({ ... });
* Player.plugin( mongoseeWatch( "lastModification" ) );
*
* @param {String} [path]
* @api public
*/

module.exports = exports = function lastModfication ( label ){
	var self = {
		label : label || "lastMod",
		field : {}
	};

	return function watch (schema, options) {
		self.field[ self.label ] = {
			type : Date,
			default : Date.now,
			required : true
		};

		schema.add(self.field);

		schema.pre('save', function (next) {
			this[ self.label ] = new Date();
			next();
		});
	};
};