require('./libs/ol.js');
// require('polyfill-webcomponents');

setTimeout(function() {
	var map = require('./map.js').init();

	require('./controls.js').init(map);

	require('./lineoutLayer.js').init(map);

	require('./claimsLayer.js').init(map);

	require('./railsLayer.js').init(map);

	require('./pointLayer.js').init(map);

	require('./civballsLayer.js').init(map);

	// require('./gui.js')(map);

	require('./editMode.js').init(map);

	require('./github.js').init();

	require('./socket.js').init(map);

	// to hijack map
  	window.map = map;
  	window.addRail = require('./editMode.js').addRail;
  	window.addCity = require('./editMode.js').addCity;
}, 0);