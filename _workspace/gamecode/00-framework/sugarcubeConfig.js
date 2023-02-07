Config.history.controls = true;
Config.history.maxStates = 3;

Config.saves.slots = 6;

Save.onLoad.add(function (save) {
  window.onLoadUpdateCheck = true;
});

game.onReload = true;

Save.onLoad.add(function (save) {
  game.onLoad = true;
});

Save.onSave.add(function (save) {
  //new Wikifier(null, '<<updateFeats>>');
  //prepareSaveDetails();
});

Config.saves.id = "Game";

/*LinkNumberify and images will enable or disable the feature completely*/
/*debug will enable or disable the feature only for new games*/

Config.saves.autosave = ["autosave", "eventend"];

Config.saves.isAllowed = function () {
  if (tags().includes("nosave")) {
    return false;
  }
  return true;
};

// delete parser that adds unneeded line breaks -ng
Wikifier.Parser.delete("lineBreak");
