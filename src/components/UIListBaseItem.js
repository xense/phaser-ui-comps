import UIComponentPrototype from "./UIComponentPrototype";
import UIList from "./UIList";


/**
 * @class UIListBaseItem
 * @memberOf PhaserComps.UIComponents
 * @classdesc
 *
 * Base class for UIList component renderer. Extend it to create custom list items renderers.
 *
 * @emits PhaserComps.UIComponents.UIList.EVENT_ITEM_CHANGE
 * @property {*} data any data from UIList data list
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 * @param {Class} rendererClass class for items, best if extending `UIListBaseItem`
 */

export default class UIListBaseItem extends UIComponentPrototype {
	constructor(parent, key) {
		super(parent, key);
		this._data = null;
	}

	/**
	 * @method PhaserComps.UIComponents.UIListBaseItem#notifyChange
	 * @desc Emits change event to containing UIList instance
	 */
	notifyChange() {
		this.emit(UIList.EVENT_ITEM_CHANGE, this);
	}

	/**
	 * @method PhaserComps.UIComponents.UIListBaseItem#_commitData
	 * @protected
	 * @desc apply data from setter, override it
	 */
	_commitData() {
		// override
	}

	get data() {
		return this._data;
	}

	set data(value) {
		this._data = value;
		this._commitData();
	}
}