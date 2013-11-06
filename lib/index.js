/**
* Query watch
*
* ####Example 1:
*
* var mongosee = require('mongosee');
* require('mongosee-watch')( mongosee );
* var watchingPlayer = Model.find().watch( 'lastMod' );
* watchingPlayer.start( function (err, doc){
*	console.log("Player :");
*	console.log(doc);
*	watchingPlayer.stop(function(){
*		console.log('Close the watch!');
*	});
* });
*
* ####Example 2:
*
* var mongosee = require('mongosee-watch')();
* Model.find().watch( 'lastMod', function (err, fn){
*	fn.start(function(err, doc){
*		console.log("Player :");
*		console.log(doc);
*		fn.stop(function(){
*			console.log('Close the watch!');
*		});
*	});
* });
*
* @param {String} [path]
* @param {Date} [val]
* @return {Function} [callback]
*/

module.exports = exports = function (mongo){

	var mng = mongo || require('mongoose');
	var Query = mng.Query;
	var _ = require('underscore');

	Query.prototype.watch = function (){
		var sleft = {};
		for (arg in arguments) {
			if( _.isString(arguments[arg]) )
				sleft.label = arguments[arg];
			if( _.isDate(arguments[arg] ) )
				sleft.time = arguments[arg];
			if( _.isFunction(arguments[arg] ) )
				sleft.callback = arguments[arg];
		}
		if( !_.isString( sleft.label ) ) throw new Error('Is not a path');
		sleft.time = sleft.time || new Date();
		sleft.query = sleft.label === '_id' ? this : this.where( sleft.label ).gte( sleft.time );
		sleft.op  = sleft.query.op || 'find';
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
		sleft.start = function ( times, cb ){
			if( !_.isFunction(times) && !_.isFunction( cb ) ) throw new Error('Is not a function');
			var callback = _.isFunction(times) ? times : cb;
			if( !_.isNull( sleft.timer ) ) return callback( new Error('Is watch'), null );
			sleft.timer = setInterval( function (){
				sleft.query.exec(sleft.op, callback);
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
		sleft.stop = function ( cb ){
			if( !_.isNull(sleft.timer ) )
				clearInterval(sleft.timer);
			sleft.timer = null;
			if( _.isFunction(cb) ) return cb();
		};
		return sleft.callback ? sleft.callback( null, sleft ) : sleft;
	};

	mng.Query = Query;

	if( !mongo ) return mng;
};