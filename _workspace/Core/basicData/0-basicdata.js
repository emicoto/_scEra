D.stats = ["ATK", "DEF", "MTK", "MDF", "STR", "CON", "DEX", "INT", "WIL", "PSY", "ALR", "LUK"];

D.basicNeeds = {
	health: ["健康", "HP."],
	stamina: ["体力", "SP."],
	sanity: ["理智", "San."],
	mana: ["魔力", "MP."],

	hydration: ["水分", "Hyd."],
	nutrition: ["营养", "Nutr."],
	clean: ["清洁", "Cln."],
};

D.basicPalam = {
	drug: ["药物", "Drg."],
	alcohol: ["酒精", "Alc."],
	stress: ["压力", "Str."],
	libido: ["性欲", "Lbd."],
};

D.base = Object.assign({}, D.basicNeeds, D.basicPalam);

D.palam = {
	ecstacy: ["快感", "Ecs."], //快感值总条。 与射精or潮吹绑定。
	//受方palam
	lust: ["欲情", "Lust."], //欲望值，根据累积flag升级欲望lv。指令执行成功时概率获得依存值。
	surrend: ["屈从", "Srr."], //根据累积flag升级顺从Lv。屈从palamlv累计到一定值时获得刻印。指令执行成功时概率获得服从值/支配值。
	fear: ["恐惧", "Fear."], //恐惧刻印
	mortify: ["羞耻", "Mtf."], //羞耻刻印。露出类指令。
	humiliate: ["受辱", "Hml."], //耻辱刻印。 羞辱类指令
	pain: ["疼痛", "Pain."], //痛苦刻印
	depress: ["抑郁", "Dpr."], //压力值
	resist: ["抵触", "Rst."], //反抗刻印
	favo: ["好意", "Favo"], //好感转换
	uncomfort: ["不适", "Ucm."], //减少mood，根据情况转换为疼痛、抵触、压抑。影响体力与健康的消耗。可能触发生病flag

	//攻方palam
	eager: ["渴望", "Egr."], //行为时间拉长，动作变急切。依存up
	angry: ["愤怒", "Angr."], //mood down，动作会变粗暴。
	satisfy: ["满意", "Sat."], //评价up 好感up
	superior: ["优越", "Sup."], // 支配度up

	//部位palam。各种高潮判定主要看这边。高潮时获得性依存度，快乐刻印
	esM: ["快M", "ecsM."],
	esB: ["快B", "ecsB."], //同时也是喷乳判定条
	esC: ["快C", "ecsC."],
	esU: ["快U", "ecsU."],
	esV: ["快V", "ecsV."],
	esA: ["快A", "ecsA."],

	//各部位疼痛值。抖M会转化为部位快感。否则抵消部分快感。总值算入pain中。
	paM: ["痛M", "pnM."],
	paB: ["痛B", "pnB."],
	paC: ["痛C", "pnC."],
	paU: ["痛U", "pnU."],
	paV: ["痛V", "pnV."],
	paA: ["痛A", "pnA."],
};

D.basicBodypart = ["head", "torso", "arms", "legs", "feet", "ears", "ears", "breast", "butts", "genitals"];

D.test = "test";
