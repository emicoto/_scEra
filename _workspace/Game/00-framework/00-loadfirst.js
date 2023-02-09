//---------------------------------------------------------------------------
//
//  setup path
//
//---------------------------------------------------------------------------
S.path = "app/"; // path to the game folder
S.imagePath = S.path + "image/";
S.soundPath = S.path + "sound/";
S.savePath = S.path + "save/";

if (window.fs === undefined || window.fs === null) {
	slog("log", "node.js not supported");
	var fs = null;
} else {
	slog("log", "node.js supported");
	var fs = window.fs;
	Config.node = true;
}

//---------------------------------------------------------------------------
//
// language setting
//
//---------------------------------------------------------------------------

Config.lan = "CN";
Config.defLan = "CN";
Config.secLan = "EN";
Config.supportLan = ["CN", "EN"];

//---------------------------------------------------------------------------
//
//  Era setting
//
//---------------------------------------------------------------------------

Config.onEra = true;
Era.status = "start";

//trigger event let Era know the sugarcube is ready
jQuery(document).trigger("sugarcube:ready");

//---------------------------------------------------------------------------
//
//  Saves setting
//
//---------------------------------------------------------------------------
Config.history.controls = true;
Config.history.maxStates = 3;

Config.saves.slots = 6;

//set a flag to check if the game is reloading
game.onReload = true;

Save.onLoad.add(function (save) {
	//set the flag to check if the game is loaded
	game.onLoadUpdateCheck = true;
	game.onLoad = true;

	//some code here, it will be executed when the game is loaded
});

Save.onSave.add(function (save) {
	//some code here, it will be executed when the game is saved
});

// set the save id
Config.saves.id = "Game";

Config.saves.autosave = ["autosave", "eventend"];

//A function that returns true if the current passage is allowed to be saved.
//can customize the save function here
Config.saves.isAllowed = function () {
	if (tags().includes("nosave")) {
		return false;
	}
	return true;
};

// delete parser that adds unneeded line breaks -ng
Wikifier.Parser.delete("lineBreak");
