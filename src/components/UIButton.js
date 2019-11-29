import UIComponentPrototype from "./UIComponentPrototype";
import UIManager from "../manager/UIManager";

const HIT_ZONE = "HIT_ZONE";
const LABEL = "label";

const _STATE_UP = "up";
const _STATE_DOWN = "down";
const _STATE_OVER = "over";
const _STATE_DISABLE = "disable";

const _EVENT_CLICK = "event_click";

/**
 * @class UIButton
 * @memberOf PhaserComps.UIComponents
 * @classdesc
 * Button component prototype, has states `up`, `over`, `down`, `disable`
 * Emits EVENT_CLICK on click.
 * When disabled, doesn't interact to mouse events and move to state `disable`
 * @extends PhaserComps.UIComponents.UIComponentPrototype
 * @emits PhaserComps.UIComponents.UIButton.EVENT_CLICK
 *
 * @property {Boolean} enable activate/deactivate button interaction. if false, button state is set to `disable`
 * @property {String} label get/set button label text
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 * @param {String} [labelText] text to set for a 'label' key
 */
export default class UIButton extends UIComponentPrototype {

	/**
	 * @event PhaserComps.UIComponents.UIButton.EVENT_CLICK
	 * @memberOf PhaserComps.UIComponents.UIButton
	 * @description
	 * Emitted on click
	 */
	static get EVENT_CLICK() { return _EVENT_CLICK; }

	constructor(parent, key, labelText) {
		super(parent, key);
		this._enable = true;
		this._isPressed = false;
		this._isOver = false;
		/**
		 * @type {Phaser.GameObjects.Zone}
		 * @private
		 */
		this._hitZone = null;
		if (labelText) {
			this.label = labelText;
		}
	}

	/**
	 * @method PhaserComps.UIComponents.UIButton#onClipAppend
	 * @inheritDoc
	 */
	onClipAppend(clip) {
		this._updateInteractive();
	}

	/**
	 * @method PhaserComps.UIComponents.UIButton#onClipRemove
	 * @inheritDoc
	 */
	onClipRemove(clip) {
		let zone = clip.getChildClip(HIT_ZONE);
		if (!zone) {
			//console.warn("no hit zone for", this._key);
			return;
		}
		this._removeInteractive(zone);
	}

	get label() { return this.getText(LABEL); }
	set label(value) {
		this.setText(LABEL, value);
	}

	get enable() { return this._enable; }
	set enable(value) {
		if (this._enable === value) {
			return;
		}
		this._enable = value;
		this._updateInteractive();
		this.doState();
	}

	/**
	 * @method UIButton#_setupInteractive
	 * @param {Phaser.GameObjects.Zone} zone
	 * @private
	 */
	_setupInteractive(zone) {
		zone.setInteractive({ useHandCursor: true });
		zone.on("pointerdown", this._onPointerDown, this);
		zone.on("pointerup", this._onPointerUp, this);
		zone.on("pointerover", this._onPointerOver, this);
		zone.on("pointerout", this._onPointerOut, this);
		this._hitZone = zone;
	}

	/**
	 * @method PhaserComps.UIComponents.UIButton#_removeInteractive
	 * @param {Phaser.GameObjects.Zone} zone
	 * @private
	 */
	_removeInteractive(zone) {
		zone.disableInteractive();
		zone.removeListener(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this._onPointerDown, this);
		zone.removeListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this._onPointerUp, this);
		zone.removeListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this._onPointerOver, this);
		zone.removeListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this._onPointerOut, this);
		this._hitZone = null;
	}

	get lockClipBounds() {
		return this._hitZone ? this._hitZone.getBounds() : null;
	}

	/**
	 * @method PhaserComps.UIComponents.UIButton#_updateInteractive
	 * @private
	 */
	_updateInteractive() {
		if (!this._clip) {
			return;
		}
		let zone = this._clip.getChildClip(HIT_ZONE);
		if (!zone) {
			//console.warn("no hit zone for", this._key);
			return;
		}
		if (this.enable) {
			this._setupInteractive(zone);
		} else {
			this._removeInteractive(zone);
		}
	}

	/**
	 * @method PhaserComps.UIComponents.UIButton#getStateId
	 * @inheritDoc
	 * @returns {String}
	 */
	getStateId() {
		if (!this.enable) {
			return this.STATE_DISABLE;
		}
		if (this._isPressed) {
			return this.STATE_DOWN;
		}
		if (this._isOver) {
			return this.STATE_OVER;
		}
		return this.STATE_UP;
	}

	/**
	 * @protected
	 * @method PhaserComps.UIComponents.UIButton#_onClick
	 * @description
	 * called when button hit zone clicked, emits EVENT_CLICK
	 */
	_onClick() {
		this.emit(_EVENT_CLICK);
	}

	get STATE_UP() { return _STATE_UP; }
	get STATE_DOWN() { return _STATE_DOWN; }
	get STATE_OVER() { return _STATE_OVER; }
	get STATE_DISABLE() { return _STATE_DISABLE; }

	/**
	 * @method UIButton#_onPointerOut
	 * @protected
	 */
	_onPointerOut() {
		this._isOver = false;
		this._isPressed = false;
		this.doState();
	}

	/**
	 * @method UIButton#_onPointerOver
	 * @protected
	 */
	_onPointerOver() {
		this._isOver = true;
		this.doState();
	}

	/**
	 * @method UIButton#_onPointerDown
	 * @protected
	 */
	_onPointerDown(pointer, localX, localY, event) {
		this._isPressed = true;
		this.doState();
		event.stopPropagation();
	}

	/**
	 * @method UIButton#_onPointerUp
	 * @protected
	 */
	_onPointerUp(pointer, localX, localY, event) {
		let isClicked = this._isPressed && this._isOver;
		this._isPressed = false;
		this.doState();
		if (isClicked) {
			event.stopPropagation();
			if (UIManager.check(this.lockId)) {
				this._onClick();
			}
		}
	}

	/**
	 * @method UIButton#destroy
	 * @protected
	 * @inheritDoc
	 */
	destroy(fromScene) {
		if (this._clip) {
			let zone = this._clip.getChildClip(HIT_ZONE);
			if (zone) {
				this._removeInteractive(zone);
			}
		}
		super.destroy(fromScene);
	}
}