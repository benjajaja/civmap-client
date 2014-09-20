
var createTextStyle = function(feature, resolution, offsetY) {
  var fontSize = resolution < 5000 ? 16 : 12;
  return new ol.style.Text({
    // textAlign: align,
    // textBaseline: baseline,
    font: 'bold ' + 16 + 'px Arial',
    text: resolution > 16 ? feature.get('code') || '' : feature.get('name') || '?',
    fill: new ol.style.Fill({color: '#000000'}),
    stroke: new ol.style.Stroke({color: '#ffffff', width: 2}),
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
      } else if (feature.get('type') === PointType.locality) {
        return [new ol.style.Style({
          text: createTextStyle(feature, resolution, resolution <= 16 ? -20 : 0)
        })];
      }
    }
  }

  return function(feature, resolution) {
    if ([PointType.country, PointType.state, PointType.region, PointType.city, PointType.farm, PointType.town].indexOf(feature.get('type')) === -1) {
      return [];
    }

    if (feature.get('abandoned') && visible !== 'abandoned') {
      return [];
    } else if (!feature.get('abandoned') && visible === 'abandoned') {
      return [];
    }
    
    if (resolution >= 16 && [PointType.farm, PointType.locality].indexOf(feature.get('type')) !== -1) {
      return [];
    }
    

    var style = {
      text: createTextStyle(feature, resolution, resolution <= 16 ? -20 : 1)
    };
    
    if (feature.get('market') && resolution > 16) {
      style.image = new ol.style.Circle({
        radius: 17,
        fill: new ol.style.Fill({color: 'white'}),
        stroke: new ol.style.Stroke({color: '#065C27', width: 4})
      });

    } else {
      var color;
      if ([PointType.country, PointType.state, PointType.region, PointType.city, PointType.town].indexOf(feature.get('type')) !== -1) {
        if (feature.get('abandoned')) {
          color = 'rgba(255,53,39, 0.5)';
        } else {
          color = 'rgba(256, 256, 256, 0.75)'
        }
      } else if (feature.get('type') === PointType.farm) {
        color = 'rgba(168,144,54, 0.5)';
      } else {
        color = 'rgba(256, 256, 256, 0.25)';
      }

      if (color && resolution > 16 && feature.get('code')) {
        style.image = new ol.style.Circle({
          radius: 15,
          fill: new ol.style.Fill({color: 'white'}),
          stroke: new ol.style.Stroke({color: '#999999', width: 2})
        });
        // style.image = new ol.style.Circle({
        //   radius: 15,
        //   fill: new ol.style.Fill({color: color})
        // });
      }
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