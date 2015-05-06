var pixelProjection = new ol.proj.Projection({
  code: 'pixel',
  units: 'pixels',
  extent: [-15000, -15000, 15000, 15000]
});

var url = 'img/claims.svg';
if (window.location.toString().indexOf('svg=') !== -1) {
  url = window.location.toString().split('=')[1];
}

var layer = new ol.layer.Image({
  name: 'claims',
  source: new ol.source.ImageStatic({
    attributions: [
      new ol.Attribution({
        html: 'Claims'
      })
    ],
    url: url,
    projection: pixelProjection,
    imageSize: [2000, 2000],
    imageExtent: [-15000, -15000, 15000, 15000],
  })
});

exports.init = function(map) {
  map.addLayer(layer);
};

var show = true;
layer.setVisible(show);
exports.toggle = function() {
  show = !show;
  layer.setVisible(show);
  return show;
};