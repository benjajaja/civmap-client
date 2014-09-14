var map;
var featureOverlay;
var pointLayer = require('./pointLayer.js');
exports.init = function(_map) {
  map = _map;
  featureOverlay = new ol.FeatureOverlay({
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33'
        })
      })
    })
  });
  featureOverlay.setMap(map);

  var modify = new ol.interaction.Modify({
    features: featureOverlay.getFeatures(),
    // the SHIFT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function(event) {
      return ol.events.condition.shiftKeyOnly(event) &&
          ol.events.condition.singleClick(event);
    }
  });
  map.addInteraction(modify);

  // map.addInteraction(new ol.interaction.Select());
  setTimeout(function() {
    window.modifyFeatures();
  }, 0);
};

var draw; // global so we can remove it later
var cityTpes = [
  pointLayer.PointType.city,
  pointLayer.PointType.town,
  pointLayer.PointType.farm,
  pointLayer.PointType.neighbourhood,
  pointLayer.PointType.locality
];
var geojson = new ol.format.GeoJSON();
exports.addRail = function() {
  if (!confirm('You will enter draw-rail mode. Click to start placing your line, keep clicking to add corners, and double click where you want your last point to be.\n'
    + 'Then there will be prompts for origin and destination city names (click cancel if not a city, enter something like "CIC-red-blue" for rail interchanges).\n'
    + '\n'
    + 'Draw lines most exactly where they go, all hoops included. If you mess up just start again. If in doubt, read the subreddit guidelines first.\n'
    + '\n'
    + 'Continue?')) {
    return;
  }
  draw = new ol.interaction.Draw({
    features: featureOverlay.getFeatures(),
    type: /** @type {ol.geom.GeometryType} */ ('LineString')
  });
  map.addInteraction(draw);
  
  draw.on('drawstart', function(e) {
    var closest = pointLayer.closestFeature(e.feature.getGeometry().getFirstCoordinate());
    if (closest && closest.get('name') && cityTpes.indexOf(closest.get('type')) !== -1) {
      e.feature.set('origin', closest.get('name'));
    }
  });
  draw.on('drawend', function(e) {
    var feature = e.feature;
    feature.set('origin', prompt('Origin', feature.get('origin') || ''));

    var closest = pointLayer.closestFeature(e.feature.getGeometry().getLastCoordinate());
    if (closest && closest.get('name') && cityTpes.indexOf(closest.get('type')) !== -1) {
      e.feature.set('destination', closest.get('name'));
    }
    feature.set('destination', prompt('Destination', feature.get('destination') || ''));

    var json = geojson.writeFeature(e.feature);
    json.geometry.coordinates = json.geometry.coordinates.map(function(c) {
      return [Math.floor(c[0]), Math.floor(-c[1])];
    });
    map.removeInteraction(draw);
    window.open('http://www.reddit.com/r/civtransportmap/submit?selftext=true&title=[RAIL]&text=' + JSON.stringify(json));
    
    // console.log(JSON.stringify(feature));
  });
};

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.addCity = function() {
  draw = new ol.interaction.Draw({
    features: featureOverlay.getFeatures(),
    type: /** @type {ol.geom.GeometryType} */ ('Point')
  });
  map.addInteraction(draw);
  draw.on('drawend', function(e) {
    map.removeInteraction(draw);

    var feature = e.feature;
    feature.set('type', prompt('Type (one of: city, town, farm, locality, biome)'));
    if (Object.keys(pointLayer.PointType).indexOf(feature.get('type')) === -1) {
      return alert('Unknown point type');
    } else if (feature.get('type') === 'biome') {
      feature.set('name', prompt('Biome type (mushroom or nether)'));
    } else if (cityTpes.indexOf(feature.get('type')) !== -1) {
      feature.set('name', prompt('Name'));
      feature.set('code', prompt('Code (unique, 2 letters preferred)'));
      [
        {'name': 'reddit', 'type': 'link'},
        {'name': 'flag', 'type': 'image'},
        {'name': 'marketplace', 'type': 'link'}
      ].forEach(function(property) {
        var value = prompt(capitalize(property.name) + (property.type === 'link' ? ' (URL, leave empty if none)' : ' (direct image link, leave empty if none)'));
        if (value) {
          feature.set(property.name, value);
        }
      });

    } else {
      feature.set('name', prompt('Name'));
    }
    
    
    
    

    var json = geojson.writeFeature(e.feature);
    json.geometry.coordinates = json.geometry.coordinates.map(function(c, i) {
      return Math.floor(c) * (i === 1 ? -1 : 1);
    });
    window.open('http://www.reddit.com/r/civtransportmap/submit?selftext=true&title=[POINT]&text=' + JSON.stringify(json));
    
    // console.log(JSON.stringify(feature));
  });
}

window.modifyFeatures = function() {
  var overlayStyle = (function() {
    /* jshint -W069 */
    var styles = {};
    styles['Polygon'] = [
      new ol.style.Style({
        fill: new ol.style.Fill({
          color: [255, 255, 255, 0.5]
        })
      }),
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: [255, 255, 255, 1],
          width: 5
        })
      }),
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: [0, 153, 255, 1],
          width: 3
        })
      })
    ];
    styles['MultiPolygon'] = styles['Polygon'];

    styles['LineString'] = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: [255, 255, 255, 1],
          width: 5
        })
      }),
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: [0, 153, 255, 1],
          width: 3
        })
      })
    ];
    styles['MultiLineString'] = styles['LineString'];

    styles['Point'] = [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: [0, 153, 255, 1]
          }),
          stroke: new ol.style.Stroke({
            color: [255, 255, 255, 0.75],
            width: 1.5
          })
        }),
        zIndex: 100000
      })
    ];
    styles['MultiPoint'] = styles['Point'];

    styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);

    return function(feature, resolution) {
      return styles[feature.getGeometry().getType()];
    };
    /* jshint +W069 */
  })();
  var select = new ol.interaction.Select({
    style: overlayStyle
  });

  var modify = new ol.interaction.Modify({
    features: select.getFeatures(),
    style: overlayStyle
  });

  window.exportModified = function() {
    window.map.getLayers().forEach(function(layer) {
      if (layer.getProperties().name === 'rails') {
        var collection = {
          type: 'FeatureCollection',
          features: []
        };
        layer.getSource().getFeatures().forEach(function(feature) {
          var json = geojson.writeFeature(feature);
          json.geometry.coordinates = json.geometry.coordinates.map(function(c) {
            return [Math.floor(c[0]), Math.floor(-c[1])];
          });
          collection.features.push(json);
        });
        collection.features.sort(function(a, b) {
          if (a.properties.origin === b.properties.origin) {
            if (a.properties.destination === null) {
              return b.properties.destination === null ? 0 : -1;
            } else if (b.properties.destination === null) {
              return -1;
            }
            return a.properties.destination.localeCompare(b.properties.destination);
          }

          if (a.properties.origin === null) {
            return b.properties.origin === null ? 0 : -1;
          } else if (b.properties.origin === null) {
            return -1;
          }
          return a.properties.origin.localeCompare(b.properties.origin);
        });
        // window.open('http://www.reddit.com/r/civtransportmap/submit?selftext=true&title=[EDIT-RAILS]&text=' + JSON.stringify(collection, null, '  '));
        // window.prompt('Select text, Ctrl+C to copy', JSON.stringify(collection, null, '  '));
        // window.open('https://github.com/gipsy-king/civmap-client/edit/master/public/rails.geojson');
        require('./github').update('public/rails.geojson', JSON.stringify(collection, null, '  '));
      }
    });
    // var feature = select.getFeatures().item(0);
    // var json = geojson.writeFeature(feature);
    // console.log(JSON.stringify(json));
    // json.geometry.coordinates = json.geometry.coordinates.map(function(c, i) {
    //   return Math.floor(c) * (i === 1 ? -1 : 1);
    // });
    // window.open('http://www.reddit.com/r/civtransportmap/submit?selftext=true&title=[POINT]&text=' + JSON.stringify(json));
  }
  

  map.addInteraction(select);
  map.addInteraction(modify);
};

