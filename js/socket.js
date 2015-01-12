var io = require('./libs/socket.io.js');

// don't poop on the event loop
setTimeout(function() {
	if (false && window.location.toString().indexOf('file://') === 0) {
		var socket = io('http://localhost:8666/snitch');
	} else {
		var socket = io('http://txapu.com:8666/snitch');
	}
	
	var addFeature = function(player) {
		var prev = source.getFeatureById('player_' + player.username);
		if (prev) {
			console.log('removeFeature', player.username);
			source.removeFeature(prev);
		}

		var f = new ol.Feature({
			geometry: new ol.geom.Point(player.location.map(function(coord, index) {
				return coord * (!index ? 1 : -1);
			})),
			player: player.username,
			bounty: typeof player.bounty === 'number' ? player.bounty : -1
		});
		f.setId('player_' + player.username);
		source.addFeature(f);
		console.log('add', player.username, player.location);
	};

	socket.on('connect', function() {
		socket.once('list', function(e) {
			e.list.forEach(function(player) {
				addFeature(player);
			});
			if (!(e.online instanceof Array)) {
				throw new Error('not array');
			}
			document.getElementById('map').dispatchEvent(new CustomEvent('map-players', {detail: e.online}));
		});

		socket.on('player', function(player) {
			if (typeof player === 'object') {
				addFeature(player);

			} else if (typeof player === 'string') {
				var prev = source.getFeatureById('player_' + player);
				if (prev) {
					console.log('removeFeature', player.username);
					source.removeFeature(prev);
				}
			}
		});

		socket.on('list', function(online) {
			if (!(online instanceof Array)) {
				console.error('bot is still sending inconsistent "list" event');
				online = online.online;
			}
			document.getElementById('map').dispatchEvent(new CustomEvent('map-players', {detail: online}));
		});
	});
}, 0);

var source = new ol.source.Vector();
var layer = new ol.layer.Vector({
  name: 'players',
  source: source,
  style: createPointStyleFunction()
});

exports.init = function(map) {
  map.addLayer(layer);
};

function createPointStyleFunction() {
    return function(feature, resolution) {
    	return [new ol.style.Style({
         	image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            	anchor: [0.5, 0.5],
            	opacity: 1,
            	src: 'http://mcsk.in/avatar/' + feature.get('player') + '/16',
            	size: [16, 16]
        	})),
        	text: new ol.style.Text({
				// textAlign: align,
				// textBaseline: baseline,
				font: 'bold ' + 12 + 'px Arial',
				text: feature.get('player') + (feature.get('bounty') !== -1 ? ' (bounty!)' : ''),
				fill: new ol.style.Fill({color: '#000000'}),
				stroke: new ol.style.Stroke({color: feature.get('bounty') !== -1 ? '#cc0000' : '#ffffff', width: 1}),
				// offsetX: offsetX,
				offsetY: 16,
				// rotation: rotation
			})
        })];
  	};
}