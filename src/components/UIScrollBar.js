import UIComponentPrototype from "./UIComponentPrototype";
import UIButton from "./UIButton";
import UIButtonDraggable from "./UIButtonDraggable";

const _EVENT_CHANGE = "event_change";

/**
 * @class UIScrollBar
 * @memberOf PhaserComps.UIComponents
 * @classdesc
 * Scroll bar component. can be vertical or horizontal <br>
 * It have up and down buttons inside, draggable thumb button. <br>
 * `DIMENSIONS` zone defines thumb drag bounds.
 *
 * default value range is 0 to 1, You can change it by setting
 * min and max value. Also you can set value step, so value will always
 * be stepped by it
 *
 * @emits PhaserComps.UIComponents.UIScrollBar.EVENT_CHANGE
 * @property {Number} value current bar value, from min value to max, default is from 0 to 1
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 * @param {Boolean} [vertical=false] scroll bar behave like vertical or horizontal
 */

export default class UIScrollBar extends UIComponentPrototype {

	/**
	 * @event PhaserComps.UIComponents.UIScrollBar.EVENT_CHANGE
	 * @memberOf PhaserComps.UIComponents.UIScrollBar
	 * @description
	 * Emitted on scroll bar value change.
	 * @param {Number} value current scrollbar value
	 */
	static get EVENT_CHANGE() { return _EVENT_CHANGE; }

	constructor(parent, key, vertical) {
		super(parent, key);
		this._vertical = vertical || false;

		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._value = 0;
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._minValue = 0;
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._maxValue = 1;
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._valueStep = 0;
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._buttonStep = 0.1;

		/**
		 * scroll up/left button
		 * @type {PhaserComps.UIComponents.UIButton}
		 */
		this.btnPrev = new UIButton(this, "btn_up");
		this.btnPrev.on(UIButton.EVENT_CLICK, this.onPrevClick, this);
		/**
		 * scroll down/right button
		 * @type {PhaserComps.UIComponents.UIButton}
		 */
		this.btnNext = new UIButton(this, "btn_down");
		this.btnNext.on(UIButton.EVENT_CLICK, this.onNextClick, this);

		/**
		 *
		 * @type {PhaserComps.UIComponents.UIButtonDraggable}
		 */
		this.thumb = new UIButtonDraggable(this, "thumb");
		this.thumb.on(UIButtonDraggable.EVENT_DRAG, this._onThumbDrag, this);

		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._trackStart = 0;
		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._trackLength = 100;

		/**
		 *
		 * @type {PhaserComps.ComponentClip}
		 * @private
		 */
		this._thumbClip = null;
	}

	/**
	 * Setup scroll bar value bounds and value step
	 * @method PhaserComps.UIComponents.UIScrollBar#setValueBounds
	 * @param {Number} minValue minimum value
	 * @param {Number} maxValue maximum value
	 * @param {Number} [valueStep=0] value change step
	 */
	setValueBounds(minValue, maxValue, valueStep) {
		this._minValue = minValue;
		this._maxValue = maxValue;
		if (typeof valueStep !== "undefined") {
			this._valueStep = valueStep;
			if (this._buttonStep < valueStep) {
				this._buttonStep = valueStep;
			}
		} else {
			this._valueStep = 0;
		}

	}

	/**
	 * @method PhaserComps.UIComponents.UIScrollBar#setButtonStep
	 * @param {Number} val
	 */
	setButtonStep(val) {
		this._buttonStep = val;
	}

	/**
	 * @method PhaserComps.UIComponents.UIScrollBar#onClipAppend
	 * @inheritDoc
	 */
	onClipAppend(clip) {
		super.onClipAppend(clip);
		this._updateClips();
	}

	/**
	 * @method PhaserComps.UIComponents.UIScrollBar#_updateClips
	 * @private
	 */
	_updateClips() {
		if (!this._clip) {
			return;
		}
		this._thumbClip = this.thumb._clip;
		let trackClip = this._clip.getChildClip("DIMENSIONS");
		if (trackClip) {
			this._trackStart = this._vertical ? trackClip.y : trackClip.x;
			this._trackLength = this._vertical ? trackClip.height : trackClip.width;

			if (this._thumbClip) {
				this.thumb.setDragBounds(
					this._vertical ? this._thumbClip.x : trackClip.x,
					this._vertical ? trackClip.y : this._thumbClip.y,
					this._vertical ? this._thumbClip.x : trackClip.x + trackClip.width,
					this._vertical ? trackClip.y + trackClip.height : this._thumbClip.y
				);
			}
		}
		let hitZone = this._clip.getChildClip("HIT_ZONE");
		if (hitZone) {
			hitZone.on("pointerdown", this._onZoneDown, this);
			//hitZone.on("pointerup", this.onZoneUp, this);
		}
		this._updateThumbFromValue();
	}

	/**
	 * @method PhaserComps.UIComponents.UIScrollBar#onClipProcess
	 * @inheritDoc
	 */
	onClipProcess() {
		super.onClipProcess();
		if (!this.thumb) {// call from super constructor
			return;
		}
		this._updateClips();

	}

	/**
	 * @method PhaserComps.UIComponents.UIScrollBar#onPrevClick
	 * @protected
	 */
	onPrevClick() {
		this.value -= this._buttonStep;
	}

	/**
	 * @method PhaserComps.UIComponents.UIScrollBar#onNextClick
	 * @protected
	 */
	onNextClick() {
		this.value += this._buttonStep;
	}

	/**
	 * @method PhaserComps.UIComponents.UIScrollBar#_updateThumbFromValue
	 * @private
	 */
	_updateThumbFromValue() {
		if (!this._thumbClip) {
			return;
		}
		let barPosition = Math.round(this._trackStart + this._trackLength * this._value);
		if (this._vertical) {
			this._thumbClip.y = barPosition;
		} else {
			this._thumbClip.x = barPosition;
		}
		this.emit(_EVENT_CHANGE, this.value);
	}

	get value() {
		let v = this._value * (this._maxValue - this._minValue);
		if (this._valueStep === 0) {
			return v + this._minValue;
		}
		v = Math.round(v / this._valueStep) * this._valueStep;
		return v + this._minValue;
	}

	set value(val) {
		let v = (val - this._minValue) / (this._maxValue - this._minValue);
		if (v < 0) v = 0;
		if (v > 1) v = 1;
		if (v === this._value) {
			return;
		}
		this._value = v;
		this._updateThumbFromValue();
	}

	/**
	 * Thumb button drag move handler
	 * @param {Number} positionX
	 * @param {Number} positionY
	 * @private
	 */
	_onThumbDrag(positionX, positionY) {
		if (this._trackLength === 0) {
			return;
		}
		let barPosition = this._vertical ? positionY : positionX;
		let newValue = (barPosition - this._trackStart) / this._trackLength;
		let v = newValue * (this._maxValue - this._minValue);
		if (this._valueStep !== 0) {
			v = Math.round(v / this._valueStep) * this._valueStep;
		}
		// minValue added only after step normalization
		this.value = v + this._minValue;
	}

	/**
	 * Zone around scrollbar thumb click handler
	 * @method PhaserComps.UIComponents.UIScrollBar#_onZoneDown
	 */
	_onZoneDown() {
		// TODO
	}
}