let isLock = false;
const enabledIds = [];

/**
 * @namespace PhaserComps.UIManager
 * @memberOf PhaserComps
 * @classdesc Allows to lock all ui, except for provided lock ids.
 * For this, you must set `lockId` property to UIComponentPrototype instances you want to enable,
 * and then switch theirs availability by UIManager's
 * {@link lock} and {@link unlock} methods
 *
 * For example, locked UIButton will still interact to mouse events, but will not emit click event.
 *
 * This can be useful in game tutorials.
 */
export default class UIManager {

	/**
	 * @memberOf PhaserComps.UIManager
	 * @description Makes only components with provided ids list (or one id string) to emit UI events
	 *
	 * *Note, that method rewrites current enabled ids list every call.*
	 * @param {String | Array<String>} id component's lock id, or Array of lock ids to be only enabled
	 */
	static lock(id) {
		this.unlock();
		if (typeof id === "string") {
			enabledIds.push(id);
		} else {
			id.forEach(value => enabledIds.push(value));
		}
		isLock = true;
	}

	/**
	 * @memberOf PhaserComps.UIManager
	 * @description Releases all components
	 */
	static unlock() {
		enabledIds.length = 0;
		isLock = false;
	}

	/**
	 * @memberOf PhaserComps.UIManager
	 * @description called from component to check, if it's allowed to emit UI event.
	 * @param {String} id
	 */
	static check(id) {
		if (!isLock) {
			return true;
		}
		return enabledIds.indexOf(id) !== -1;
	}
}