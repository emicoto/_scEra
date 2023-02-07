setup.Path = "app/"; // Running in a browser
setup.ImagePath = setup.Path + "image/";
setup.SoundPath = setup.Path + "sound/";

// volume slider, by chapel; for sugarcube 2
// version 1.1 - modified by HiEv for SugarCube v2.28.0+
// For custom CSS for slider use: http://danielstern.ca/range.css/#/

if (window.fs === undefined || window.fs === null) {
	slog("log", "node.js not supported");
	var fs = null;
} else {
	slog("log", "node.js supported");
	var fs = window.fs;
}

window.saveToFile = function () {
	const savedata = Save.serialize(V);
	fs.writeFileSync("app/save/save.sav", savedata);
};

console.log("check config", Config);

Config.lan = "CN";
Config.deflan = "CN";
Config.seclan = "EN";

jQuery(document).trigger("sugarcube:ready");

Config.runningcycle = true;
Config.afterinit = false;
