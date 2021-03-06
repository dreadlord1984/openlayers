/**
 * @module ol/interaction/Pointer
 */
import {inherits, nullFunction} from '../index.js';
import _ol_functions_ from '../functions.js';
import _ol_MapBrowserEventType_ from '../MapBrowserEventType.js';
import _ol_MapBrowserPointerEvent_ from '../MapBrowserPointerEvent.js';
import _ol_interaction_Interaction_ from '../interaction/Interaction.js';
import _ol_obj_ from '../obj.js';

/**
 * @classdesc
 * Base class that calls user-defined functions on `down`, `move` and `up`
 * events. This class also manages "drag sequences".
 *
 * When the `handleDownEvent` user function returns `true` a drag sequence is
 * started. During a drag sequence the `handleDragEvent` user function is
 * called on `move` events. The drag sequence ends when the `handleUpEvent`
 * user function is called and returns `false`.
 *
 * @constructor
 * @param {olx.interaction.PointerOptions=} opt_options Options.
 * @extends {ol.interaction.Interaction}
 * @api
 */
var _ol_interaction_Pointer_ = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var handleEvent = options.handleEvent ?
    options.handleEvent : _ol_interaction_Pointer_.handleEvent;

  _ol_interaction_Interaction_.call(this, {
    handleEvent: handleEvent
  });

  /**
   * @type {function(ol.MapBrowserPointerEvent):boolean}
   * @private
   */
  this.handleDownEvent_ = options.handleDownEvent ?
    options.handleDownEvent : _ol_interaction_Pointer_.handleDownEvent;

  /**
   * @type {function(ol.MapBrowserPointerEvent)}
   * @private
   */
  this.handleDragEvent_ = options.handleDragEvent ?
    options.handleDragEvent : _ol_interaction_Pointer_.handleDragEvent;

  /**
   * @type {function(ol.MapBrowserPointerEvent)}
   * @private
   */
  this.handleMoveEvent_ = options.handleMoveEvent ?
    options.handleMoveEvent : _ol_interaction_Pointer_.handleMoveEvent;

  /**
   * @type {function(ol.MapBrowserPointerEvent):boolean}
   * @private
   */
  this.handleUpEvent_ = options.handleUpEvent ?
    options.handleUpEvent : _ol_interaction_Pointer_.handleUpEvent;

  /**
   * @type {boolean}
   * @protected
   */
  this.handlingDownUpSequence = false;

  /**
   * @type {Object.<string, ol.pointer.PointerEvent>}
   * @private
   */
  this.trackedPointers_ = {};

  /**
   * @type {Array.<ol.pointer.PointerEvent>}
   * @protected
   */
  this.targetPointers = [];

};

inherits(_ol_interaction_Pointer_, _ol_interaction_Interaction_);


/**
 * @param {Array.<ol.pointer.PointerEvent>} pointerEvents List of events.
 * @return {ol.Pixel} Centroid pixel.
 */
_ol_interaction_Pointer_.centroid = function(pointerEvents) {
  var length = pointerEvents.length;
  var clientX = 0;
  var clientY = 0;
  for (var i = 0; i < length; i++) {
    clientX += pointerEvents[i].clientX;
    clientY += pointerEvents[i].clientY;
  }
  return [clientX / length, clientY / length];
};


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @return {boolean} Whether the event is a pointerdown, pointerdrag
 *     or pointerup event.
 * @private
 */
_ol_interaction_Pointer_.prototype.isPointerDraggingEvent_ = function(mapBrowserEvent) {
  var type = mapBrowserEvent.type;
  return type === _ol_MapBrowserEventType_.POINTERDOWN ||
    type === _ol_MapBrowserEventType_.POINTERDRAG ||
    type === _ol_MapBrowserEventType_.POINTERUP;
};


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @private
 */
_ol_interaction_Pointer_.prototype.updateTrackedPointers_ = function(mapBrowserEvent) {
  if (this.isPointerDraggingEvent_(mapBrowserEvent)) {
    var event = mapBrowserEvent.pointerEvent;

    var id = event.pointerId.toString();
    if (mapBrowserEvent.type == _ol_MapBrowserEventType_.POINTERUP) {
      delete this.trackedPointers_[id];
    } else if (mapBrowserEvent.type ==
        _ol_MapBrowserEventType_.POINTERDOWN) {
      this.trackedPointers_[id] = event;
    } else if (id in this.trackedPointers_) {
      // update only when there was a pointerdown event for this pointer
      this.trackedPointers_[id] = event;
    }
    this.targetPointers = _ol_obj_.getValues(this.trackedPointers_);
  }
};


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @this {ol.interaction.Pointer}
 */
_ol_interaction_Pointer_.handleDragEvent = nullFunction;


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @return {boolean} Capture dragging.
 * @this {ol.interaction.Pointer}
 */
_ol_interaction_Pointer_.handleUpEvent = _ol_functions_.FALSE;


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @return {boolean} Capture dragging.
 * @this {ol.interaction.Pointer}
 */
_ol_interaction_Pointer_.handleDownEvent = _ol_functions_.FALSE;


/**
 * @param {ol.MapBrowserPointerEvent} mapBrowserEvent Event.
 * @this {ol.interaction.Pointer}
 */
_ol_interaction_Pointer_.handleMoveEvent = nullFunction;


/**
 * Handles the {@link ol.MapBrowserEvent map browser event} and may call into
 * other functions, if event sequences like e.g. 'drag' or 'down-up' etc. are
 * detected.
 * @param {ol.MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {ol.interaction.Pointer}
 * @api
 */
_ol_interaction_Pointer_.handleEvent = function(mapBrowserEvent) {
  if (!(mapBrowserEvent instanceof _ol_MapBrowserPointerEvent_)) {
    return true;
  }

  var stopEvent = false;
  this.updateTrackedPointers_(mapBrowserEvent);
  if (this.handlingDownUpSequence) {
    if (mapBrowserEvent.type == _ol_MapBrowserEventType_.POINTERDRAG) {
      this.handleDragEvent_(mapBrowserEvent);
    } else if (mapBrowserEvent.type == _ol_MapBrowserEventType_.POINTERUP) {
      var handledUp = this.handleUpEvent_(mapBrowserEvent);
      this.handlingDownUpSequence = handledUp && this.targetPointers.length > 0;
    }
  } else {
    if (mapBrowserEvent.type == _ol_MapBrowserEventType_.POINTERDOWN) {
      var handled = this.handleDownEvent_(mapBrowserEvent);
      this.handlingDownUpSequence = handled;
      stopEvent = this.shouldStopEvent(handled);
    } else if (mapBrowserEvent.type == _ol_MapBrowserEventType_.POINTERMOVE) {
      this.handleMoveEvent_(mapBrowserEvent);
    }
  }
  return !stopEvent;
};


/**
 * This method is used to determine if "down" events should be propagated to
 * other interactions or should be stopped.
 *
 * The method receives the return code of the "handleDownEvent" function.
 *
 * By default this function is the "identity" function. It's overidden in
 * child classes.
 *
 * @param {boolean} handled Was the event handled by the interaction?
 * @return {boolean} Should the event be stopped?
 * @protected
 */
_ol_interaction_Pointer_.prototype.shouldStopEvent = function(handled) {
  return handled;
};
export default _ol_interaction_Pointer_;
