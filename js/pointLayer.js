
var createTextStyle = function(feature, resolution, dom) {
  var fontSize = resolution < 5000 ? 16 : 12;
  return new ol.style.Text({
    // textAlign: align,
    // textBaseline: baseline,
    font: 'bold ' + fontSize + 'px Arial',
    text: resolution > 16 ? feature.get('code') || '' : feature.get('name') || '?',
    fill: new ol.style.Fill({color: '#000000'}),
    stroke: new ol.style.Stroke({color: '#ffffff', width: 2}),
    // offsetX: offsetX,
    // offsetY: offsetY,
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
var createPointStyleFunction = function() {
  return function(feature, resolution) {
    if (!visible.isVisible('abandoned') && feature.get('abandoned')) {
      return [];
    }
    if (!visible.isVisible('biomes') && feature.get('type') === PointType.biome) {
      return [];
    }
    if (!visible.isVisible('points') && feature.get('type') !== PointType.biome) {
      return [];
    }

    // if (resolution > 16 && [PointType.country, PointType.state, PointType.region, PointType.city].indexOf(feature.get('type')) === -1) {
    //   return [];
    // }
    if (resolution > 16 && [PointType.farm, PointType.locality].indexOf(feature.get('type')) !== -1) {
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
    }

    var style = {
      text: createTextStyle(feature, resolution, {})
    };
    
    var color;
    if ([PointType.country, PointType.state, PointType.region, PointType.city].indexOf(feature.get('type')) !== -1) {
      color = feature.get('abandoned') ? 'rgba(255, 0, 0, 0.5)' : 'rgba(256, 256, 256, 0.5)';
    } else if (feature.get('type') === PointType.farm) {
      color = 'rgba(256, 256, 0, 0.5)';
    } else if (feature.get('type') === PointType.biome) {
      color = 'rgba(0, 256, 0, 0.5)';
    } else {
      color = 'rgba(256, 256, 256, 0.25)';
    }

    if (resolution > 8 && feature.get('code')) {
      style.image = new ol.style.Circle({
        radius: 15,
        fill: new ol.style.Fill({color: color}),
        stroke: new ol.style.Stroke({color: 'gray', width: 1})
      });
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
  var select = $('#jump');
  e.target.getFeatures().sort(function(a, b) {
    var textA = a.get('name'), textB = b.get('name');
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  }).forEach(function(feature) {
    if (!feature.get('code') || !feature.get('name')) {
      return;
    }
    select.append($('<option value="' + feature.get('code') + '">').text(feature.get('name')));
  });
});
var vectorPoints = new ol.layer.Vector({
  source: citiesSource,
  style: createPointStyleFunction()
});



var element = document.getElementById('popup');
var popup = new ol.Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false
});

var clickHandler = function(evt) {
  $(element).popover('destroy');

  var feature = evt.map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });
  if (feature && feature.getGeometry().getType() === 'Point' && feature.get('name')) {
    var geometry = feature.getGeometry();
    var coord = geometry.getCoordinates();
    popup.setPosition(coord);
    var html = $('<div/>');
    if (feature.get('flag')) {
      var img = $(feature.get('flag'));
      img.css({height: '40px', float: 'right'});
      html.append(img);
    }

    html.append($('<strong>' + feature.get('name') + '</strong>'));

    if (feature.get('reddit')) {
      html.append('<br/>').append($(feature.get('reddit')));
    }

    html.append('<br/>').append('<a href="http://civcraft.org/doku.php?id=towns:' + feature.get('name').toLowerCase() + '" target="blank">Wiki</a>');
    
    $(element).popover({
      'placement': 'top',
      'html': true,
      'content': html
    });
    $(element).popover('show');
  } else if (feature) {
    // console.log(JSON.stringify(feature.getGeometry().getCoordinates()), feature.getProperties());
  }
};

var map;
exports.init = function(_map) {
  map = _map;
  map.addLayer(vectorPoints);

  map.addOverlay(popup);
  map.on('click', clickHandler);
};

exports.toggleVisible = function(name, show) {
  if (visible.isVisible(name)) {
    visible.hide(name);
  } else {
    visible.show(name);
  }
  vectorPoints.setStyle(createPointStyleFunction());
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