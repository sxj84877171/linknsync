
var request = require('request');
var config = require('./config.js');

var couchbase_url = config.kCouchbaseURL;

function Couchbase(){
}

Couchbase.prototype.getBucketInfo = function(req, res){
	request(couchbase_url, function (error, response, body) {
			res.send(body);
	});
}

Couchbase.prototype.getBucketAllDocs = function(req, res){
	request(couchbase_url + "_all_docs", function (error, response, body) {
			res.send(body);
	});
}

Couchbase.prototype.getOneDocumentContent = function(req, res) {
	var id = req.param('id');
	if(!id) {
		callback("{error: '-1'}");
		return;
	}
	
	this.getDocument(id, function (body) {
	    res.send(body);
	});
}

Couchbase.prototype.getDocument = function(id, callback) {
	if(!id)
		return false;
	
	request(couchbase_url + id, function (error, response, body) {
		if(callback)
			callback(body);
	});
	
	return true;
}

Couchbase.prototype.getBucketChanges = function(req, res){
	var url = couchbase_url + "_changes";	
	//Starts the results from the change immediately after the given sequence ID. Sequence IDs should be considered opaque; they come from the last_seq property of a prior response.
	var since = req.param('since');
	//channels: A comma-separated list of channel names. The response will be filtered to only documents in these channels. 
	var channels = req.param('channels');
	//Specifies type of change feed. Valid values: normal, continuous, longpoll, websocket
	var feed = req.param('feed');
	//Limits the number of result rows to the specified value. Using a value of 0 has the same effect as the value 1.
	var limit = req.param('limit');
	var c = '?';
	if(since){
		url = url + c + 'since=' + since;
		c = '&';
	}
	if(channels){
		url = url + c + 'filter=sync_gateway/bychannel' + '&channels=' + channels;
		c = '&';
	}
	if(feed){
		url = url + c + 'feed=' + feed;
		c = '&';
	}
	if(limit){
		url = url + c + 'limit=' + limit;
		c = '&';
	}
	console.log(url);
	request(url, function (error, response, body) {
		res.send(body);
	});
}

Couchbase.prototype.createOneDocument = function(req, res){
	var id = req.param('id');
	var data = req.param('data');
	var rev = req.param('rev');

	this.createDocument(data, id, rev, function (body) {
	    res.send(body);
	});
}

Couchbase.prototype.createDocument = function(data, id, rev, callback){
	/*
	PUT request creates a new document or creates a new revision of an existing document. It enables you to specify the identifier for a new document rather than letting the software create an identifier. If you want to create a new document and let the software create an identifier, use the POST /db request.
	*/
	if(id){
		var url = couchbase_url + id;// + "?rev=1-6ce693a074bd23a6d695d3423dc13a0f";
		if(rev){
			url += "?rev=" + rev;
		}
		
		request({
				method: 'PUT',
				uri: url,
				multipart: [{
				   'content-type':'application/json',
				   body: data
				}]
			}, 
			function(error, request, body) {
				if(callback)
					callback(body);
				//res.send(body);
			});
	} else {
		request({
				method: 'POST',
				uri: couchbase_url,
				multipart: [{
				   'content-type':'application/json',
				   body: data
				}]
			},
			function(error, request, body) {
				if(callback)
					callback(body);
				//res.send(body);
			});
	}
}

module.exports = Couchbase;