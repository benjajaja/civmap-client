var blocksToCoords = function(position) {
  return [parseInt(position[0]), parseInt(position[1])].map(function(c, i) {
    return c * (i ? -1 : 1) * (9190000 / 15000);
  });
};
var NaNsToZeros = function(array) {
  return array.map(function(e) {
    return isNaN(e) ? 0 : e;
  });
};

var projection = new ol.proj.Projection({
  code: 'minecraft',
  units: 'pixels',
  extent: [-32770, -32770, 32770, 32770],
  global: false
});
ol.proj.addProjection(projection);
ol.proj.addCoordinateTransforms('EPSG:4326', projection,
  function(coords) {
    return [coords[0], coords[1] * -1];
  },
  function(coords) {
    return [coords[0], coords[1] * -1];
  }
);

exports.init = function() {
  var map = new ol.Map({
    // renderer: 'webgl',
    visible: true,
    target: 'map',
    controls: [],
    layers: [
      new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [new ol.Feature({
            geometry: new ol.geom.Circle([0, 0], 15000)
          })]
        }),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: '#cccccc'
          })
        })
      }),
      new ol.layer.Tile({
        name: 'tiles',
        source:  new ol.source.TileImage({
          attributions: [
            new ol.Attribution({
              html: 'Player map data compiled by pavel_the_hitman at r/civtransport, interface by GipsyKing'
            })
          ],
          // tileUrlFunction: ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('http://civcraft.slimecraft.eu/tiles/{z}/tile_{x}_{-y}_normal.png')),
          tileUrlFunction: function(coordinate, ratio, projection) {
            coordinate = coordinate.getZXY();
            return 'tiles/' + coordinate[0] + '/' + coordinate[1] + '/' + coordinate[2] + '.png'
          },
          // ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('tiles/{z}/{x}/{y}.png')),
          // tileUrlFunction: ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('http://localhost:8888/v2/civcraft/{z}/{x}/{y}.png')),
          // tileGrid: new ol.tilegrid.XYZ({maxZoom: 14}),
          // tilePixelRatio: 2,
          projection: 'EPSG:3857',
          maxZoom: 12,
          // minZoom: 4,
          // extent: [-size, -size, size, size],
          wrapX: true
        })
      }),


      
      // new ol.layer.Tile({
      //   source: new ol.source.TileDebug({
      //     projection: 'EPSG:3857',
      //     tileGrid: new ol.tilegrid.XYZ({
      //       maxZoom: 22
      //     })
      //   })
      // })
    ],
    view: new ol.View({
      projection: 'minecraft',
      center: (function(coords) {
        if (!coords || coords.length !== 2 || isNaN(parseInt(coords[0])) || isNaN(parseInt(coords[1]))) {
          return [0, 0];
        }
        return [parseInt(coords[0]), parseInt(coords[1]) * -1];
      })(window.location.hash.substr(1).split('/').slice(1)),
      zoom: Math.min(8, Math.max(2, parseInt(window.location.hash.substr(1).split('/').slice(0, 1)) || 3)),
      minZoom: 1,
      maxZoom: 12
    })
  });
  
  map.addLayer(new ol.layer.Tile({
    name: 'night',
    visible: false,
    source:  new ol.source.TileImage({
      attributions: [
        new ol.Attribution({
          html: 'Player map data compiled by pavel_the_hitman at r/civtransport, interface by GipsyKing'
        })
      ],
      // tileUrlFunction: ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('http://civcraft.slimecraft.eu/tiles/{z}/tile_{x}_{-y}_normal.png')),
      tileUrlFunction: function(coordinate, ratio, projection) {
        coordinate = coordinate.getZXY();
        return 'night/' + coordinate[0] + '/' + coordinate[1] + '/' + coordinate[2] + '.png'
      },
      // ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('tiles/{z}/{x}/{y}.png')),
      // tileUrlFunction: ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('http://localhost:8888/v2/civcraft/{z}/{x}/{y}.png')),
      // tileGrid: new ol.tilegrid.XYZ({maxZoom: 14}),
      // tilePixelRatio: 2,
      projection: 'EPSG:3857',
      maxZoom: 12,
      // minZoom: 4,
      // extent: [-size, -size, size, size],
      wrapX: true
    })
  }));

  map.addLayer(new ol.layer.Tile({
    name: 'mapwriter',
    visible: false,
    source:  new ol.source.TileImage({
      attributions: [
        new ol.Attribution({
          html: 'Amunak'
        })
      ],
      // tileUrlFunction: ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('http://civcraft.slimecraft.eu/tiles/{z}/tile_{x}_{-y}_normal.png')),
      tileUrlFunction: function(coordinate, ratio, projection) {
        coordinate = coordinate.getZXY();
        // https://amunak.net/store/private/cmap/images/z4/-3.0.png
        var offset = Math.pow(2, coordinate[0] - 1);
        return 'https://amunak.net/store/private/cmap/images/z'
          + (7 - coordinate[0])
          + '/' + (coordinate[1] - offset)
          + '.' + (coordinate[2] * -1  + offset - 1) + '.png'
      },
      // ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('tiles/{z}/{x}/{y}.png')),
      // tileUrlFunction: ol.TileUrlFunction.createFromTemplates(ol.TileUrlFunction.expandUrl('http://localhost:8888/v2/civcraft/{z}/{x}/{y}.png')),
      // tileGrid: new ol.tilegrid.XYZ({maxZoom: 14}),
      tilePixelRatio: 2,
      projection: 'EPSG:3857',
      maxZoom: 12,
      // minZoom: 4,
      // extent: [-size, -size, size, size],
      wrapX: true
    })
  }));

  map.on('click', function(e) {
    var event = new CustomEvent('map-click', {detail: e.pixel});
    document.getElementById('map').dispatchEvent(event);
  });

  return map;
};

