F.timeProcess = function (t) {
	const date = V.date;

	date.time += t;

	const days = Math.floor(date.time / 1440);
	const weeks = (date.week + days) % 7;

	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);

	if (days) {
		date.day += days;
		date.time -= 1440 * days;
	}

	date.week = weeks;

	if (months) {
		date.month += months;
		date.day -= days;
	}

	if (years) {
		date.year += years;
		date.month -= months;
	}
};

F.passtime = function (time) {
	V.time.total += time;

	//时间变化时的处理
	F.timeEffects(time);
	F.timeProcess(time);

	return "";
};

DefineMacros("passtime", F.passtime);

F.timeEffects = function (t, mode) {
	const { pc, date, flag, time } = V;

	if (date.time + t >= 1380) flag.daychange = true; //先不加到现在时间，瞅瞅过23点没。

	//根据在场角色进行source处理
	let charas = V.location.chara;
	charas.forEach((cid) => {
		const chara = C[cid];

		//衣服穿着和持续行动带来的source变动
		F.trackCheck(chara, cid);
		F.sourceCheck(chara, cid);
		F.sourceUp(chara, cid);
	});

	//对不在场的角色进行时间经过处理。
	//charas = F.getNoActiveChara()
};
