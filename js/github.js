
var hello = require('./libs/hello.js');
var Base64 = require('./libs/base64.js');

exports.init = function() {
	hello.init({ 
		github: 'd1366771fec5776c4a99'
	},{redirect_uri:'https://auth-server.herokuapp.com/'});
};

var handleError = function(r) {
	console.log('error handling: ', r);
	if (r === false) {
		alert('Undescribed API error');
		throw new Error('Undescribed API error');
	} else if (typeof r === 'object' && typeof r.message === 'string' && (Object.keys(r).length === 1 || Object.keys(r).length === 2)) {
		console.error(r);
		alert('API error: ' + r.message);
		throw new Error('API error: ' + r.message);
	} else if (typeof r.errors === 'object' && r.errors.length > 0) {
		console.error(r);
		alert('API error: ' + r.message);
		throw new Error('API error: ' + r.message);
	}
};
exports.update = function(path, json) {

	hello('github').login({
		scope: 'repo'
	}).then(function(r) {
		handleError(r);

		hello('github').api('/repos/gipsy-king/civmap-client/forks', 'post', {}).then(function(r) {
			handleError(r);
			console.log('forked');
			update(r.full_name, path, r.owner.login, 5);

		}, function() {
			throw new Error('API fork error');
		});
	}, function(r) {
		throw new Error('API login error: ' + JSON.stringify(r));
	});

	function update(repo, path, login, retries) {
		console.log('getting /repos/' + repo + '/contents/' + path);
		hello('github').api('/repos/' + repo + '/contents/' + path, 'get', {
			path: path
		}).then(function(r) {
			if (r === false || !r.sha) {
				if (retries === 0) {
					return alert('timeout.');
				}
				console.log('retrying...');
				return setTimeout(function() {
					update(repo, path, login, retries - 1);
				}, 3000);
			}
			var file = r;

			var title = prompt('Enter commit message', 'Update ' + path);
			hello('github').api('/repos/' + repo + '/contents/' + path, 'put', {
				path: path,
				message: title,
				content: Base64.encode(json),
				sha: file.sha

			}).then(function(res) {
				handleError(res);

				console.log('changes committed', res);

				if (repo !== 'gipsy-king/civmap-client') {
					hello('github').api('/repos/gipsy-king/civmap-client/pulls', 'post', {
						title: title,
						head: login + ':master',
						base: 'master',
						body: 'Automatic PR'
					}).then(function(r) {
						handleError(r);
						window.open('https://github.com/gipsy-king/civmap-client/pulls');
					}, handleError)
				} else {
					alert('Changes committed');
				}
			}, handleError);
		}, handleError);
	}
	// window.open('https://github.com/login/oauth/authorize?client_id=d1366771fec5776c4a99&redirect_uri=http://txapu.com/#github');
};

window.postit = function() {

};