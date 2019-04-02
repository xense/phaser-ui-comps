import Phaser from "phaser";
import ComponentClip from "../clip/ComponentClip";

/**
 * @class Plugin
 * @memberOf PhaserComps
 * @classdesc
 * Phaser 3 plugin, adds `ui_component` method to scene GameObjectFactory and GameObjectCreator,
 * that creates a {@link PhaserComps.ComponentClip} instance
 *
 * *Note. Factory method (`scene.make.ui_component()`) also adds clip instance to scene*
 *
 * Implementation example:
 * ```javascript
 * import "phaser-ui-comps"
 *
 * var config = {
 *     type: Phaser.AUTO,
 *     parent: "example",
 *     width: 800,
 *     height: 600,
 *     scene: {
 *  	   create: create
 *     },
 *     plugins: {
 *  	   global: [
 *  		   PhaserComps.Plugin.DefaultCfg
 *  	   ]
 *     }
 * var game = new Phaser.Game(config);
 *
 * create() {
 *     let configObject = {}; // here must be real jsfl-generated config object
 *     let texture_name = "your_texture_name";
 *     this.add.ui_component(configObject, [texture_name]);
 * }
 * ```
 * @see PhaserComps.ComponentClip
 *
 */
export default class Plugin extends Phaser.Plugins.BasePlugin {
    constructor(mgr) {
        super(mgr);
        mgr.registerGameObject("ui_component", this.addComponent, this.addComponent);
    }

    addComponent(config, textures) {
        return new ComponentClip(this.scene, config, textures);
    }
}

const DefaultCfg = {
    key: "UIComponents",
    plugin: Plugin,
    start: true
};

/**
 * Default plugin config
 *
 * @const PhaserComps.Plugin.DefaultCfg
 * @memberOf PhaserComps.Plugin
 * @type PluginObjectItem
 */
Plugin.DefaultCfg = DefaultCfg;