
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
    var color = feature.get('color') ? 'rgba(' + hexToRgb(feature.get('color').slice(1)) + ',0.75)' : 'rgba(200,200,200,0.75)';

    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
          color: color,
          width: Math.min(8, Math.max(6, Math.floor(resolution / 16))),
          lineDash: feature.get('unconfirmed') ? [5, 10] : undefined
        }),
      // image: new ol.style.Circle({
      //   radius: 10,
      //   fill: new ol.style.Fill({color: color}),
      //   stroke: new ol.style.Stroke({color: 'gray', width: 1})
      // }),
      // text: createTextStyle(feature, resolution, {})
    });
    return [style];
  }
});

exports.init = function(map) {
  map.addLayer(vectorLines);
};


var showRails = true;
vectorLines.setVisible(showRails);
exports.toggle = function() {
  showRails = !showRails;
  vectorLines.setVisible(showRails);
  return showRails;
}