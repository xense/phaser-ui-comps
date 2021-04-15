import UIComponentPrototype from "./UIComponentPrototype";

const EVENT_ITEM_CHANGE = "event_change";

/**
 * @class UIList
 * @memberOf PhaserComps.UIComponents
 * @classdesc
 *
 * List component. Item clip instances are supposed to exist as it's children, with keys `item_0`, `item_1` and so on.
 *
 * When data array applied, every array item is applied to its' view instance
 *
 * Useful for short lists, and for lists with custom items layout.
 *
 * @emits PhaserComps.UIComponents.UIList.EVENT_ITEM_CHANGE
 * @property {Array<*>} data any data array to apply to list items
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 * @param {Class} rendererClass class for items, best if extending `UIListBaseItem`
 */


export default class UIList extends UIComponentPrototype {

	/**
	 * @event PhaserComps.UIComponents.UIList.EVENT_ITEM_CHANGE
	 * @memberOf PhaserComps.UIComponents.UIList
	 * @description
	 * Emitted when any item emits such even.
	 * @param {PhaserComps.UIComponents.UIListBaseItem} item item instance, that emitted change event
	 */
	static get EVENT_ITEM_CHANGE() { return EVENT_ITEM_CHANGE; }

	constructor(parent, key, rendererClass) {
		super(parent, key);
		this._rendererClass = rendererClass;
		this._items = [];
	}

	/**@return {*[]}*/
	get data() {
		return this._data;
	}

	/** @param {*[]} value */
	set data(value) {
		this._data = value;
		this._updateData();
	}

	/**
	 * @method PhaserComps.UIComponents.UIList#clean
	 * @desc Destroy all items renderer instances
	 */
	clean() {
		while(this._items.length !== 0) {
			let item = this._items.pop();
			item.destroy(true);
		}
	}

	_updateData() {
		const len = this._data.length;
		for (let index = 0; index < len; index++) {
			let dataItem = this._data[index];
			let item = this._getRenderer(index);
			item.data = dataItem;
		}
		this.doState();
	}

	_getRenderer(index) {
		if (this._items.length - 1 < index) {
			let renderer = new this._rendererClass(this, "item_" + index);
			this._items[index] = renderer;
			renderer.on(UIList.EVENT_ITEM_CHANGE, this.onItemChange, this);
 		}
		return this._items[index];
	}

	/**
	 * @method PhaserComps.UIComponents.UIList#getStateId
	 * @inheritDoc
	 * @returns {String}
	 */
	getStateId() {
		return "count_" + (this._data ? this._data.length : "0");
	}

	/**
	 * @method PhaserComps.UIComponents.UIList#destroy
	 * @protected
	 * @inheritDoc
	 */
	destroy(fromScene) {
		this.clean();
		super.destroy(fromScene);
	}

	onItemChange(item) {
		this.emit(UIList.EVENT_ITEM_CHANGE, item);
	}
}