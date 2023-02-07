import { Plugin, RollupOptions } from "rollup";
// TODO: Replace this when "rollup-plugin-esbuild" fixes their sourcemap issues.
import esbuild, { Options } from "rollup-plugin-esbuild-transform";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { IIFE } from "./plugin";
import multiInput from "rollup-plugin-multi-input";
import del from "rollup-plugin-delete";
// import { partytownRollup } from '@builder.io/partytown/utils';
// import path from 'path'

const env = process.env.NODE_ENV;
const isProduction = env === "production";

const sharedOptions: Options = {
	minify: isProduction,
	target: "es6",
	define: {
		// Avoids issues with the Node-specific variable `process`.
		"process.env.NODE_ENV": JSON.stringify(env),
	},
};
const plugins: Plugin[] = [
	esbuild([
		{ loader: "json", ...sharedOptions },
		{ loader: "ts", ...sharedOptions },
	]),
	nodeResolve({ browser: true }),
	commonjs({ extensions: [".js", ".json"] }),
	IIFE.createPlugin(),
];

export const configs: RollupOptions[] = [
	{
		input: "_workspace/_code/game/main.ts",
		plugins,
		external: ["phaser"],
		output: {
			format: "iife",
			file: "_workspace/Core/02-game.js",
			//sourcemap: "inline",
			globals: { phaser: "Phaser" },
		},
	},
	{
		input: "_workspace/_code/lib/index.ts",
		plugins,
		output: {
			format: "iife",
			file: "_workspace/Core/00-scEra.js",
		},
	},
	{
		input: "_workspace/_code/utils/index.ts",
		plugins,
		output: {
			format: "iife",
			file: "_workspace/Core/01-utils.js",
		},
	},

	//	{
	//		input: ["Lib/Module/**/*.ts"],
	//		plugins: [multiInput({ relative: "Lib/Module/" }), ...plugins],
	//		output: {
	//			format: "commonjs",
	//			dir: "modules/Lib",
	//			//sourcemap: "inline",
	//		},
	//	},
];
