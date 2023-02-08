export const species = {
	human: ["人类", "Human"],
	elvin: ["精灵", "Elvin"],
	deamon: ["魔人", "Half Deamon"],
	wolves: ["狼人", "Wolves"],
	drawf: ["矮人", "Drawf"],
	goblin: ["地精", "Goblin"],
	catvinx: ["狐猫", "Catvinx"],
	centaur: ["马头人", "Centaur"],
	bestiary: ["兽化人", "Bestiary Human"],
	orc: ["奥克人", "Orc"],
	titan: ["巨人", "Titan"],
	dracon: ["龙人", "Dracon"],
	kijin: ["`鬼人", "Kijin"],
};

const raceBonus = function (race, type) {
	const races = Object.keys(species);
	const P = {
		//health+stamina+mana = 3.3
		//atk+def+mtk+mdf=4.4
		health: [1.1, 0.7, 1, 1.3, 1, 0.8, 1, 1.3, 1.6, 1.4, 1, 1],
		stamina: [1.1, 0.6, 1, 1.3, 1.5, 2, 1, 2, 1.6, 1.4, 1, 1.2],
		mana: [1.1, 2, 1.3, 0.5, 0.8, 0.5, 1.3, 0.7, 0.1, 0.5, 1.3, 1.1],
		ATK: [1.1, 0.5, 1, 1.4, 1.2, 1, 1, 1.4, 2, 1.4, 1, 1.2],
		DEF: [1.1, 0.6, 1, 1, 1.6, 1, 0.8, 1.2, 1.8, 1.5, 1, 1.1],
		MTK: [1.1, 1.8, 1.2, 0.8, 0.6, 1, 1.4, 0.8, 0.1, 0.5, 1, 1],
		MDF: [1.1, 1.5, 1.2, 1.2, 1, 2, 1.2, 1, 0.5, 0.6, 1.4, 1.1],
	};

	return P[type][races.indexOf(race)];
};
