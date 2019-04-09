(function (global) {
	var JSON = {};
	JSON.prettyPrint = false;
	JSON.stringify = function (obj) {
		return _internalStringify(obj, 0);
	};

	function _prepareString(str) {
		return str
			//.replace(/\b/g, '\\' + 'b')
			.replace(/\\/g, '\\' + '\\')
			.replace(/\t/g, '\\' + 't')
			.replace(/\n/g, '\\' + 'n')
			.replace(/\f/g, '\\' + 'f')
			.replace(/\r/g, '\\' + 'r')
			.replace(/"/g, '\\' + '"')
	}
	function _internalStringify(obj, depth, fromArray) {
		var t = typeof (obj);
		if (t !== "object" || obj === null) {
			// simple data type
			if (t === "string") return '"' + _prepareString(obj) + '"';
			return String(obj);
		} else {
			// recurse array or object
			var n, v, json = [], arr = (obj && obj.constructor === Array);
			var joinString, bracketString, firstPropString;
			if (JSON.prettyPrint) {
				joinString = ",\n";
				bracketString = "\n";
				for (var i = 0; i < depth; ++i) {
					joinString += "\t";
					bracketString += "\t";
				}
				joinString += "\t";//one extra for the properties of this object
				firstPropString = bracketString + "\t";
			} else {
				joinString = ",";
				firstPropString = bracketString = "";
			}
			for (n in obj) {
				v = obj[n];
				t = typeof (v);
				// Ignore functions
				if (t === "function") continue;
				if (t === "string") v = '"' + _prepareString(v) + '"';
				else if (t === "object" && v !== null) v = _internalStringify(v, depth + 1, arr);
				json.push((arr ? "" : '"' + n + '":') + String(v));
			}
			return (fromArray || depth === 0 ? "" : bracketString) + (arr ? "[" : "{") + firstPropString + json.join(joinString) + bracketString + (arr ? "]" : "}");
		}
	}

	JSON.parse = function (str) {
		if (str === "") str = '""';
		eval("var p=" + str + ";"); // jshint ignore:line
		return p;
	};

	global.JSON = JSON;

}(window));

// For debugging
function extractObject(obj, prefix) {
	if (prefix === undefined) prefix = '';
	prefix += '-';
	for (var key in obj) {
		try {
			// TODO recursive parse
			fl.trace(prefix + ' ' + key + ': ' + obj[key])
		} catch (e) {}
	}
}

function roundToFract2(value) {
	return parseFloat(parseFloat(value).toFixed(2));
}

function roundToFract4(value) {
	return parseFloat(parseFloat(value).toFixed(4));
}

function getLibItemByName(name) {
	for (var i in lib.items) {
		var item = lib.items[i];
		if (item.name === name)
			return item;
	}
}


var SKIP_LAYER_TYPES = [
	'guide',
	'folder'
];
var ZONE_ELEMENT_NAMES = [
	'HIT_ZONE',
	'DIMENSIONS'
];
var STATE_IDS_LAYER_NAME = 'STATE_IDS';


var dom = fl.getDocumentDOM();
var lib = dom.library;
var dirUrl = fl.browseForFolderURL("Select folder to save JSON and images");
fl.outputPanel.clear();

//fl.configDirectory
//var dirUrl = 'file:///C|/WORK/Citadels/phaser-test/assets/windows/json';
var images = {};
var nextChildId = 1;

PhaserExporter = function(libraryItem, rootObject) {
	this.libraryItem = libraryItem;
	if (rootObject) {
		this.rootObject = rootObject;
	} else {
		this.id = libraryItem.linkageClassName;
		this.rootObject = {
			id: this.id
		}
	}
	this.children = [];
	this.maskLayersByChildId = {};
	this.states = {};
	this.stateFramesById = {};
	this.stateIdsByFrameIndex = {};
	this.rootObject['children'] = this.children;
	this.rootObject['states'] = this.states;
	this.rootObject['type'] = 'component';
};

PhaserExporter.prototype.getStateObjectById = function(stateId) {
	if (this.states.hasOwnProperty(stateId))
		return this.states[stateId];
	var stateObject = {};
	this.states[stateId] = stateObject;
	return stateObject;
};

PhaserExporter.prototype.getStateObjectByFrameIndex = function(frameIndex) {
	var stateId = this.stateIdsByFrameIndex[frameIndex];
	return this.states[stateId];
};

PhaserExporter.prototype.parse = function() {
	this.generateStates();
	var item, timeline, hasStates, layer, layerIndex;
	item = this.libraryItem;
	timeline = item.timeline;
	for (layerIndex = timeline.layerCount - 1; layerIndex >= 0; layerIndex--) {
		layer = timeline.layers[layerIndex];
		/*if (layer.name === STATE_IDS_LAYER_NAME) {
			hasStates = true; // even if there is 1 state
			continue;
		}*/
		if (SKIP_LAYER_TYPES.indexOf(layer.layerType) !== -1)
			continue;
		if (layer.isEmpty)
			continue;
		this.parseLayer(layer);
	}
	this.cleanup();
};

PhaserExporter.prototype.cleanup = function() {
	if (this.children.length === 0) {
		delete this.rootObject.children;
	}
};


PhaserExporter.prototype.parseLayer = function(layer) {
	var frame, frameIndex, frameElement;
	var isDynamic = false;
	for (frameIndex in layer.frames) {
		frame = layer.frames[frameIndex];
		if (frame.duration < layer.frameCount) {
			isDynamic = true;
		}
		if (frame.elements.length === 1) {
			frameElement = frame.elements[0];
			break;
		} else if (frame.elements.length > 1) {
			fl.trace("WARN! more than 1 element at frame " + frameIndex + ' at layer ' + layer.name);
		}
	}
	if (!frameElement) {
		return; // WHY?
	}

	var child = this.createChildFromElement(frameElement);
	if (isDynamic) {
		for (frameIndex in layer.frames) {
			frame = layer.frames[frameIndex];
			if (frame.elements.length === 0) continue;
			var stateObject = this.getStateObjectByFrameIndex(frameIndex);
			var stateChildObject = {};
			stateObject[child.childId] = stateChildObject;

			var element = frame.elements[0];
			this.collectCommonElementParams(element, stateChildObject);
			this.collectExtendedElementParams(element, stateChildObject, true);
		}
	} else {
		this.collectCommonElementParams(frameElement, child);
	}

	if (layer.layerType === 'masked') {
		this.maskLayersByChildId[child.childId] = layer.parentLayer;
	} else if (layer.layerType === 'mask') {
		child.masking = [];
		for (var maskedChildId in this.maskLayersByChildId) {
			if (layer === this.maskLayersByChildId[maskedChildId]) {
				child.masking.push(maskedChildId);
			}
		}
	}

	this.children.push(child);
};

PhaserExporter.prototype.createChildFromElement = function(element) {
	var childObject = {
		childId: String(nextChildId++)
	};
	this.collectExtendedElementParams(element, childObject, false);
	return childObject;
};

/**
 *
 * @param {Element} element
 * @param {Object} target
 * @param {Boolean} forState
 */
PhaserExporter.prototype.collectExtendedElementParams = function(element, target, forState) {
	if (element.elementType === 'text') {
		this.collectTextElementParams(element, target, forState);
	} else if (element.elementType === 'shape') {
		this.collectShapeParams(element, target, forState);
	} else if (element.elementType === 'instance') {
		var libItem = element.libraryItem;
		if (libItem.itemType === 'bitmap') {
			this.collectBitmapParams(element, target, forState);
		} else if (libItem.itemType === 'movie clip') {
			if (!forState) {
				if (element.name) {
					target.key = element.name;
				}
				if (ZONE_ELEMENT_NAMES.indexOf(element.name) !== -1) {
					this.collectHitZoneParams(element, target, forState);
				} else {
					var childExporter = new PhaserExporter(libItem, target);
					childExporter.parse();
				}

			}
		}
	}
};

PhaserExporter.prototype.collectHitZoneParams = function(element, target, forState) {
	target.type = 'zone';
	target.width = roundToFract4(element.width);
	target.height = roundToFract4(element.height);
};

/**
 *
 * @param {Shape} element
 * @param {Object} target
 * @param {Boolean} forState
 */
PhaserExporter.prototype.collectShapeParams = function(element, target, forState) {
	var color;
	var isSolid = false;
	var alpha = 1;
	for (var contourIndex in element.contours) {
		var contour = element.contours[contourIndex];
		if (!contour.fill || contour.fill.style === 'noFill') {
			continue;
		}
		if (contour.fill.style === 'bitmap') {
			target.type = 'tileSprite';
			target.width = element.width;
			target.height = element.height;
			target.image = contour.fill.bitmapPath;
			// add to images to save list
			images[target.image] = getLibItemByName(target.image);
			return;
		} else if (contour.fill.style === 'solid') {
			color = parseInt(contour.fill.color.substr(1, 6), 16);
			isSolid = true;
			if (contour.fill.color.length > 7) {
				alpha = parseInt(contour.fill.color.substr(7, 2), 16);
			}
		}
	}
	if (!isSolid) {
		return;
	}
	if (alpha !== 1) {
		target.alpha = alpha;
	}
	target.color = color;
	target.type = 'polygon';


	var lines = [];
	for (var edgeIndex in element.edges) {
		var edge = element.edges[edgeIndex];
		var points = element.getCubicSegmentPoints(edge.cubicSegmentIndex);
		var startPoint = points[0];
		var finishPoint = points[3];
		var line = [startPoint.x, startPoint.y, finishPoint.x, finishPoint.y];
		lines.push(line);
	}

	// sort and swap line points
	for (var i = 0; i < lines.length - 1; i++) {
		line = lines[i];
		for (var j = i + 1; j < lines.length - 1; j++) {
			var nextLine = lines[j];
			var lineFound = false;
			if (nextLine[0] === line[2] && nextLine[1] === line[3]) {
				lineFound = true;
			} else if (nextLine[0] === line[0] && nextLine[1] === line[1]) {
				lineFound = true;
				nextLine.push(nextLine[0]);
				nextLine.push(nextLine[1]);
				nextLine.splice(0, 2);
			}
			if (lineFound && j !== i + 1) {
				// swap
				var tempLine = nextLine;
				lines[j] = lines[i + 1];
				lines[i + 1] = tempLine;
				break;
			}
		}
	}

	var lastLine;
	var vertices = [ // first vertex
		lines[0][0] - element.x,
		lines[0][1] - element.y
	];

	for (var lineIndex in lines) {
		line = lines[lineIndex]; // other vertices
		if (lastLine && lastLine[2] === line[2] && lastLine[3] === line[3]) {
			// sometimes equal vertices happen
			continue;
		}
		vertices.push(line[2] - element.x, line[3] - element.y);
		lastLine = line;
	}
	target.vertices = vertices;
};

PhaserExporter.prototype.collectCommonElementParams = function(element, target) {
	if (roundToFract4(element.x) !== 0) {
		target.x = target.x || 0;
		target.x += roundToFract4(element.x);
	}
	if (roundToFract4(element.y) !== 0) {
		target.y = target.y || 0;
		target.y = roundToFract4(element.y);
	}
	if (roundToFract4(element.scaleX) !== 1) target.scaleX = roundToFract4(element.scaleX);
	if (roundToFract4(element.scaleY) !== 1) target.scaleY = roundToFract4(element.scaleY);

	// hacks for flip (animate uses skew instead of flip sometimes)
	if (roundToFract2(element.skewY) !== 0 && roundToFract2(element.skewX) === roundToFract2(-element.skewY)) {
		if (element.skewX < 0) {
			target.angle = element.skewY;
			target.scaleY = target.scaleY || 1;
			target.scaleY *= -1;
		} else {
			target.angle = element.skewX;
			target.scaleX = target.scaleX || 1;
			target.scaleX *= -1;
		}

	}
	if (element.rotation !== element.skewX && (element.skewX === 180 || element.skewX === -180)) {
		target.scaleY = target.scaleY || 1;
		target.scaleY *= -1;
	}
	if (element.rotation !== element.skewX && (element.skewY === 180 || element.skewY === -180)) {
		target.scaleX = target.scaleX || 1;
		target.scaleX *= -1;
	}

	if (element.colorAlphaPercent !== undefined && element.colorAlphaPercent !== 100)
		target.alpha = element.colorAlphaPercent / 100;
	if (element.rotation) target.angle = element.rotation;
};

PhaserExporter.prototype.collectBitmapParams = function(element, target, forState) {
	var libItem = element.libraryItem;
	var imageName = libItem.name;
	// for saving image to file later
	images[imageName] = libItem;

	if (!forState) {
		target.type = 'image';
		target['image'] = imageName;
	}
};

PhaserExporter.prototype.collectTextElementParams = function(element, target, forState) {
	var attrs = element.textRuns[0].textAttrs;
	var style = {};
	if (attrs.alignment === 'center') {
		style.align = 'center';
		target.x = target.x || 0;
		target.x += element.width / 2;
	} else if (attrs.alignment === 'right') {
		style.align = 'right';
		target.y = target.y || 0;
		target.x += element.width;
	} // TODO what about justify?

	if (forState)
		return;

	target.type = element.textType === 'input' ? 'input_text' : 'text';
	//target.width = element.width;
	//target.height = element.height;
	if (element.name)
		target.key = element.name;
	var text = element.getTextString();
	if (text)
		target.text = text;


	target.textStyle = style;
	if (element.lineType === 'single line')
		style.maxLines = 1;

	//style.fixedWidth = element.width;
	//style.fixedHeight = element.height;
	style.wordWrap = { width: element.width };
	style.color = attrs.fillColor; // TODO extract alpha
	style.fontFamily = attrs.face;
	style.fontSize = attrs.size;

	// bold and italic stuff
	var fontStyles = [];
	if (attrs.bold) fontStyles.push('bold');
	if (attrs.italic) fontStyles.push('italic');
	if (fontStyles.length > 0)
		style.fontStyle = fontStyles.join(' ');

	// filters stuff
	if (element.filters) {
		for (var filterIndex in element.filters) {
			var filter = element.filters[filterIndex];
			if (filter.name === 'dropShadowFilter')
				style.shadow = this.generateShadowObject(filter);
		}
	}
};

PhaserExporter.prototype.generateShadowObject = function(filter) {
	var obj = {
		color: filter.color,
		blur: filter.blurX,
		fill: true
	};
	var angle = filter.angle / 180 * Math.PI;
	obj.offsetX = roundToFract2(Math.cos(angle) * filter.distance);
	obj.offsetY = roundToFract2(Math.sin(angle) * filter.distance);
	return obj;
};

PhaserExporter.prototype.generateStates = function() {
	var timeline = this.libraryItem.timeline;
	for (var layerIndex in timeline.layers) {
		var layer = timeline.layers[layerIndex];
		if (layer.name === STATE_IDS_LAYER_NAME) {
			for (var frameIndex in layer.frames) {
				var frame = layer.frames[frameIndex];
				if (parseInt(frameIndex) !== frame.startFrame) {
					continue; // TODO parse state change animation
				}
				if (!frame.name)
					continue;
				var stateObject = this.getStateObjectById(frame.name);
				this.stateFramesById[frame.name] = frameIndex;
				this.stateIdsByFrameIndex[frameIndex] = frame.name;
			}
			return; // only one frame must have state ids!
		}
	}
};

PhaserExporter.prototype.saveToFiles = function() {
	var fileContent = JSON.stringify(this.rootObject);
	var fileURI = dirUrl + '/' + this.id + '.json';
	FLfile.write(fileURI, fileContent);
};


fl.trace('--- Script start');
for (var symbolIndex in lib.items) {
	var libraryItem = lib.items[symbolIndex];
	if (libraryItem.linkageClassName) {
		var exporter = new PhaserExporter(libraryItem);
		exporter.parse();
		exporter.saveToFiles();
	}
}

for (var imageName in images) {
	var imageItem = images[imageName];
	var imageFileName = dirUrl + '/' + imageName;
	var slashIndex = imageFileName.lastIndexOf('/');
	if (slashIndex !== -1) {
		var subDirURI = imageFileName.substring(0, slashIndex);
		FLfile.createFolder(subDirURI);
	}
	var fileURI = imageFileName + '.png';
	imageItem.exportToFile(fileURI);
}

fl.trace('--- script complete');


