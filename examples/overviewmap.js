import _ol_Map_ from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import _ol_control_ from '../src/ol/control.js';
import _ol_control_OverviewMap_ from '../src/ol/control/OverviewMap.js';
import _ol_layer_Tile_ from '../src/ol/layer/Tile.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';

var map = new _ol_Map_({
  controls: _ol_control_.defaults().extend([
    new _ol_control_OverviewMap_()
  ]),
  layers: [
    new _ol_layer_Tile_({
      source: new _ol_source_OSM_()
    })
  ],
  target: 'map',
  view: new _ol_View_({
    center: [500000, 6000000],
    zoom: 7
  })
});
