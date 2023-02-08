export * from "./bodyparts";
export * from "./BasicData";
export * from "./CommonFunc";

export * from "./Organs";
export * from "./Species";
export * from "./Creature";

export * from "./InitFunc";

import { Organs } from "./Organs";
import { Species } from "./Species";
import { Creature } from "./Creature";
import { Chara } from "./Characters";
import { species } from "./BasicData";
import { bodyDict, bodyGroup, Psize, existency, bodysize } from "./bodyparts";
import { GenerateHeight, GenerateWeight, BodyRatio, BodySizeCalc, HeadSize, RandomSpeciesName } from "./CommonFunc";
import { fixLanArr, InitSpecies, initBodyObj, listAllParts } from "./InitFunc";

const module = {
	name: "Creatures",
	version: "1.0.0",
	des: "A module for species and character system.",
	data: {
		species,
		bodyDict,
		bodyGroup,
		Psize,
		existency,
		bodysize,
	},
	database: {
		Species: Species.data,
		Creature: Creature.data,
		Chara: Chara.data,
	},
	classObj: {
		Organs,
		Species,
		Creature,
		Chara,
	},
	func: {
		GenerateHeight,
		GenerateWeight,
		RandomSpeciesName,
		listAllParts,
		Fix: {
			LanArr: fixLanArr,
			BodyRatio,
			BodySizeCalc,
			HeadSize,
		},
		Init: {
			InitSpecies,
			initBodyObj,
		},
	},
	config: {
		globaldata: true,
	},
	Init: ["InitSpecies"],
};

declare function addModule(module): boolean;
addModule(module);
