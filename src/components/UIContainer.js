import UIComponentPrototype from "./UIComponentPrototype";
import 'phaser';
import _ from 'underscore';

/**
 * @memberOf PhaserComps.UIComponents
 * @class UIContainer
 * @classdesc
 * Base container component. Allows to add dynamically created UIComponents inside other components.
 *
 * Child components clips must be root components only, not any clip's children.
 *
 * Note, that UIContainer can be only a child component of another UIComponentPrototype instance.
 *
 * @extends PhaserComps.UIComponents.UIComponentPrototype
 * @param {PhaserComps.UIComponents.UIComponentPrototype} parent UIComponentPrototype instance to find clip inside
 * @param {String} key key to find clip inside parent
 */

export default class UIContainer extends UIComponentPrototype {

	constructor(parent, key) {
		super(parent, key);

		/**
		 * List of children UIComponentPrototypes added
		 * @type {Array<PhaserComps.UIComponents.UIComponentPrototype>}
		 * @private
		 */
		this._children = [];
	}

	/**
	 * @method PhaserComps.UIComponents.UIContainer#addChild
	 * @description
	 * Adds child to children list, and adds it to Phaser container instance, if one exists
	 *
	 * @param {PhaserComps.UIComponents.UIComponentPrototype} child child component to add
	 * @return {PhaserComps.UIComponents.UIComponentPrototype} child
	 */
	addChild(child) {
		if (this._children.indexOf(child) !== -1) {
			return child; // TODO move to top?
		}
		this._children.push(child);

		// add to container instance, or hide
		if (this._clip) {
			child._clip.visible = true;
			this._addUIComponentToContainerClip(child);
		} else {
			child._clip.visible = false;
		}
		return child;
	}

	/**
	 * @method PhaserComps.UIComponents.UIContainer#removeChild
	 * @description
	 * Removes child from children list, and removes it from Phaser container instance, if one exists
	 *
	 * @param {PhaserComps.UIComponents.UIComponentPrototype} child child component to remove
	 * @return {PhaserComps.UIComponents.UIComponentPrototype} returns child param
	 */
	removeChild(child) {
		let index = this._children.indexOf(child);
		if (index === -1) {
			return child;
		}
		this._children.splice(index, 1);

		if (this._clip) {
			this._removeUIComponentFromContainerClip(child);
		}
		return child;
	}

	/**
	 *
	 * @param {PhaserComps.UIComponents.UIComponentPrototype} child
	 * @private
	 */
	_addUIComponentToContainerClip(child) {
		this._clip.add(child._clip);
		child._clip.visible = true;
	}

	/**
	 *
	 * @param {PhaserComps.UIComponents.UIComponentPrototype} child
	 * @param {Boolean} [destroyChild=false]
	 * @private
	 */
	_removeUIComponentFromContainerClip(child, destroyChild) {
		this._clip.remove(child._clip, destroyChild);
		child._clip.visible = false;
	}

	onClipAppend(clip) {
		super.onClipAppend(clip);
		if (clip) {
			_.each(this._children, child => {
				this._addUIComponentToContainerClip(child);
			}, this);
		}
	}

	onClipRemove(clip) {
		super.onClipRemove(clip);
		// hide and remove children from current container
		if (clip) {
			_.each(this._children, child => {
				this._removeUIComponentFromContainerClip(child);
			}, this);
		}
	}

	destroy() {
		// remove and destroy children
		_.each(this._children, child => {
			if (this._clip) { // TODO check if needed
				this._removeUIComponentFromContainerClip(child);
			}
			child.destroy();
		}, this);
		this._children.length = 0;
		super.destroy();
	}
}