declare var Config: typeof window.Config;
const support = ["CN", "EN", "JP"];

//根据语言设定返回对应位置的文本。如果没有对应的文本，则返回第一个文本
export function lan(...txts) {
	let first = Config.lan || "CN",
		sec = Config.secLan || "EN";

	let i = support.indexOf(first);
	if (txts[i]) return txts[i];

	i = support.indexOf(sec);
	if (txts[i]) return txts[i];

	return txts[0];
}

export function percent(...num) {
	let min = num[0],
		max = num[1];
	if (num.length == 3) {
		min = num[1];
		max = num[2];
	}
	return Math.clamp(Math.trunc((min / max) * 100), 1, 100);
}

Object.defineProperties(window, {
	percent: { value: percent },
	lan: { value: lan },
});
