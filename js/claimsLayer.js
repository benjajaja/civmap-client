var url = 'img/claims.svg';
if (window.location.toString().indexOf('svg=') !== -1) {
  url = window.location.toString().split('=')[1];
}

var layer;
function createLayer() {
  var pixelProjection = new ol.proj.Projection({
    code: 'pixel',
    units: 'pixels',
    extent: [-15000, -15000, 15000, 15000]
  });
  layer = new ol.layer.Image({
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
}

exports.init = function(map) {
  createLayer();
  map.addLayer(layer);
};

var show = true;

exports.toggle = function() {
  show = !show;
  if (typeof layer === 'undefined') {
    createLayer();
  }
  layer.setVisible(show);
  return show;
};