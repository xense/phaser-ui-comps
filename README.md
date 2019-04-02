Phaser 3 UI Components, built by Adobe Animate
----
<h3>What is it?</h3>
Build your UI in [Abode Animate](https://www.adobe.com/ru/products/animate.html), 
export to JSON and bitmaps with provided 
[JSFL script](https://github.com/xense/phaser-ui-comps/blob/master/jsfl/ExportToPhaser.jsfl) 
, and you can forget about lots of positioning magic numbers in your code.

`ComponentClip` build itself with provided JSON and atlases, 
and `UIComponentPrototype` Will help to control them, switch states, 
listen to click, drag and other events.

In addition, `UIComponentPrototype` and it"s children classes don"t mind, 
if they have a real clip instance in current state or at all,
so nothing bad happens, for example, if you remove some button instance in your window in 
Animate document and keep it"s `UIComponentPrototype` instance.

All bitmaps are exported to png files with the same folder structure 
as in the Animate document library. Pack them to atlases using
[TexturePacker](https://www.codeandweb.com/texturepacker) or other tool you like.

<h3>Where and how to use?</h3>

[Main framework repo](https://github.com/xense/phaser-ui-comps)

[Docs, tutorials, examples](https://xense.github.io/phaser-ui-comps-docs)

[Live example](https://xense.github.io/phaser-ui-comps-docs/tutorial-showcase.html)

[Issues, bugs, new components ideas](https://github.com/xense/phaser-ui-comps/issues)

[Animate document example](https://github.com/xense/phaser-ui-comps-docs/tree/master/examples/xfl/)

<h4>Export Animate document</h4>
To run JSFL script in Animate select `Commands > Run Command`, 
navigate to the script, and click Open.

<h3>How to install?</h3>

To install the latest version from 
[npm](https://www.npmjs.com)
locally and save it in your `package.json` file:
```bash
npm install --save phaser-ui-comps 
```

Or you can download minified version from 
[https://github.com/xense/phaser-ui-comps/tree/master/dist](https://github.com/xense/phaser-ui-comps/tree/master/dist)

*Note!*
*PhaserComps uses [underscore.js](https://underscorejs.org/)
There are two builds in the /dist folder, 
[one](https://github.com/xense/phaser-ui-comps/blob/master/dist/phaser-ui-comps-with-underscore.min.js) 
with underscore included and 
[other](https://github.com/xense/phaser-ui-comps/blob/master/dist/phaser-ui-comps.min.js) 
without it, so you need to load it before loading PhaserComps* 

<h3>Simple usage</h3>

```html
<script src="path/to/scripts/phaser.js"></script>
<script src="path/to/scripts/phaser-ui-comps-with-underscore.min.js"></script>
```

```javascript
const COMPONENT_CONFIG = "comp-config";
const TEXTURE_CONFIG = "my_texture";


var game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create
    }
});


function preload() {
    this.load.json(COMPONENT_CONFIG, "assets/my_component.json");
    this.load.multiatlas(TEXTURE_CONFIG, "assets/atlases/my_atlas.json", "assets/atlases/");
}

function create() {
    let clip = new PhaserComps.ComponentClip(
        this, 
        this.cache.json.get(COMPONENT_CONFIG), 
        [ TEXTURE_CONFIG ]
    );
    
    let component = new PhaserComps.UIComponents.UIComponentPrototype();
    component.appendClip(clip);
}
```