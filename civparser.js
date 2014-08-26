var cheerio = require('cheerio');
var request = require('request');
function trim(string) {
	return string.replace(/^\s+|\s+$/g, '');
};
 
request('http://civcraft.slimecraft.eu/map.php', function(error, response, html) {
	var $ = cheerio.load(html);
	var cities = Array.prototype.map.call($('.btn'), function(el) {
		el = $(el);

		return el.attr('data-content').split('<br>').map(function(line) {
			var html = cheerio.load(line);

			var key = html('b').remove().text().replace(/\:$/, '').toLowerCase();

			var value = trim(html.html());

			if (key === 'coordinates') {
				value = value.split(',').map(function(number, index) {
					return (index ? -1 : 1) * parseInt(number) * (9190000 / 15000); // magic!
				});
			} else if (typeof key !== 'undefined' && typeof value !== 'undefined') {
				key = trim(key);
				value = trim(value);
			}

			return {
				key: key,
				value: value
			};
		}).map(function(item) {
			if (item.key === 'coordinates') {
				item = {
					key: 'geometry',
					value: {
						type: "Point",
						coordinates: item.value
					}
				};
			}
			return item;

		}).reduce(function(result, item) {
			if (item.key === 'geometry') {
				result[item.key] = item.value;
			} else if (item.key !== '') {
				result.properties[item.key] = item.value;
			}
			return result;
		}, {
			type: 'Feature',
			properties: {
				name: $(el.attr('data-original-title')).text(),
				code: el.text()
			}
		});
	});

	var codes = [];
	cities = cities.filter(function(city) {
		if (!city.properties.code || codes.indexOf(city.properties.code) === -1) {
			codes.push(city.properties.code);
			return city.properties.name !== 'Cooks Laboratories';
		}
		return false;
	}).sort(function(a, b) {
		return (a.properties.name < b.properties.name) ? -1 : (a.properties.name > b.properties.name) ? 1 : 0;
	})

	process.stdout.write(JSON.stringify({
		type: 'FeatureCollection',
		features: cities
	}, null, '\t'));
});