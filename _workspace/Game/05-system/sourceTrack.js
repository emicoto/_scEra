F.sourceCheck = function (chara, cid) {
	//source的处理。根据条件对source的获得值进行加减。

	//根据特定条件进行数值处理

	//根据素质进行数值处理. 数值buff最后处理
	F.traitSource(chara, cid);
};

F.ablSource = function (chara, cid) {
	//根据Abl等级对数值进行处理.
	//还得看现在处理的角色当前的执行指令……哎？
	//当前执行指令详细 T.actionDetail 、T.CharaCounterDetail
	// com 模式则储存在 T.selectCom, T.lastCom, T.inputCom
};

F.traitSource = function (chara, cid) {
	chara.traits.forEach((t) => {
		const data = Trait.get("trait", t);
		//get 和 lose 是一个obj，分别对应获得和失去的数值变化。
		//onSource 是一个函数，用于对数值进行例外处理。
		for (let i in data.get) {
			if (chara.source[i] && chara.source[i] > 0) {
				chara.source[i] *= data.get[i];
			}
		}

		for (let i in data.lose) {
			if (chara.source[i] && chara.source[i] < 0) {
				chara.source[i] *= data.lose[i];
			}
		}

		if (typeof data.onSource == "function") {
			// 执行素质的例外处理。
			data.onSource(cid);
		}
	});
};

F.sourceUp = function (chara) {
	//根据处理结果进行反馈。并输出结果文字到 S.sourceResult下。当启用显示结果数值时，会显示在COM after之后。
	const base = Object.keys(D.base);
	const palam = Object.keys(D.palam);

	let retext = [chara.name + "数值变动："];

	for (let i in chara.source) {
		let msg = "";

		if (chara.source[i] !== 0) {
			//将变动记录作为文本记录到 S.msg 里面。
			const v = chara.source[i];
			const lv = chara.palam[i][0] + 1;
			msg = `>> ${lan(D.palam[i])}${v > 0 ? " + " : " - "}${v} = ${chara.palam[i][1] + v} / ${S.palamLv[lv]}`;
		}

		if (base.includes(i) && chara.source[i]) {
			chara.base[i][0] = Math.clamp(chara.base[i][0] + chara.source[i], -100, chara.base[i][1] * 1.5);
		}

		if (palam.includes(i) && chara.source[i]) {
			const lv = chara.palam[i][0] + 1;

			chara.palam[i][1] += chara.source[i];

			//palam lv的处理， 顺便在这里记录变动文本？
			if (chara.palam[i][1] >= D.palamLv[lv]) {
				chara.palam[i][i] -= D.palamLv[lv];
				//use clamp to limit the palam lv
				chara.palam[i][0] = Math.clamp(chara.palam[i][0] + 1, 0, S.palamLv.length);

				msg += "　Lvup!!";
			}
		}

		if (msg) retext.push(msg);
		//清空数值
		chara.source[i] = 0;
	}

	if (retext.length > 1) P.msg(retext.join("<br>") + "<<dashline>>");
};

F.trackCheck = function (chara, cid) {
	// equip, 持续动作的追踪和处理
	// the equip, the track and process of the continuous action
	// something like this:
	/*
      for(const [equip, data] of Object.entries(chara.equip)){
         if(equip.source){
            //do something
         }
      }

   */
};
