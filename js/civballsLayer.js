var pixelProjection = new ol.proj.Projection({
  code: 'pixel',
  units: 'pixels',
  extent: [-15000, -15000, 15000, 15000]
});

var layer = new ol.layer.Image({
  source:  new ol.source.ImageStatic({
    attributions: [
      new ol.Attribution({
        html: 'CivBalls by <a href="http://reddit.com/u/soraendo">soraendo</a>'
      })
    ],
    url: 'img/civballs.png',
    projection: pixelProjection,
    imageSize: [1980, 2112],
    imageExtent: [-15500, -16000, 15000, 16000],
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