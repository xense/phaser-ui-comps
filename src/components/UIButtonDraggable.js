import UIButton from "./UIButton";
import UIManager from "../manager/UIManager";

const _EVENT_DRAG = "event_drag";

/**
 * @typedef DragBounds
 * @memberOf PhaserComps.UIComponents.UIButtonDraggable
 * @property {Number} minX left drag bound
 * @property {Number} minY top drag bound
 * @property {Number} maxX right drag bound
 * @property {Number} maxY bottom drag bound
 */

/**
 * @class UIButtonDraggable
 * @memberOf PhaserComps.UIComponents
 * @classdesc
 * Same as {@link UIComponents.UIButton}, but also emits EVENT_DRAG with two arguments, horizontal and vertical movement delta
 *
 * @extends UIComponents.UIButton
 * @emits EVENT_CLICK,
 * @emits EVENT_DRAG,
 *
 * @property {Boolean} enable activate/deactivate button interaction. if false, button state is set to `disable`
 * @property {String} label get/set button label text
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 * @param {String} [labelText] text to set for a 'label' key
 */

export default class UIButtonDraggable extends UIButton {

	/**
	 * @event PhaserComps.UIComponents.UIButtonDraggable.EVENT_DRAG
	 * @memberOf PhaserComps.UIComponents.UIButtonDraggable
	 * @description
	 * Emitted on drag move.
	 * @param {Number} x horizontal drag movement (from drag start)
	 * @param {Number} y vertical drag movement (from drag start)
	 */
	static get EVENT_DRAG() { return _EVENT_DRAG; }

	constructor(parent, key, labelText) {
		super(parent, key, labelText);
		/**
		 *
		 * @type DragBounds
		 * @private
		 */
		this._dragBounds = {
			minX: 0,
			maxX: 0,
			minY: 0,
			maxY: 0
		};
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._startDragX = 0;
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._startDragY = 0;
		/**
		 *
		 * @type {Phaser.GameObjects.Zone}
		 * @private
		 */
		this._dragZone = null;
	}

	/**
	 * Set clip drag bounds
	 * @method PhaserComps.UIComponents.UIButtonDraggable#setDragBounds
	 * @param {Number} minX left drag bound
	 * @param {Number} minY top drag bound
	 * @param {Number} maxX right drag bound
	 * @param {Number} maxY bottom drag bound
	 */
	setDragBounds(minX, minY, maxX, maxY) {
		this._dragBounds.minX = minX;
		this._dragBounds.maxX = maxX;
		this._dragBounds.minY = minY;
		this._dragBounds.maxY = maxY;
	}

	/**
	 * _dragZone `dragstart` event callback
	 * @method PhaserComps.UIComponents.UIButtonDraggable#_onDragStart
	 * @param pointer
	 * @param {Phaser.GameObjects.GameObject} gameObject
	 * @protected
	 */
	_onDragStart(pointer, gameObject) {
		if (!this._dragZone || this._dragZone !== gameObject) {
			return;
		}
		if (!this._clip) {
			return;
		}
		this._startDragX = this._clip.x - gameObject.input.dragStartX;
		this._startDragY = this._clip.y - gameObject.input.dragStartY;
	}

	/**
	 * _dragZone `drag` event callback
	 * @method PhaserComps.UIComponents.UIButtonDraggable#_onDrag
	 * @param pointer
	 * @param {Phaser.GameObjects.GameObject} gameObject
	 * @param {Number} dragX
	 * @param {Number} dragY
	 * @protected
	 */
	_onDrag(pointer, gameObject, dragX, dragY) {
		if (!UIManager.check(this.lockId)){
			return;
		}
		if (!this._dragZone	|| this._dragZone !== gameObject || this.clip) {
			return;
		}
		let newX = this._startDragX + dragX;
		let newY = this._startDragY + dragY;
		if (newX < this._dragBounds.minX) {
			newX = this._dragBounds.minX;
		} else if (newX > this._dragBounds.maxX) {
			newX = this._dragBounds.maxX;
		}

		if (newY < this._dragBounds.minY) {
			newY = this._dragBounds.minY;
		} else if (newY > this._dragBounds.maxY) {
			newY = this._dragBounds.maxY;
		}
		this.emit(_EVENT_DRAG, newX, newY);
	}

	_setupInteractive(zone) {
		super._setupInteractive(zone);
		this._dragZone = zone;
		//zone.scene.input.dragDistanceThreshold = 3;
		zone.scene.input.setDraggable(zone, true);
		zone.scene.input.on("dragstart", this._onDragStart, this);
		zone.scene.input.on("drag", this._onDrag, this);
	}

	_removeInteractive(zone) {
		super._removeInteractive(zone);
		this._dragZone = null;
		zone.scene.input.setDraggable(zone, false);
		zone.scene.input.removeListener("dragstart", this._onDragStart);
		zone.scene.input.removeListener("drag", this._onDrag);
	}

}