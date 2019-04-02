const path = require("path");
const main = "./src/phasercomps.js";
const sourcePaths = [main];

module.exports = {
	entry: sourcePaths,

	mode: "production",

	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "phaser-ui-comps-with-underscore.min.js",
		libraryTarget: "umd",
		library: "PhaserComps",
	},

	externals: {
		phaser: {
			umd: "phaser",
			commonjs2: "phaser",
			commonjs: "phaser",
			amd: "phaser",
			// indicates global variable should be used
			root: "Phaser"
		}
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: [
					/node_modules/,
				],
			},
		],
	}
};
