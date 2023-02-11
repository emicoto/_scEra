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

	//eraCom setting
	showAllCommand: 0,
	showOrder: 0,
};

//game flags.
S.gameFlags = {
	//any flag here
	chapter: 0,

	//eraCom or action setting
	mode: "normal",
	scenePhase: "start",
};

//game variables
S.gameVars = {
	//any variable here
	location: {},
	chara: {},
	player: {
		name: "",
	},
	target: {},
	master: "",

	//player character id
	pc: "",
	//target character id
	tc: "",
};

//time setting. year, month, day, weekday, time(minute)
S.date = [4066, 3, 14, 1, 1120];

//default exit link after event
S.defaultExit = "MainLoop";

//default next button text at end of msg
S.defaultNext = "Next Step";

//set the ignore value of the command when check the order
S.ignoreOrder = 20;

//the initial value of palam lv, increasement rule is n*1200 + n*100, n is Lv+1， max lv 10
S.palamLv = [0, 1200, 2500, 3900, 5400, 7000, 8700, 10500, 12400, 14400, 16500];

//the initial value of exp lv, max lv 12
S.expLv = [0, 10, 50, 150, 300, 600, 1000, 1800, 3000, 5000, 8000, 12000, 18000];

//the initial value of abl lv, max lv 20
S.ablLv = [
	0, 20, 50, 100, 300, 800, 1500, 3200, 4800, 6200, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000,
	26000, 28000,
];
