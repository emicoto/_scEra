import { race, Dict, statskey, basekey, palamkey, ablkey, sblkey, jobclass, markkey, expkey, P } from ".";

export interface cycleInfo {
	type: "menst" | "heat" | "none" | "alert";
	cycleDays: [number, number]; //cycle days range
	cycleRng: [number, number]; //cycle random range

	baseDays?: [number, number]; //menst/heat days range

	pregDays?: [number, number]; // pregnancy length
	pregType?: "babies" | "eggs" | "none";
	ovulateNum?: number; // max ovulate number
	ovulateRng?: [number, number]; // ovulate random range
	wombSlot?: number; // womb slot
}

export interface Womb {
	cycle?: {
		type: "menst" | "heat" | "none" | "alert";
		cycleDays: number; // cycle day length
		stageDays: number; //mens/heats day length
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
		state: "pregnant" | "normal";
		aware: boolean; // is aware of pregnancy
		fetus: any[]; // fetus
	};
	bellysize: number; // belly size
	sperm: any[]; // the sperm detail in womb
}

export interface Parasite {
	maxslot: number; // max parasite slot
	type: "slime" | "worm" | "tentacles" | "" | "none";
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
	hairstyle?: string;

	skincolor?: string;
	beauty?: number;

	height?: number; //mm
	weight?: number; //kg

	bust?: number;
	waist?: number;
	hip?: number;
}

export interface bodypartInfo {
	name?: string;
	pos?: "left" | "right" | "front" | "back" | "top" | "bottom";
	type: existency;
	dp: [number, number];
	shape?: string;
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
//ionic是类似雾气的离子体。 slime是史莱姆一样的不定型结构。
//artifact是虚假的人造品. natural是天然生物结构

//hideable和invisilbe是追加tag.用于判定某些特殊种族的器官可见性.
//hideable指可以收纳在体内的结构, 平时是不可见的.
//invisible指无法观察到的形态
export type existency = "none" | "ionic" | "slime" | "artifact" | "natural" | "hideable" | "invisible";

export type bodygroup = "head" | "torso" | "bottom" | "back" | "organ" | "limb";

export type gender = "f" | "m" | "n";
export type genderFull = "female" | "male" | "none" | "herm";

export type charaposi = "neko" | "tach" | "any";

export type dailykeys =
	| "cum"
	| "swallowed"
	| "cumA"
	| "cumV"
	| "orgasm"
	| "ogM"
	| "ogB"
	| "ogC"
	| "ogU"
	| "ogV"
	| "ogA";
