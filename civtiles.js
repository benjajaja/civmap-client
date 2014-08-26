var fs = require('fs');
var async = require('async');
var request = require('request');

// var tiles = [];
// for (var y = -30; y <= 30; y++) {
// 	for (var x = -30; x <= 29; x++) {
// 		tiles.push('tile_' + x + '_' + y + '_normal.png');
// 	}
// }

var dir = '/home/benja/.minecraft/journeyMap/data/mp/mc.civcraft.vg_0/DIM0/day/'
// -9,-21.png

var tiles = [];
for (var y = -30; y <= 30; y++) {
	for (var x = -30; x <= 29; x++) {
		if (fs.existsSync(dir + x + ',' + y + '.png')) {
			tiles.push(x + ',' + y + '.png');
		} else {
			tiles.push('/home/benja/minecraft/empty.png');
		}
	}
}

// async.series(tiles.map(function(tile) {
// 	return function(callback) {
// 		request('http://civcraft.slimecraft.eu/tiles/4/' + tile).pipe(fs.createWriteStream('tiles/' + tile)).on('close', callback);
// 	}
// }));

process.stdout.write('montage -verbose -mode concatenate -tile 60x60 ' + tiles.join(' ') + ' journeymap.png');