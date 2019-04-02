import UIButton from "./UIButton";

/**
 * @class UIButtonSelect
 * @memberOf PhaserComps.UIComponents
 * @classdesc
 * Checkbox-like button component prototype.
 * Has states `up`, `over`, `down`, `disable`, `up_select`, `over_select`, `down_select`, `disable_select`,
 * Emits EVENT_CLICK on click.
 * When disabled, doesn't interact to mouse events and move to state `disable`
 * @extends PhaserComps.UIComponents.UIButton
 * @emits PhaserComps.UIComponents.UIButton.EVENT_CLICK
 *
 * @property {Boolean} enable activate/deactivate button interaction. if false, button state is set to `disable`
 * @property {String} label get/set button label text
 * @property {Boolean} select get/set switch
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 * @param {String} [labelText] text to set for a 'label' key
 */
export default class UIButtonSelect extends UIButton {

	constructor(parent, key, labelText){
		super(parent, key, labelText);

		/**
		 * button as selected or not
		 * @type {Boolean}
		 * @private
		 */
		this._select = false;
	}

	/**
	 * @method PhaserComps.UIComponents.UIButtonSelect#getStateId
	 * @inheritDoc
	 * @returns {String}
	 */
	getStateId() {
		return super.getStateId() + (this._select ? "_select" : "");
	}

	/**
	 * @method PhaserComps.UIComponents.UIButtonSelect#_onClick
	 * @inheritDoc
	 */
	_onClick() {
		this._select = !this._select;
		this.doState();
		super._onClick();
	}

	get select() { return this._select; }
	set select(value) {
		if (this._select === value) {
			return;
		}
		this._select = value;
		this.doState();
	}
}