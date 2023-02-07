const { spawn } = require("child_process");
//const path = require("path");
const _resolve = (...w) => path.resolve(nw.__dirname, `./`, ...w);
const { platform, arch } = require("os");

const scbuild = function () {
	const SYSTEM = {
		platform: platform(),
		arch: arch(),
	};
	console.log(SYSTEM);
	const tweego = () => {
		const system = {
			win32: "win",
			linux: "linux",
			darwin: "osx",
		};
		if (!system[SYSTEM.platform]) throw new Error("请用 Windows系统, Linux系统 或 Mac系统");
		return `tweego_${system[SYSTEM.platform]}${SYSTEM.arch.includes("64") ? "64" : "86"}${
			SYSTEM.platform === "win32" ? ".exe" : ""
		}`;
	};
	const COMMANDS = [];
	const TWEEGO_PATH = _resolve("_workspace/.twine/StoryFormats");
	const options = {
		html: `--output=${_resolve("app/index.html")}`,
		Head: `--head=${_resolve("_workspace/head.html")}`,
		src: _resolve("_workspace/gamecode"),
		isWatch: "-w",
		modules: `--module=${_resolve("_workspace/modules")}`,
	};

	for (const key of ["html", "Head", "isWatch", "modules", "src"]) {
		COMMANDS.push(options[key]);
	}

	const app = nw.Window.get();
	const string = COMMANDS.join(" ");
	console.log(string);
	app.hide();
	app.showDevTools();
	const result = spawn(tweego(), COMMANDS, {
		env: {
			TWEEGO_PATH,
		},
		cwd: _resolve("_workspace/.twine/"),
	});
	result.stdout.on("data", (data) => {
		console.log(data.toString());
	});
	window.App = {};
	nw.Window.open("./app/index.html", {}, (win) => {
		console.log("App loaded.");
		App.win = win;
		win.showDevTools();
		win.on("close", () => {
			win.close(true);
			app.close(true);
		});
	});
	result.stderr.on("data", (data) => {
		const str = data.toString();
		console.log(data);
		console.log(data.toString());
		if (/BUILDING/.test(str)) {
			setTimeout(() => {
				App.win.reload();
				console.log("App reloaded.");
			}, 1500);
		}
	});
};
scbuild();
