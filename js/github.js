
require('./libs/hello.min.js');

exports.init = function() {
	hello.init({ 
		github: 'd1366771fec5776c4a99'
	},{redirect_uri:'http://txapu.com/#github'});

	hello.on('auth.login', function(auth){
		console.log('auth.login');
		// call user information, for the given network
		hello( auth.network ).api( '/me' ).then( function(r){
			// Inject it into the container
			console.log(r.thumbnail);
		});
	});
}

exports.update = function(file, json) {
	hello('github').login().then(function() {
		console.log('yes');

		hello('github').api( '/me' ).then( function(r){
			// Inject it into the container
			console.log(r.thumbnail);
		});
	}, function(e) {
		console.log(e);
		alert('Signin error: ' + e);
	});
	// window.open('https://github.com/login/oauth/authorize?client_id=d1366771fec5776c4a99&redirect_uri=http://txapu.com/#github');
};

window.postit = function() {

}