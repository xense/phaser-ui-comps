import UIButtonSelect from "./UIButtonSelect";

const _EVENT_SELECT = "event_select";

/**
 * @class UIButtonRadio
 * @memberOf PhaserComps.UIComponents
 * @extends PhaserComps.UIComponents.UIButtonSelect
 * @classdesc
 * Radio button.
 * Several radio buttons can be grouped by appending them to the first button in the group,
 * You can do it via passing first button to `appendTo` constructor argument of other instances,шаг
 * or use [appendToRadio]{@link PhaserComps.UIComponents.UIButtonRadio#appendToRadio} method.
 *
 * @property {Boolean} select set or get, if current instance selected
 * @property {*} value get or set current instance value
 * @property {*} valueSelected If read, returns value of currently selected radio instance in the group.
 * If assigned, selects radio which has provided value.
 *
 * @extends PhaserComps.UIComponents.UIButtonSelect
 * @emits PhaserComps.UIComponents.UIButton.EVENT_SELECT
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 * @param {String} [labelText] text to set for a 'label' key
 * @param {*} [value] Any value, applied to current radio button instance.
 * Use it to find out, what is the current selected value in the group,
 * or select radio by provided value
 * @param {UIButtonRadio} [appendTo] If specified, this instance will be appended
 * to provided radio group immediately
 */

export default class UIButtonRadio extends UIButtonSelect {

	/**
	 *
	 * @event PhaserComps.UIComponents.UIButtonRadio.EVENT_SELECT
	 * @memberOf PhaserComps.UIComponents.UIButtonRadio
	 * @description
	 * Fired when some radio button of the group is selected
	 */
	static get EVENT_SELECT() { return _EVENT_SELECT; }

	constructor(parent, key, labelText, value, appendTo) {
		super(parent, key, labelText);
		this._sibling = this;
		this._value = value;
		if (typeof appendTo !== "undefined")
			this.appendToRadio(appendTo);
	}

	/**
	 * @method PhaserComps.UIComponents.UIButtonRadio#appendToRadio
	 * @description
	 * Append this radio instance to provided radio sibling ring
	 * @param {UIButtonRadio} radio radio button to append to sibling ring
	 */
	appendToRadio(radio) {
		if (this._sibling !== this) {
			this.removeFromSibling();
		}
		this._sibling = radio._sibling;
		radio._sibling = this;
	}

	/**
	 * @method PhaserComps.UIComponents.UIButtonRadio#removeFromSibling
	 * @description
	 * Remove this radio button from sibling ring
	 */
	removeFromSibling() {
		// TODO
	}

	/**
	 * @method PhaserComps.UIComponents.UIButtonRadio#_onClick
	 * @inheritDoc
	 * @protected
	 */
	_onClick() {
		this.select = true;
	}

	get select() { return super.select; }
	set select(val) {
		if (this._select === val) {
			return;
		}
		super.select = val;
		if (val) {
			let radio = this._sibling;
			while (radio !== this) {
				radio.select = false;
				radio = radio._sibling;
			}
			this._broadcastSelect();
		}
	}

	/**
	 * @method PhaserComps.UIComponents.UIButtonRadio#_broadcastSelect
	 * @description
	 * Broadcast select event from all siblings
	 * @private
	 * @ignore
	 */
	_broadcastSelect() {
		this.emit(_EVENT_SELECT, this.value);
		let radio = this._sibling;
		while (radio !== this) {
			radio.emit(_EVENT_SELECT, this._value);
			radio = radio._sibling;
		}
	}

	get value() {
		return this._value;
	}

	set value(val) {
		this._value = val;
	}

	get valueSelected() {
		if (this.select) {
			return this.value;
		}
		let radio = this._sibling;
		while (radio !== this) {
			if (radio.select) {
				return radio.value;
			}
			radio = radio._sibling;
		}
		return null;
	}

	set valueSelected(val) {
		if (this.value === val) {
			this.select = true;
			return;
		}
		let radio = this._sibling;
		while (radio !== this) {
			if (radio.value === val) {
				radio.select = true;
				return;
			}
		}
	}
}