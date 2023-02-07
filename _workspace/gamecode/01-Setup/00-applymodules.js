slog("log", "Start to apply modules:", Object.keys(scEra.modules));
//----------------------------------
//   scEra.apply
//----------------------------------
//apply the module
Object.keys(scEra.modules).forEach((moduleName) => {
	applyModule(moduleName);
});

console.timeLog("scEra startup");
slog("log", "Finish to apply modules.");

//----------------------------------
//   scEra.apply class
//----------------------------------
slog("log", "Applying classes to global namespace...");
applyClass();
console.timeLog("scEra startup");
slog("log", "Finish to apply classes.");

jQuery(document).trigger("scEra:apply");
