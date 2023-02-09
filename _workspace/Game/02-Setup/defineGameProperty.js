//--------------------------------------------------------------
//
// define game property and defalut value here
//
//--------------------------------------------------------------

//game config, use 0 or 1 to represent false or true
S.gameConfig = {
	//any config here
	debug: 0,
	alwaysShowPCName: 0,
};

//game flags.
S.gameFlags = {
	//any flag here
	mode: "normal",
	chapter: 0,
};

//game variables
S.gameVars = {
	//any variable here
	shop: "",
};

//time setting. year, month, day, weekday, time(minute)
S.date = [4066, 3, 14, 1, 1120];

//default exit link after event
S.defaultExit = "MainLoop";
