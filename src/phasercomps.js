/**
 * @namespace PhaserComps
 */

import ComponentClip from "./clip/ComponentClip";
import UIComponents from "./components/UIComponents";
import Plugin from "./plugin/Plugin";

var PhaserComps = {
	ComponentClip: ComponentClip,
	UIComponents: UIComponents,
	Plugin: Plugin
};

module.exports = PhaserComps;

global.PhaserComps = PhaserComps;