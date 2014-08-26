exports.init = function(map) {
	map.addControl(new ol.control.MousePosition({
	  coordinateFormat: ol.coordinate.createStringXY(4),
	  // projection: 'minecraft',
	  // comment the following two lines to have the mouse position
	  // be placed within the map.
	  className: 'custom-mouse-position',
	  target: document.getElementById('position'),
	  undefinedHTML: '&nbsp;',
	  coordinateFormat: function(coordinate) {
	    return Math.floor(coordinate[0]) + ',' + Math.floor(coordinate[1] * -1);
	  }
	}));
};