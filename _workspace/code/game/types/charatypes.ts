import { race, Dict, statskey, basekey, palamkey, ablkey, sblkey, jobclass, markkey, expkey, P } from ".";

export interface sexStats {
	lv: number;
	type?: string;
	trait?: string[];

	size?: number;
	d?: number;
	l?: number;

	wet?: number;
	cum?: number;
	maxcum?: number;
	milk?: number;
	maxmilk?: number;
}

export interface appearance {
	eyecolor?: string;

	haircolor?: string;
	hairstlye?: string;

	skincolor?: string;
	beauty?: number;
	bodysize?: number;
	tall?: number; //mm
	weight?: number; //kg
}

export interface Creature {
	type: creaturetype;
	id?: string;
	cid: string;
	name: string;
	gender: genderFull;
	position: "neko" | "tachi" | "both";
	race: race;
	traits: string[];
	talent: string[];
	skill: string[];

	stats: Dict<P, statskey>;
	appearance?: appearance;
	base: Dict<P, basekey>;
	palam: Dict<P, palamkey>;

	source: Dict<number>;
	state: string[];
	mood: number;

	tsv: any;
	abl: Dict<{ lv: number; exp: number }, ablkey>;
	sbl: Dict<number, sblkey>;
	sexstats: Dict<sexStats>;

	equip?: any;
}

export interface Chara extends Creature {
	name: string;
	midname?: string;
	surname?: string;
	fullname?: string;
	nickame?: string;
	callname?: string;

	title?: string;
	class?: jobclass;
	guildRank?: number;

	kojo?: string;
	birthday?: [number, number, number];
	intro?: [string?, string?];

	mark?: Dict<number, markkey>;

	expUp: Dict<number>;

	daily?: any;
	exp?: Dict<{ aware: number; total: number }, expkey>;

	pregnancy?: any;
	parasite?: any;
	scars?: any;

	wear?: any;

	reveals?: any;
	virginity?: any;

	flag: any; //好感、信赖， 学籍情报， 诅咒进展， 诅咒魔力效率等
	wallet?: number;
	debt?: number;
	inventory?: any;
	tempture?: { low: number; high: number; best: number; current: number };
}

interface iName {
	v?: string;
	m?: string; //middle
	s?: string; //surname
	n?: string; //nick
	c?: string; //call master
}

export interface cycleInfo {
	type: "menst" | "heat" | "none";
	circleDays?: [number, number]; //cycle days range
	circleRng?: [number, number]; //cycle random range
	pregDays?: [number, number]; // pregnancy length
	pregType?: "babies" | "eggs" | "none";
	ovulateNum?: number; // max ovulate number
	ovulateRng?: [number, number]; // ovulate random range
	wombSlot?: number; // womb slot
}

export interface Womb {
	circle: {
		type: "menst" | "heat" | "none";
		basedays: number; // basic cycle day length
		rng: number; // cycle random range
		current: number; // current cycle day
		state: "pregnant" | "ovulate" | "menst" | "heat" | "normal";
		running: boolean; // is cycle running
		stages: number[]; //days of each stage
		ovulate: number;
		frng: number; // ovulate random range
		lastCircleDays: number; // last cycle day length
	};
	womb: {
		maxslot: number; // max womb slot
		state: "pregnant" | "empty";
		aware: boolean; // is aware of pregnancy
		fetus: any[]; // fetus
	};
	bellysize: number; // belly size
	sperm: any[]; // the sperm detail in womb
}

export interface Parasite {
	maxslot: number; // max parasite slot
	type: "slime" | "worm" | "tentacles" | "none";
	aware: boolean; // is aware of parasite
	intestinal: any[]; // the parasite detail in intestine
}

export type creaturetype = "chara" | "nnpc" | "monster" | "racetemplate" | "charatemplate";

export interface sexStats {
	lv: number;
	type?: string;
	trait?: string[];

	size?: number;
	d?: number;
	l?: number;

	wet?: number;
	cum?: number;
	maxcum?: number;
	milk?: number;
	maxmilk?: number;
}

export interface appearance {
	eyecolor?: string;

	haircolor?: string;
	hairstlye?: string;

	skincolor?: string;
	beauty?: number;

	height?: number; //mm
	weight?: number; //kg

	bust?: number;
	waist?: number;
	hip?: number;
}

export interface bodypartInfo {
	name: string;
	pos: "left" | "right" | "front" | "back" | "top" | "bottom";
	type: existency;
	dp: [number, number];
	shape: string;
}

export type bodypart =
	//head
	| "eyes"
	| "ears"
	| "nose"
	| "mouth"
	| "hair"
	| "horns"

	//torso
	| "skin"
	| "fur"
	| "breast"
	| "arms"
	| "hands"
	| "butts"
	| "thighs"
	| "legs"
	| "feet"
	| "hoofs"
	| "tails"
	| "wings"

	//organ
	| "brain"
	| "heart"
	| "liver"
	| "lungs"
	| "kidneys"
	| "stomach"
	| "womb"
	| "vaginal"
	| "anal"
	| "penis"
	| "clitoris"
	| "teste";

//作为tag。可以合并。 fog|hidden 这样。
//fog是类似雾气的离子体。 slime是史莱姆一样的不定型结构。
//fake是虚假的人造品. natural是天然生物结构

//hideable和invisilbe是追加tag.用于判定某些特殊种族的器官可见性.
//hideable指可以收纳在体内的结构, 平时是不可见的.
//invisible指无法观察到的形态
export type existency = "none" | "fog" | "slime" | "fake" | "natural" | "hideable";

export type bodygroup = "head" | "torso" | "bottom" | "back" | "organ" | "limb";

export type gender = "f" | "m" | "n";
export type genderFull = "female" | "male" | "none" | "herm";

export type charaposi = "neko" | "tach" | "both";
