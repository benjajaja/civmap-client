
var railsSource = new ol.source.GeoJSON({
  projection: 'minecraft',
  url: 'rails.geojson'
});

function hexToRgb(hex) {
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return r + "," + g + "," + b;
}

var vectorLines = new ol.layer.Vector({
  name: 'rails',
  source: railsSource,
  style: function(feature, resolution) {
    var color;
    if (resolution > 16) {
      color = feature.get('color') || 'rgba(200,200,200,1)';
    } else {
     color = feature.get('color') ? 'rgba(' + hexToRgb(feature.get('color').slice(1)) + ',0.75)' : 'rgba(200,200,200,0.75)';
    }

    var style = {
      stroke: new ol.style.Stroke({
        color: color,
        width: resolution >= 32 ? 10 : Math.min(8, Math.max(6, Math.floor(resolution / 16))),
        lineDash: feature.get('unconfirmed') ? [5, 10] : undefined
      })
    };
    if (resolution <= 16) {
      style.image = new ol.style.Circle({
        radius: resolution >= 32 ? 14 : Math.max(10, 2 / resolution),
        fill: new ol.style.Fill({color: 'white'}),
        stroke: new ol.style.Stroke({color: color, width: 4})
      });
    }
    return [new ol.style.Style(style)];
  }
});

exports.init = function(map) {
  map.addLayer(vectorLines);
};

railsSource.on('change', function(e) {
  railsSource.un('change', arguments.callee);

  setTimeout(function() {
    var endPoints = [];
    var addPoint = function(coordinate, color, isJunction) {
      var point = new ol.Feature({
        geometry: new ol.geom.Point(coordinate),
        color: color,
        junction: isJunction
      });
      endPoints.push(point);
    };
    railsSource.getFeatures().forEach(function(feature, i) {
      var junction = feature.get('junction');
      addPoint(feature.getGeometry().getFirstCoordinate(), feature.get('color'), junction === 'start' || junction === 'both');
      addPoint(feature.getGeometry().getLastCoordinate(), feature.get('color'), junction === 'end' || junction === 'both');
    });

    setTimeout(function() {
      endPoints = endPoints.filter(function(feature, index) {
        var radius = 15;
        var coord = feature.getGeometry().getCoordinates();
        for (var i = index + 1, ii = endPoints.length; i < ii; i++) {
          var geometry = endPoints[i].getGeometry();
          var nearCoord = geometry.getCoordinates();
          if (Math.abs(coord[0] - nearCoord[0]) < radius && Math.abs(coord[1] - nearCoord[1]) < radius) {
            geometry.setCoordinates([(coord[0] + nearCoord[0]) / 2, (coord[1] + nearCoord[1]) / 2]);
            if (endPoints[i].get('color') !== feature.get('color')) {
              endPoints[i].set('color', '#333333')
            }
            return false;
          }
        }
        return true;
      });

      setTimeout(function() {
        railsSource.addFeatures(endPoints);
      }, 0);
    }, 0)
  }, 200);
});

var showRails = true;
vectorLines.setVisible(showRails);
exports.toggle = function() {
  showRails = !showRails;
  vectorLines.setVisible(showRails);
  return showRails;
}