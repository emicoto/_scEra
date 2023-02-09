import { cycleInfo } from "../types";
import { Chara } from "./Characters";
import { Organs } from "./Organs";
import { Species } from "./Species";

declare function lan(arg, ...args): string;
declare function draw(arr: any[]): any;
declare var D: typeof window.D;

//---------------------------------------------------------------------//
//
// common functions
//
//---------------------------------------------------------------------//

export function GenerateHeight(size: number, scale: number = 1) {
	if (typeof size !== "number") {
		size = random(5);
	}
	const r = D.bodysize[size];
	const height = random(r[0], r[1]) + random(30);
	return height * scale;
}
export function GenerateWeight(height: number) {
	const r = height / 1000;
	const BMI = 19 + random(-2, 4);
	return Math.floor(r * r * BMI + 0.5) + random(30) / 10;
}

export function BodyRatio(height: number) {
	const select = new SelectCase();
	select
		.case([240, 800], 3.5)
		.case([800, 1240], 4)
		.case([1300, 1400], 4.5)
		.case([1400, 1500], 5)
		.case([1500, 1660], 6)
		.case([1660, 1740], 6.5)
		.case([1740, 1800], 7)
		.else(7.5);
	return select.has(height);
}

export function BodySizeCalc(height: number) {
	return Math.floor((height / this.bodyScale - 1300) / 1500);
}

export function HeadSize(height: number) {
	return height / BodyRatio(height);
}

export function fixPenisProduce(p: Organs, species: string) {
	if (!p) return;
	let r: Species;
	if (species) {
		r = Species.data[species];
	}

	if (!p.produce) {
		p.produce = "cum";
		p.volume = { cur: 0, day: 0, max: 0 };
	}
	//basic volume
	p.volume.max = Math.floor((p.size[0] * p.size[1]) / 360) * 10;
	//size bonus
	p.volume.max += (p.sizeLv + 1) * (r.produce.penis.volumePerSize || 50);
	//trait bonus
	if (p.trait && p.trait.has("ThickCum")) p.volume.max *= 3;

	p.volume.day = r.produce.penis.volumePerSize || 10;
}

export function setCycle(chara: Chara) {
	if (!chara.pregnancy) {
		initCycle(chara);
	}
	const { cycle } = chara.pregnancy;
	let len, day;
	len = cycle.cycleDays + random(cycle.rng);
	day = cycle.stageDays;

	cycle.lastCircleDays = cycle.cycleDays;
	cycle.stages = [0, len - day, len + 0.5];

	console.log(chara.pregnancy);
}

export function initParasite(chara: Chara) {
	chara.parasite = {
		maxslot: 6,
		type: "",
		aware: false,
		intestinal: [],
	};
}

export function initCycle(chara: Chara) {
	const r = Species?.data[chara.species];
	let info: cycleInfo,
		len = [24, 36],
		day = [3, 5],
		rng = [0, 3],
		frng = [0, 2],
		ovul = 1,
		type: "menst" | "heat" | "none" | "alert" = "menst";

	if (r) {
		info = r.cycleInfo;
		type = info.type;
		len = info.cycleDays;
		rng = info.cycleRng;
		day = info.baseDays;
		ovul = info.ovulateNum;
		frng = info.ovulateRng;
	}

	if (!chara.pregnancy) {
		chara.pregnancy = {
			womb: {
				maxslot: info.wombSlot || 3,
				state: "normal",
				aware: false,
				fetus: [],
			},
			bellysize: 0,
			sperm: [],
		};

		if (chara.gender != "male") {
			chara.pregnancy.cycle = {
				type: type,
				cycleDays: random(len[0], len[1]),
				stageDays: random(day[0], day[1]),
				rng: random(rng[0], rng[1]),
				current: 0,
				state: "normal",
				running: true,
				stages: [],
				ovulate: ovul,
				frng: random(frng[0], frng[1]),
				lastCircleDays: 0,
			};
		}
	}
}

export function RandomSpeciesName(species: string) {
	return lan(draw(D.randomCharaNamePool));
}
