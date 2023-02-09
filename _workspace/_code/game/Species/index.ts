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
import {
	GenerateHeight,
	GenerateWeight,
	BodyRatio,
	BodySizeCalc,
	HeadSize,
	RandomSpeciesName,
	fixPenisProduce,
} from "./CommonFunc";
import { fixLanArr, InitSpecies, initBodyObj, listAllParts } from "./InitFunc";
import { initCycle, initParasite, setCycle } from "./CommonFunc";
import { getScar, skinCounter } from "./Scars";

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
		setCycle,
		BodyRatio,
		getScar,
		skinCounter,
		Fix: {
			LanArr: fixLanArr,
			BodySizeCalc,
			HeadSize,
			PenisProduce: fixPenisProduce,
		},
		Init: {
			InitSpecies,
			BodyObj: initBodyObj,
			Womb: initCycle,
			parasite: initParasite,
		},
	},
	config: {
		globaldata: true,
	},
	Init: ["InitSpecies"],
};

declare function addModule(module): boolean;
addModule(module);
