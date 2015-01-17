
var createTextStyle = function(feature, resolution, offsetY) {
  var color = feature.get('abandoned') ? '#222222' : '#000000';
  var inverse = feature.get('abandoned') ? '#dddddd' : '#ffffff';
  var fill = inverse;
  var stroke = color;
  
  if (resolution > 16) {
    if ([PointType.country, PointType.state, PointType.region, PointType.city].indexOf(feature.get('type')) === -1) {
      return;
    }
    fill = color;
    stroke = inverse;
  }

  return new ol.style.Text({
    // textAlign: align,
    // textBaseline: baseline,
    font: '' + (feature.get('type') === 'city' ? 16 : 12) + 'px Lato, Arial',
    text: /*resolution > 16 ? feature.get('code') || '' :*/ feature.get('name') || '?',
    fill: new ol.style.Fill({color: fill}),
    stroke: new ol.style.Stroke({color: stroke, width: resolution > 16 ? 2.5 : 1.5}),
    // offsetX: offsetX,
    offsetY: offsetY,
    // rotation: rotation
  });
};

var visible = (function() {
  var visible = ['points'];
  var r = {
    isVisible: function(name) {
      return visible.indexOf(name) !== -1;
    },
    hide: function(name) {
      if (r.isVisible(name)) {
        visible.splice(visible.indexOf(name), 1);
      }
    },
    show: function(name) {
      if (!r.isVisible(name)) {
        visible.push(name);
      }
    }
  };
  return r;
})();

function getLocalityIcon(feature) {
  if (feature.get('icon')) {
    return new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 0.5],
      opacity: 1,
      src: 'img/' + feature.get('icon') + '.png',
      // size: [16, 16]
    }));
  }
  return;
}

// Points
var createPointStyleFunction = function(visible) {
  if (visible === 'points') {
    return function(feature, resolution) {
      if ([PointType.country, PointType.state, PointType.region, PointType.city, PointType.farm].indexOf(feature.get('type')) !== -1) {
        return [];
      }
      
      if (feature.get('type') === PointType.biome) {
        return [new ol.style.Style({
          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 0.5],
            opacity: 1,
            src: 'img/' + feature.get('name') + '.png',
            // size: [16, 16]
          }))
        })];
      } else if (resolution >= 4 && feature.get('type') === PointType.locality) {
        var image = getLocalityIcon(feature);
        return [new ol.style.Style({
          text: createTextStyle(feature, resolution, image ? -16 : -1),
          image: image
        })];
      }
    }
  }

  return function(feature, resolution) {
    if ([PointType.country, PointType.state, PointType.region, PointType.city, PointType.farm, PointType.town, PointType.locality].indexOf(feature.get('type')) === -1) {
      return [];
    }

    if (feature.get('abandoned') && visible !== 'abandoned' && resolution > 8) {
      return [];
    } else if (!feature.get('abandoned') && visible === 'abandoned') {
      return [];
    }
    
    if (resolution >= 16 && feature.get('type') === PointType.farm) {
      return [];
    }
    if (resolution >= 4 && feature.get('type') === PointType.locality) {
      return [];
    }
    
    var offsetY = -1;
    if (resolution <= 16 && (feature.get('type') === PointType.city || feature.get('type') === PointType.town || feature.get('type') === PointType.locality)) {
      offsetY = -20;
    }
    if (resolution <= 16 && feature.get('type') === PointType.locality) {
      offsetY = -20;
    }

    var style = {
      text: createTextStyle(feature, resolution, offsetY)
    };
    
    
    
    // if ([PointType.country, PointType.state, PointType.region, PointType.city].indexOf(feature.get('type')) !== -1) {
    if (feature.get('type') === PointType.city && resolution > 16) {
      var styleOptions = {
        radius: 15,
        fill: new ol.style.Fill({color: 'white'}),
        stroke: new ol.style.Stroke({
          color: feature.get('abandoned') ? 'rgba(255,53,39, 0.5)' : '#999999',
          width: 2
        })
      };

      if (feature.get('code')) {
        if (feature.get('market')) {
          styleOptions.radius += 2;
          styleOptions.stroke = new ol.style.Stroke({color: '#065C27', width: 4});
        }
        var nether = feature.get('nether');
        if (typeof nether === 'object' && nether.public === true) {
          styleOptions.radius += 2;
          styleOptions.fill = new ol.style.Fill({color: '#DE6868'});
        }
      }

      style.image = new ol.style.Circle(styleOptions);
    }

    if (feature.get('type') === PointType.locality) {
      style.image = getLocalityIcon(feature);
    }

    return [new ol.style.Style(style)];
  };
};

var citiesSource = new ol.source.GeoJSON({
  projection: 'minecraft',
  url: 'cities.geojson'
});

citiesSource.on('change', function(e) {
  citiesSource.un('change', arguments.callee);
});

var citiesLayer = new ol.layer.Vector({
  name: 'cities',
  source: citiesSource,
  style: createPointStyleFunction('cities')
});

var abandonedLayer = new ol.layer.Vector({
  name: 'abandoned',
  visible: false,
  source: citiesSource,
  style: createPointStyleFunction('abandoned')
});

var pointsLayer = new ol.layer.Vector({
  name: 'points',
  visible: false,
  source: citiesSource,
  style: createPointStyleFunction('points')
});


var element = document.getElementById('popup');
var popup = new ol.Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false
});


var map;
exports.init = function(_map) {
  map = _map;
  map.addLayer(abandonedLayer);
  map.addLayer(citiesLayer);
  map.addLayer(pointsLayer);

  map.addOverlay(popup);
};

exports.toggleVisible = function(name, show) {
  if (visible.isVisible(name)) {
    visible.hide(name);
  } else {
    visible.show(name);
  }
  citiesLayer.setStyle(createPointStyleFunction());
  return visible.isVisible(name);
};

exports.jump = function(code) {
  var view = map.getView();
  var duration = 1000;
  var start = +new Date();
  var pan = ol.animation.pan({
    duration: duration,
    source: /** @type {ol.Coordinate} */ (view.getCenter()),
    start: start
  });
  var zoom = ol.animation.zoom({
    duration: duration,
    resolution: view.getResolution(),
    start: start
  });
  map.beforeRender(pan, zoom);

  
  var feature = citiesSource.getFeatures().filter(function(feature) {
    return feature.get('code') === code;
  });

  if (feature[0].get('status') !== 'OK' && !visible.isVisible('abandoned')) {
    visible.show('abandoned');
  }

  view.setCenter(feature[0].getGeometry().getCoordinates());
  view.setZoom(6);
};

exports.closestFeature = function(coords) {
  return citiesSource.getClosestFeatureToCoordinate(coords);
};

var PointType = {
  'country': 'country',
  'state': 'state',
  'region': 'region', // less precise
  'city': 'city',
  'neighbourhoood': 'neighbourhoood',
  'town': 'town',
  'farm': 'farm',

  'biome': 'biome',
  'locality': 'locality' // anything that doesn't fit elsewhere
}

exports.PointType = PointType;

citiesSource.once('change', function() {
  var xhr = new window.XMLHttpRequest();
  xhr.open('GET', 'http://civtrade.com/api/cities.php?token=a0vp6mcbxja0', true);
  xhr.addEventListener("load", function() {
    var response = typeof xhr.response === 'string' ? JSON.parse(xhr.response) : xhr.response;
    response = response.map(function(item) {
      if (typeof item === 'string') {
        return item.toUpperCase();
      } else if (typeof item === 'object') {
        return item.name.toUpperCase();
      } else {
        return item;
      }
    });

    citiesSource.forEachFeature(function(feature, index) {
      feature.setProperties({
        'market': response.indexOf(feature.get('name').toUpperCase()) !== -1 ? 'http://civtrade.com/?want=&have=&loc=' + feature.get('name') : null
      });
    });
  }, false);
  xhr.send(null);
});