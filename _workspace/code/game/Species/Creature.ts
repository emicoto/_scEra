import { Dict, P, ablkey, appearance, basekey, creaturetype, genderFull, palamkey, sblkey, statskey } from "../types";
import { Organs } from "./Organs";
import { Species } from "./Species";

declare function groupmatch(arg, ...args): boolean;
declare function slog(type: "log" | "warn" | "error", ...args): void;
declare function isValid(arg): boolean;

export interface Creature {
	type?: creaturetype; // only use in the database
	id?: string; //the id in the database
	cid?: string; //the id of character

	name: string; //the name of the creature
	gender: genderFull;
	species: string;

	//the traits to define who the creature is
	traits: string[];
	//the talent to define what the creature can do
	talent: string[];

	//the skill they own, the skill is mean specific skills. like thunderbolt, fireball, etc.
	skill: string[];

	//the basic stats of the creature
	stats: Dict<P, statskey>;
	//the base needs and palameters
	base: Dict<P, basekey>;
	//the palameters of the creature
	palam: Dict<P, palamkey>;

	//the appearance information of the creature
	appearance?: appearance;

	//the body parts of the creature
	body: Dict<Organs>;
	bodysize: number;

	//sources
	source: Dict<number>;
	//states
	state: string[];

	//temporal situation value
	tsv: any;
	//abilities
	abl: Dict<{ lv: number; exp: number }, ablkey>;
	//sexual or situation abilities
	sbl: Dict<number, sblkey>;

	//the equipment of creature is wearing
	equip?: any;

	//a temporary value to store species data
	r?: Species;
}

export class Creature {
	static data: Dict<Creature>;
	constructor(type: creaturetype, species: string, obj) {}
}

Creature.data = {};
