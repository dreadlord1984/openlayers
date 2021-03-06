import _ol_Map_ from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import _ol_format_GeoJSON_ from '../src/ol/format/GeoJSON.js';
import _ol_interaction_ from '../src/ol/interaction.js';
import _ol_interaction_Select_ from '../src/ol/interaction/Select.js';
import _ol_interaction_Translate_ from '../src/ol/interaction/Translate.js';
import _ol_layer_Tile_ from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';


var raster = new _ol_layer_Tile_({
  source: new _ol_source_OSM_()
});

var vector = new _ol_layer_Vector_({
  source: new _ol_source_Vector_({
    url: 'data/geojson/countries.geojson',
    format: new _ol_format_GeoJSON_()
  })
});

var select = new _ol_interaction_Select_();

var translate = new _ol_interaction_Translate_({
  features: select.getFeatures()
});

var map = new _ol_Map_({
  interactions: _ol_interaction_.defaults().extend([select, translate]),
  layers: [raster, vector],
  target: 'map',
  view: new _ol_View_({
    center: [0, 0],
    zoom: 2
  })
});
