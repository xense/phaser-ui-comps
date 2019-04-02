const path = require("path");
const main = "./src/phasercomps.js";
const sourcePaths = [main];

module.exports = {
	entry: sourcePaths,

	mode: "production",
	//mode: "development",

	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "phaser-ui-comps.min.js",
		libraryTarget: "umd",
		library: "PhaserComps"
	},

	externals: {
		phaser: {
			umd: "phaser",
			commonjs2: "phaser",
			commonjs: "phaser",
			amd: "phaser",
			// indicates global variable should be used
			root: "Phaser"
		},
		underscore: {
			umd: "underscore",
			commonjs2: "underscore",
			commonjs: "underscore",
			amd: "underscore",
			// indicates global variable should be used
			root: "_"
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
				include: path.join(__dirname, 'src/')
			},
		],
	}
};
