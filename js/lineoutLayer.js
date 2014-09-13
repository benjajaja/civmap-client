var pixelProjection = new ol.proj.Projection({
  code: 'pixel',
  units: 'pixels',
  extent: [-16000, -16000, 16000, 16000]
});

var layer = new ol.layer.Image({
  name: 'svg',
  source:  new ol.source.ImageStatic({
    attributions: [
      new ol.Attribution({
        html: 'Lineout by kovio'
      })
    ],
    url: 'img/kovio2.svg',
    projection: pixelProjection,
    imageSize: [2000, 2000],
    imageExtent: [-15100, -14900, 16000, 15150],
  })
});

exports.init = function(map) {
  map.addLayer(layer);
};

var show = false;
layer.setVisible(show);
exports.toggle = function() {
  show = !show;
  layer.setVisible(show);
  return show;
};