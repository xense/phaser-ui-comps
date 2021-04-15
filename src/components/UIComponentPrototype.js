import Phaser from "phaser";
import PhaserComps from "../phasercomps";

const _EVENT_STATE = "event_state";

/**
 * @memberOf PhaserComps.UIComponents
 * @class UIComponentPrototype
 * @classdesc Base ComponentView controller class. Used to setup component state and texts.
 * Once root instance is created, you must append a [ComponentClip]{@link PhaserComps.ComponentClip}
 * instance to it.
 *
 * Child clips will be appended automatically on every state change, their clips will be found by keys.
 * On state change notifies all child components to update their states.
 *
 * *One of the main ideas of this framework is if there is no clip for UIComponentPrototype
 * at current state or at all, nothing bad happens.*
 * @inheritDoc
 * @extends Phaser.Events.EventEmitter
 * @property {String} lockId Used by UIManager, see {@link PhaserComps.UIManager}
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 */
export default class UIComponentPrototype extends Phaser.Events.EventEmitter {

	static get EVENT_STATE() { return _EVENT_STATE; }

	/**
	 * @param {PhaserComps.UIComponents.UIComponentPrototype} parent
	 * @param {String} key
	 */
	constructor(parent, key) {
		super();

		/**
		 * @type {String}
		 */
		this._lockId = null;

		/**
		 *
		 * @type {UIComponentPrototype}
		 * @private
		 */
		this._parent = parent;

		/**
		 *
		 * @type {String}
		 * @protected
		 */
		this._key = key;

		/**
		 *
		 * @type {PhaserComps.ComponentClip}
		 * @protected
		 */
		this._clip = null;

		/**
		 *
		 * @type {Object<String>}
		 * @private
		 */
		this._texts = {};

		if (key && parent) {
			// sign on parents state update
			parent.on(_EVENT_STATE, this._onEventState, this);
		}
		this._clipUpdate();
	}

	/**
	 * @public
	 * @method PhaserComps.UIComponents.UIComponentPrototype#appendClip
	 * @description
	 * Append a instance to this to control it. State setup will be processed immediately.<br>
	 * Use only for root instance, child instances will be appended automatically depending on state of this.
	 * @param {PhaserComps.ComponentClip} clip ComponentView instance to append
	 */
	appendClip(clip) {
		if (this._clip === clip) {
			return;
		}
		if (this._clip !== null) {
			this.removeClip();
		}
		this._clip = clip;
		if (this._clip) {
			this.onClipAppend(this._clip);
		}
		this._clipProcess();
	}

	/** @return {String} */
	get lockId() {
		return this._lockId;
	}

	/**
	 * @return {Phaser.Geom.Rectangle}
	 */
	get lockClipBounds() { return null; } // override

	/** @return {Phaser.GameObjects.GameObject|*} */
	get lockClip() { return null; } // override

	/** @param {string} value */
	set lockId(value) {
		if (this._lockId === value) {
			return;
		}
		if (this._lockId) {
			PhaserComps.UIManager.unregister(this);
		}
		this._lockId = value;
		if (this._lockId) {
			PhaserComps.UIManager.register(this);
		}
	}

	/**
	 * Override this, if you want to do something, when new clip removed,
	 * @method PhaserComps.UIComponents.UIComponentPrototype#onClipAppend
	 * @protected
	 * @param {PhaserComps.ComponentClip} clip
	 */
	onClipAppend(clip) {
		// override me
	}

	/**
	 * @public
	 * @method PhaserComps.UIComponents.UIComponentPrototype#removeClip
	 * @protected
	 */
	removeClip() {
		this.onClipRemove(this._clip);
		this._clip = null;
	}

	/**
	 * Override this, if you want to do something, when new clip removed,
	 * like remove clip events listeners.
	 * @method PhaserComps.UIComponents.UIComponentPrototype#onClipRemove
	 * @protected
	 * @param clip
	 */
	onClipRemove(clip) {
		// override me
	}

	/**
	 * Call doState to setup new state, id is provided by [getStateId]{@link PhaserComps.UIComponents.UIComponentPrototype#getStateId}
	 * @method PhaserComps.UIComponents.UIComponentPrototype#doState
	 * @protected
	 * @see #getStateId
	 */
	doState() {
		let stateId = this.getStateId();
		this._setupState(stateId);
	}

	/**
	 * Returns saved text by key, if it was set previously
	 * @method PhaserComps.UIComponents.UIComponentPrototype#getText
	 * @param {String} key
	 * @returns {String|Array<String>} text value
	 */
	getText(key) {
		return this._texts[key];
	}

	/**
	 * Set text value to the textfield with provided key.
	 * Text value is saved in the component's instance dictionary and will be set to the textField on every state change
	 * @method PhaserComps.UIComponents.UIComponentPrototype#setText
	 * @param {String} key TextField key
	 * @param {String|Array<String>} text text string
	 */
	setText(key, text) {
		if (this._texts[key] === text) {
			return;
		}
		this._texts[key] = text;
		if (this._clip) {
			let textField = this._clip.getChildText(key);
			if (textField) {
				textField.text = text;
			}
		}
	}

	/**
	 * @method PhaserComps.UIComponents.UIComponentPrototype#getStateId
	 * @description
	 * Current state id, used by [doState]{@link PhaserComps.UIComponents.UIComponentPrototype#doState} method
	 * @returns {String}
	 * @protected
	 */
	getStateId() {
		return "default";
	}

	/**
	 * Destroy ComponentPrototype and clip, if exists
	 * @method PhaserComps.UIComponents.UIComponentPrototype#destroy
	 * @protected
	 * @param {Boolean} [fromScene=false]
	 */
	destroy(fromScene) {
		if (this._parent){
			this._parent.removeListener(_EVENT_STATE, this._onEventState);
		}
		if (this._clip) {
			this._clip.destroy(fromScene);
		}
		super.destroy();
	}

	/**
	 * @method PhaserComps.UIComponents.UIComponentPrototype#_clipUpdate
	 * @private
	 */
	_clipUpdate() {
		if (!this._key) {
			// parent is clip itself
		} else {
			if (this._parent._clip) {
				let clip = this._parent._clip.getChildClip(this._key);
				this.appendClip(clip);
			} else {
				this.appendClip(null);
			}
		}
	}

	/**
	 * @method PhaserComps.UIComponents.UIComponentPrototype#_clipProcess
	 * @private
	 */
	_clipProcess() {
		if (!this._clip) {
			return;
		}
		this.doState();
		this.onClipProcess();
	}

	/**
	 * Override this, if you want to do something, when state or clip changes.
	 * @method PhaserComps.UIComponents.UIComponentPrototype#onClipProcess
	 * @protected
	 * @override
	 */
	onClipProcess() {
		// override me
	}

	/**
	 * @method PhaserComps.UIComponents.UIComponentPrototype#_setupState
	 * @param {String} stateId state id to setup
	 * @private
	 */
	_setupState(stateId) {
		if (this._clip) {
			this._clip.setState(stateId);

			// update textfields
			for (let textKey in this._texts) {
				let textField = this._clip.getChildText(textKey);
				if (textField) {
					textField.text = this._texts[textKey];
				}
			}
		}

		this.emit(_EVENT_STATE);
	}

	/**
	 * Parent state change listener
	 * @method PhaserComps.UIComponents.UIComponentPrototype#_onEventState
	 * @private
	 */
	_onEventState() {
		this._clipUpdate();
	}
}