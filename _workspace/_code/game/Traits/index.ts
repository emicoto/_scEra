export * from "./Trait";
import { Trait, Talent, findConflic, traitslist, talentlist } from "./Trait";
import { TraitList } from "./traitlist";

const modules = {
	name: "Traits",
	version: "1.0.0",
	des: "A module for trait system.",
	data: {
		traits: traitslist,
		talents: talentlist,
	},
	database: Trait.data,
	classObj: {
		Trait,
		Talent,
	},
	func: {
		findConflic,
		Init: {
			Traitlist: TraitList,
		},
	},
	config: {
		globalFunc: {
			findConflic,
		},
		globaldata: true,
	},
	Init: ["Traitlist"],
};

declare function addModule(modules): boolean;
addModule(modules);
