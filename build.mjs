import esbuild from "esbuild";
import path from "node:path";

await esbuild.build({
	entryPoints: ["input.mjs"],
	outfile: "output.mjs",
	bundle: true,
	external: ["node:*"],
	format: "esm",

	// wrangler uses esbuild's built-in config for user-defined aliasing
	// we want this to take precedence over unenv's polyfills
	alias: {
		"node:fs": "./fs-alias.js",
	},

	plugins: [
		// wrangler will inject unenv polyfills with an esbuild-plugin
		// we want this to take less precedence than the user specified aliasing
		{
			name: "unenv-alias-plugin",
			setup(build) {
				build.onResolve({ filter: /^node:/ }, (args) => {
					if (args.path === "node:fs") {
						return { path: path.resolve("./fs-alias-throw.js") };
					}
				});
			},
		},
	],
});
