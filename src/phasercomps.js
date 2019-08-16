/**
 * @namespace PhaserComps
 */

import ComponentClip from "./clip/ComponentClip";
import UIComponents from "./components/UIComponents";
import Plugin from "./plugin/Plugin";
import UIManager from "./manager/UIManager";

var PhaserComps = {
	ComponentClip: ComponentClip,
	UIComponents: UIComponents,
	Plugin: Plugin,
	UIManager: UIManager
};

export default PhaserComps;

global.PhaserComps = PhaserComps;