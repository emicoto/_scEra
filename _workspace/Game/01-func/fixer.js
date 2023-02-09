Fix.reveals = function (reveal, equip) {
	const { detail } = reveal;

	//--- 每次穿脱衣服时会初始化一次然后重新记录每个部位的裸露值。
	//--- 目前层次的装备低于现有值才更新。
	const set = function (key, wear) {
		if (detail[key] == undefined) return;

		if (wear.expose < detail[key].expose) {
			detail[key].expose = wear.expose;
		}
		if (wear.open < detail[key].block) {
			detail[key].block = wear.open;
		}
	};

	//--- 逐层解构
	const setReveal = function (wear) {
		const list = wear.cover;

		if (isValid(list) === false) return;

		list.forEach((k) => {
			if (D.coverlistB.includes(k)) {
				setReveal(D.covergroupB[k]);
			}
			if (D.coverlistA.includes(k)) {
				setReveal(D.covergroupA[k]);
			}
			if (D.skinlayer.includes(k)) {
				set(k, wear);
			}
		});
	};

	setReveal(equip.innerBt);
	setReveal(equip.innerUp);

	setReveal(equip.outfitBt);
	setReveal(equip.outfitUp);

	setReveal(equip.cover);

	reveal.parts = [];
	reveal.expose = 0;
	reveal.reveal = 0;

	for (const [k, c] of Object.entries(detail)) {
		if (c?.expose >= 2) reveal.parts.push(k);
	}

	reveal.parts.forEach((v) => {
		if (["face", "neck"].includes(v) === false) reveal.reveal += Math.floor(100 * (detail[v].expose / 3));
	});

	const risk = {
		genital: 2,
		anus: 1,
		breast: 1,
		private: 0.2,
		buttL: 0.2,
		buttR: 0.2,
	};

	Object.keys(risk).forEach((k) => {
		if (reveal.parts.includes(k)) {
			reveal.expose += risk[k] / (detail[k].expose == 3 ? 1 : 2);
		}
	});

	reveal.expose = Math.floor(reveal.expose);

	return reveal;
};
