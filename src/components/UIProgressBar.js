import UIComponentPrototype from "./UIComponentPrototype";
import * as _ from "underscore";

const PROGRESS_STATE_REGEX = /progress_(\d+)$/;

/**
 * @typedef StepConfig
 * @memberOf PhaserComps.UIComponents.UIScrollBar
 * @extends Object
 *
 * @property {Number} stepValue max value of this step
 * @property {PhaserComps.ComponentClip.StateConfig} config
 */

/**
 * @memberOf PhaserComps.UIComponents
 * @class UIProgressBar
 * @classdesc
 * Progress bar.
 *
 * Setup states `progress_0` and `progress_100` in Animate,
 * and all differences between them will be interpolated to the current progress value.
 * Also you can create intermediate states, if you want to control intermediate interpolation behaviour.

 * For example, if you want an indicator to rotate a full circle, you need to create intermediate states
 * `progress_30` and `progress_70`, to be sure, that indicator will rotate in the needed direction.
 *
 * Also you can use intermediate states to make interpolation not linear for all progress range.
 *
 * @property {Number} value current progress value, between 0 and 1
 *
 * @extends PhaserComps.UIComponents.UIComponentPrototype
 * @param {PhaserComps.UIComponents.UIComponentPrototype} [parent] UIComponentPrototype instance to find clip inside
 * @param {String} [key] key to find clip inside parent
 */
export default class UIProgressBar extends UIComponentPrototype {
	constructor(parent, key) {
		super(parent, key);

		/**
		 * current progress value
		 * @type {Number}
		 * @private
		 */
		this._value = 0;
		/**
		 *
		 * @type {Array<StepConfig>}
		 * @private
		 */
		this._steps = [];
	}

	get value() {
		return this._value;
	}

	set value(v) {
		this._value = v;
		this._applyValue();
	}


	onClipAppend(clip) {
		super.onClipAppend(clip);
		this._makeSteps(clip);
		this._applyValue();
	}

	/**
	 * Apply current value to setup elements positions
	 * @method PhaserComps.UIComponents.UIScrollBar#_applyValue
	 * @private
	 */
	_applyValue() {
		if (!this._clip) {
			return;
		}
		let i, lowConfig, highConfig, interpolation, resultConfig, childId;
		let stepsCount = this._steps.length;
		for (i = 0; i < stepsCount - 1; i++) {
			let low = this._steps[i];
			let high = this._steps[i + 1];
			if (low.stepValue === this._value) {
				resultConfig = low.config;
				break;
			} else if (high.stepValue === this._value) {
				resultConfig = high.config;
				break;
			} else if (this._value > low.stepValue && this._value < high.stepValue) {
				lowConfig = low.config;
				highConfig = high.config;
				interpolation = (this._value - low.stepValue) / (high.stepValue - low.stepValue);
				break;
			}
		}
		// make interpolated children configs
		if (!resultConfig) {
			resultConfig = {};
			for (childId in lowConfig) {
				if (!highConfig.hasOwnProperty(childId)) {
					continue;
				}
				let lowChildConfig = lowConfig[childId];
				let highChildConfig = highConfig[childId];
				resultConfig[childId] = {
					x: lowChildConfig.x + (highChildConfig.x - lowChildConfig.x) * interpolation,
					y: lowChildConfig.y + (highChildConfig.y - lowChildConfig.y) * interpolation,
					scaleX: lowChildConfig.scaleX + (highChildConfig.scaleX - lowChildConfig.scaleX) * interpolation,
					scaleY: lowChildConfig.scaleY + (highChildConfig.scaleY - lowChildConfig.scaleY) * interpolation,
					angle: lowChildConfig.angle + (highChildConfig.angle - lowChildConfig.angle) * interpolation,
					alpha: lowChildConfig.alpha + (highChildConfig.alpha - lowChildConfig.alpha) * interpolation
				}
			}
		}
		// apply children configs
		for (childId in resultConfig) {
			this._clip.applyChildParams(childId, resultConfig[childId]);
		}
	}

	/**
	 * Retreive all progress states and setup all progress steps, that will be used to control
	 * @param {PhaserComps.ComponentClip} clip
	 * @private
	 */
	_makeSteps(clip) {
		let stateIds = clip.getStateIds();
		this._steps = [];
		_.each(stateIds, (stateId) => {
			if (!PROGRESS_STATE_REGEX.test(stateId)) {
				return;
			}

			let stepConfig = {};
			let stepObject = {
				stepValue: parseInt(PROGRESS_STATE_REGEX.exec(stateId)[1]) / 100,
				config: stepConfig
			};
			let stateConfig = clip.getStateConfig(stateId);
			for (let childId in stateConfig) {
				stepConfig[childId] = UIProgressBar._makeFullConfig(stateConfig[childId]);
			}
			this._steps.push(stepObject);
		}, this);
		_.sortBy(this._steps, "stepValue");
	}

	/**
	 * Obviously create all state properties, even if they have default values
	 *
	 * @param config
	 * @returns {{
	 * 	scaleX: number,
	 * 	scaleY: number,
	 * 	alpha: number,
	 * 	x: number,
	 * 	y: number,
	 * 	angle: number
	 * }}
	 * @private
	 */
	static _makeFullConfig(config) {
		return {
			x: config.hasOwnProperty("x") ? config.x : 0,
			y: config.hasOwnProperty("y") ? config.y : 0,
			scaleX: config.hasOwnProperty("scaleX") ? config.scaleX : 1,
			scaleY: config.hasOwnProperty("scaleY") ? config.scaleY : 1,
			angle: config.hasOwnProperty("angle") ? config.angle : 0,
			alpha: config.hasOwnProperty("alpha") ? config.alpha : 1
		}
	}
}