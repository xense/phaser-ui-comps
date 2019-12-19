let isLock = false;
const enabledIds = [];
const registeredComps = {};

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
	 * @param {String | Array<String>} id component's lock id, or Array of lock ids to be only enabled
	 * @param {boolean} [rewrite=true] rewrite current list if true, otherwise add to list
	 */
	static lock(id, rewrite = true) {
		if (rewrite) {
			this.unlock();
		}
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

	/** @param {UIComponentPrototype} proto */
	static register(proto) {
		registeredComps[proto.lockId] = proto;
	}

	/** @param {UIComponentPrototype} proto */
	static unregister(proto) {
		if (registeredComps[proto.lockId]) {
			registeredComps[proto.lockId] = null;
			delete registeredComps[proto.lockId];
		}
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

	/**
	 * @param {string} id
	 * @return {PhaserComps.UIComponents.UIComponentPrototype}
	 */
	static getById(id) {
		return registeredComps[id];
	}

	/**
	 * @param {string} id
	 * @returns {Phaser.Geom.Rectangle}
	 */
	static getBoundsById(id) {
		const proto = this.getById(id);
		return proto ? proto.lockClipBounds : null;
	}

	/**
	 * @param {string} id
	 * @returns {Phaser.GameObjects.GameObject|*}
	 */
	static getClipById(id) {
		const proto = this.getById(id);
		return proto ? proto.lockClip : null;
	}

}