declare function lan(arg, ...args): string;
declare function slog(type: "log" | "warn" | "error", ...args): void;
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

export function RandomSpeciesName(species: string) {
	return lan(draw(D.randomCharaNamePool));
}
