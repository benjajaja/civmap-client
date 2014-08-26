var map = require('./map.js');

require('./controls.js').init(map);

require('./lineoutLayer.js').init(map);

require('./railsLayer.js').init(map);

require('./pointLayer.js').init(map);

require('./civballsLayer.js').init(map);

require('./gui.js')(map);

require('./editMode.js').init(map);
