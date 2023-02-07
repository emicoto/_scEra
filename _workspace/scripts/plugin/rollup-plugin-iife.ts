import { OutputOptions, SourceMap, Plugin, OutputChunk } from "rollup";
export function createPlugin() {
	return {
		name: "rollup-plugin-iife",
		generateBundle(o, x) {
			if (o.format === "iife") {
				for (const bundle of Object.keys(x)) {
					if ((x[bundle] as OutputChunk).code !== null) {
						const reg = /^\(function/;
						(x[bundle] as OutputChunk).code = (x[bundle] as OutputChunk).code.replace(reg, ";(function");
					}
				}
			}
		},
	} as Plugin;
}
