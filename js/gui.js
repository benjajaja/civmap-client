var layers = {
  rails: require('./railsLayer.js'),
  points: require('./pointLayer.js'),
  civballs: require('./civballsLayer.js'),
  lineout: require('./lineoutLayer.js')
};

var pointLayer = require('./pointLayer.js');
module.exports = function(map) {
  $('#dropdown-layers a[data-toggle-layer]').click(function(e) {
    $(e.currentTarget).find('.glyphicon-ok').css({
      opacity: layers[$(e.currentTarget).attr('data-toggle-layer')].toggle() ? 1 : 0
    });
  });
  $('#dropdown-layers a[data-toggle-points]').click(function(e) {
    $(e.currentTarget).find('.glyphicon-ok').css({
      opacity: layers.points.toggleVisible($(e.currentTarget).attr('data-toggle-points')) ? 1 : 0
    });
  });


  $('#jumpHome').click(function() {
    var view = map.getView();
    var duration = 1000;
    var start = +new Date();
    var pan = ol.animation.pan({
      duration: duration,
      source: /** @type {ol.Coordinate} */ (view.getCenter()),
      start: start
    });
    var bounce = ol.animation.bounce({
      duration: duration,
      resolution: 32,
      start: start
    });
    map.beforeRender(pan, bounce);
    view.setCenter([0, 0]);
  });


  $('#jump').change(function(e) {
    pointLayer.jump($(e.target).val());
  });

  // Allow Bootstrap dropdown menus to have forms/checkboxes inside, 
  // and when clicking on a dropdown item, the menu doesn't disappear.
  $(document).on('click', '.dropdown-menu.dropdown-menu-form', function(e) {
    if ($(e.target).closest('.menuitem-noclose').length > 0) {
      e.stopPropagation();
    }
  });

  $('#geturl').on('click', function(e) {
    e.preventDefault();
    var view = map.getView();
    var zoom = Math.min(8, Math.max(2, view.getZoom()));
    if (zoom !== view.getZoom()) {
      map.beforeRender(ol.animation.zoom({
        duration: 1000,
        resolution: map.getView().getResolution(),
      }));
      view.setZoom(zoom);
    }
    window.location.hash = zoom + '/' + view.getCenter().map(function(p, index) {
      return Math.floor(p) * (index ? -1 : 1);
    }).join('/');
  });

  var addActions = {
    rail: require('./editMode.js').addRail,
    city: require('./editMode.js').addCity
  }
  $('#dropdown-add a[data-add]').click(function(e) {
    addActions[$(e.currentTarget).attr('data-add')]();
  });
};