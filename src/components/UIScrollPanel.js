import UIComponentPrototype from "./UIComponentPrototype";
import UIScrollBar from "./UIScrollBar";

/**
 * @typedef ScrollBoundsObject
 * @description
 * Object is generated automatically on container's clip update, by the `dimensions` clip
 * @memberOf PhaserComps.UIComponents.UIScrollPanel
 * @property {Number} x Start x position of the container. Used, if panel is horizontal
 * @property {Number} y Start x position of the container. Used, if panel is vertical
 * @property {Number} len Scroll distance of the container. On scroll down/right,
 * x or y position will be subtracted by `len` multiplied by scrollbar value
 */


/**
 * @class UIScrollPanel
 * @memberOf PhaserComps.UIComponents
 * @classdesc
 * Scrolling panel with scrollbar applied to it.
 * First parameter is container, where this should find the panel, scroll bar and dimensions instances
 * UIScrollBar instance created inside with a provided `scrollBarKey` <br><br>
 *
 * **Warning! This component doesn't extend UIComponent.ComponentPrototype**
 *
 * @param {PhaserComps.UIComponents.UIComponentPrototype} container
 * @param {String} panelKey
 * @param {String} scrollBarKey
 * @param {String} dimensionsKey
 * @param {Boolean} [vertical=false]
 */

export default class UIScrollPanel {

	constructor(container, panelKey, scrollBarKey, dimensionsKey, vertical) {
		/** @type PhaserComps.UIComponents.UIComponentPrototype */
		this._container = container;
		container.on(UIComponentPrototype.EVENT_STATE, this._onContainerUpdate, this);

		/** @type String */
		this._panelKey = panelKey;
		/** @type String */
		this._dimensionsKey = dimensionsKey;

		/** @type PhaserComps.UIComponents.UIScrollBar */
		this._scrollBar = new UIScrollBar(container, scrollBarKey, vertical);
		this._scrollBar.on(UIScrollBar.EVENT_CHANGE, this._onScrollBar, this);

		/** @type Boolean */
		this._vertical = vertical || false;
	}

	/**
	 * update clip instances on container update
	 * @method PhaserComps.UIComponents.UIScrollPanel#_onContainerUpdate
	 * @private
	 */
	_onContainerUpdate() {
		/** @type PhaserComps.ComponentClip */
		let clip = this._container._clip;
		if (!clip) {
			return;
		}
		/** @type PhaserComps.ComponentClip */
		this._panel = clip.getChildClip(this._panelKey);
		let dims = clip.getChildClip(this._dimensionsKey);
		if (!this._panel || !dims) {
			return;
		}
		/**
		 *
		 * @type ScrollBoundsObject
		 */
		this._scrollBounds = {
			x: dims.x,
			y: dims.y,
			len: this._vertical ? this._panel.height - dims.height : this._panel.width - dims.width
		};

		// update current panel position
		this._onScrollBar(this._onScrollBar.value);
	}

	/**
	 * Update panel position on scrollbar change
	 * @method PhaserComps.UIComponents.UIScrollPanel#_onScrollBar
	 * @private
	 */
	_onScrollBar(value) {
		if (!this._panel || !this._scrollBounds) {
			return;
		}
		if (this._vertical) {
			this._panel.y = this._scrollBounds.y - this._scrollBounds.len * value;
		} else {
			this._panel.x = this._scrollBounds.x - this._scrollBounds.len * value;
		}
	}
}