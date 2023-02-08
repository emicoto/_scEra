import { InitTraitsConflict, setTrait, Trait } from "./Trait";
declare var D: typeof window.D;
declare function getJson(path: string): Promise<any>;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;

export async function TraitList() {
	let list: setTrait[] = [
		//体质类
		{
			name: ["纤弱", "Weak"],
			group: "physical",
			des: ["风一吹就倒体的样子。", "The one who is blown down by the wind."],
			order: 1,
			sourceEffect: [["stamina", 1.2, "lose"]],
		},
		{
			name: ["强壮", "Strong"],
			group: "physical",
			des: ["身强力壮肌肉发达。", "Strong and muscular."],
			order: 0,
			sourceEffect: [["stamina", 0.8, "lose"]],
		},
		{
			name: ["耐疼", "Tough"],
			group: "physical",
			des: ["皮糙肉厚，些许磕碰也不觉得疼。", "The skin is thick and tough, it's hard to feel pain."],
			order: 0,
			sourceEffect: [["paAll", 0.8]],
		},
		{
			name: ["不耐疼", "Tender"],
			group: "physical",
			des: [
				"细皮嫩肉，些许磕碰也会很痛。",
				"The skin is tender and sensitive, it will feel painful even a little bumps.",
			],
			order: 0,
			sourceEffect: [["paAll", 1.2]],
		},

		{
			name: ["易伤体质", "GlassBody"], // 获得吻痕, 鞭痕等获得概率增加, 消退时间翻倍
			group: "physical",
			des: [
				"身上很容易留下痕迹，还不容易消退。",
				"It leaves marks easily on the body and difficult to recover from.",
			],
			order: 0,
		},
		{
			name: ["早泄", "Premature"], //更容易射
			group: "physical",
			des: ["手速很快，但射得更快。", "The hands is fast, but the shot is faster."],
			sourceEffect: [["ecstacy", 2.5]],
		},
		{
			name: ["金枪不倒", "Durable"], //很难射
			group: "physical",
			des: ["小兄弟十分勇猛，金枪百战不倒。", "The cock is very brave, he will not fail in a hundred battles."],
			sourceEffect: [["ecstacy", 0.25]],
		},

		{
			name: ["性冷淡", "IceCold"],
			group: "physical",
			des: ["没有世俗的欲望。", "The sex drive is colder than ice."],
			sourceEffect: [
				["libido", 0.3],
				["lust", 0.3],
				["libido", 2, "lose"],
			],
		},
		{
			name: ["性欲强", "FireHot"],
			group: "physical",
			des: ["身体很容易被刺激到。", "The sex drive is hotter than fire."],
			sourceEffect: [
				["libido", 1.5],
				["lust", 1.5],
				["libido", 0.5, "lose"],
			],
		},

		//倾向性
		{
			name: ["M体质", "MasochicBody"], //无自觉M倾向, 疼痛的 0.1 转换为快感
			group: "SM",
			des: ["明明很痛，但莫名的有点酸爽。", "It's kind of pain, but oddly feel a little bit good."],
			order: 0,
		},
		{
			name: ["M倾向", "Masochicsm"], //有自觉M倾向,疼痛的 0.2 转换为快感
			group: "SM",
			des: ["战斗时倾向往前排承受伤害。", "Enjoy taking damage at the front during combat."],
			order: 10,
		},
		{
			name: ["S倾向", "Sadicsm"], //S倾向。部分指令优越up
			group: "SM",
			des: ["战斗时倾向往前排输出伤害。", "Enjoys outputting damage at the front during combat."],
			order: 0,
		},

		//名器系列, 增加攻方的快乐度
		{
			name: ["A名器", "QualityAnal"],
			group: "quaility",
			des: ["这个菊穴用起来会很爽。", "Oh..!So tight.."],
			order: 0,
		},
		{
			name: ["V名器", "QuailityVagina"],
			group: "quaility",
			des: ["这个秘穴用起来会很爽。", "Oh..!So tight and smooth.."],
			order: 0,
		},
		{
			name: ["M名器", "QualityMouth"],
			group: "quaility",
			des: ["这个嘴用起来会很爽。", "Oh..!Nice mouth pussy.."],
			order: 0,
		},

		//精神类
		{
			name: ["理智", "Rational"], //理智上限up, 各负面精神数值恢复量up
			group: "mental",
			des: [
				"无论什么时候都能做出理智的判断。从负面状态中更容易恢复。",
				"Can make sensible judgments no matter what. Recover more easily from negative states.",
			],
			order: 5,
		},
		{
			name: "不过线", //陷落需求数值翻倍
			group: "mental",
			des: "对什么是都分得很清楚，不会轻易过线。",
			order: -10,
		},
		{
			name: "淡漠",
			group: "mental",
			des: "无所谓，没有什么能让我心动的。",
			conflict: ["放纵", "冲动", "高调", "强欲"],
			order: 0,
			sourceEffect: [
				["lust", 0.75],
				["eager", 0.8],
				["satisfy", 1.2],
			],
		},
		{
			name: "强欲",
			group: "mental",
			des: "小孩才做选择，我全都要！",
			order: 0,
			sourceEffect: [
				["lust", 1.25],
				["eager", 1.2],
				["satisfy", 0.8],
			],
		},
		{
			name: "胆大",
			group: "mental",
			des: "无法被恐惧打倒。",
			order: 5,
			sourceEffect: [["fear", 0.8]],
		},
		{
			name: "胆小",
			group: "mental",
			des: "容易受到惊吓。",
			order: -5,
			sourceEffect: [["fear", 0.8]],
		},

		{
			name: "冲动",
			group: "mental",
			des: "别拦我，我就要去！",
			order: 5,
			sourceEffect: [["sanity", 1.2, "lose"]],
		},
		{
			name: "忍耐",
			group: "mental",
			des: "忍忍，就过去了。",
			order: 0,
			sourceEffect: [
				["paAll", 0.9],
				["fear", 0.9],
				["lust", 0.9],
				["esAll", 0.9],
			],
		},
		{
			name: "脆弱",
			group: "mental",
			des: "呜呜呜……玻璃心……碎了。",
			order: 3,
			sourceEffect: [
				["sanity", 1.5, "lose"],
				["paALL", 1.2],
				["fear", 1.5],
			],
		},
		{
			name: "坚韧",
			group: "mental",
			des: "没有什么可以打倒我的。",
			order: 0,
			sourceEffect: [
				["sanity", 0.8, "lose"],
				["paAll", 0.9],
				["fear", 0.9],
				["lust", 0.9],
				["esAll", 0.9],
			],
		},
		{
			name: "不服输",
			group: "mental",
			des: "再来一局！",
			order: 5,
			sourceEffect: [["surrend", 0.8]],
		},
		{
			name: "乐观",
			group: "mental",
			des: "每天都是晴天。",
			order: 2,
			sourceEffect: [
				["depress", 0.8],
				["resist", 0.8],
			],
		},
		{
			name: "悲观",
			group: "mental",
			des: "每天都是阴天。",
			order: -2,
			sourceEffect: [
				["depress", 1.2],
				["resist", 1.2],
			],
		},
		{
			name: "厚脸皮", // 交涉效果up
			group: "mental",
			des: "只要我不尴尬，尴尬的就是别人",
			order: 2,
			sourceEffect: [
				["mortify", 0.8],
				["favo", 1.1],
			],
		},

		//性格
		{
			name: "冷静",
			group: "性格",
			des: "无论什么情况都能维持冷静。",
			order: 0,
			sourceEffect: [
				["fear", 0.8],
				["angry", 0.8],
				["depress", 0.8],
			],
		},
		{
			name: "傲娇", //陷落前好感类down, 陷落后反转
			group: "性格",
			des: "才不是为了你呢！",
			order: 0,
		},
		{
			name: "乖顺", //特定指令更容易执行
			group: "性格",
			des: "哦，好的。",
			order: 5,
			sourceEffect: [
				["surrend", 1.4],
				["resist", 0.6],
			],
		},
		{
			name: "叛逆", //特定指令屈服up, 且更容易执行(非要反着来?)
			group: "性格",
			des: "滚！",
			order: -10,
			sourceEffect: [
				["surrend", 0.6],
				["resist", 1.5],
			],
		},
		{
			name: "高傲", //特定指令需求更多配合值
			group: "性格",
			des: "像我这么高贵的血统，只有别人配合我，凭啥让我配合别人？",
			order: -5,
		},
		{
			name: "善嫉", //有别人在场时需求配合值降低。容易触发修罗场
			group: "性格",
			des: "凭什么啊？他哪有大家说的那么好，应该看我的！",
			order: 5,
		},

		//对性的态度。只能存在一个
		{
			name: "性保守", //清醒时快感全面down
			group: "性观念",
			des: "繁衍是神圣的，不该以享乐而为之。",
			order: 0,
		},
		{
			name: "性开放", //清醒时快感全面up
			group: "性观念",
			des: "性就是娱乐行为，怎么开心怎么来。",
			order: 0,
		},
		{
			name: "禁欲",
			group: "性观念",
			des: "神啊，请原谅我的罪恶！",
			order: -2,
			sourceEffect: [
				["lust", 0.2],
				["esAll", 1.2],
			],
		},
		{
			name: "放纵",
			group: "性观念",
			des: "性自由今天就要实现！",
			order: 2,
			sourceEffect: [
				["lust", 1.8],
				["esAll", 0.5],
			],
		},
		{
			name: "洁癖",
			group: "性观念",
			des: "脏死了，别碰我！",
			order: 0,
			sourceEffect: [
				["lust", 0.2],
				["resist", 2],
				["esAll", 0.9],
			],
		},
		{
			name: "性瘾", // 免疫性行为的负面心理影响, 高潮条翻倍, 性欲获得翻倍, 欲求不满时高概率暴走
			group: "性观念",
			des: "快，正面上我！！",
			order: 10,
			sourceEffect: [
				["lust", 2.5],
				["libido", 3],
			],
		},

		// 行为模式
		{
			name: "高洁", //禁止特定行动,部分指令需要更多配合值
			group: "人品",
			des: "这个人思想品德十分高尚。",
			order: 0,
		},
		{
			name: "忠诚", //合意时屈从++,好意++, 非合意时反转
			group: "人品",
			des: "绝对不会主动背叛你。",
			order: 0,
		},

		{
			name: "两面三刀", // 非合意时屈从++，受辱++。
			group: "人品",
			des: "人前一套人后一套。",
			order: 0,
			sourceEffect: [
				["favo", 0.9],
				["angry", 1.1],
			],
		},
		{
			name: "变态", //解锁特定行动
			group: "人品",
			des: "喜好变态的性行为。",
			order: 0,
		},
		{
			name: "鬼畜", //解锁特定行动
			group: "人品",
			des: "喜好鬼畜的性行为。",
			order: 0,
		},
		{
			name: "高调", //特定指令需求更少配合值
			group: "行为",
			des: "还有谁不知道我？",
			order: 2,
		},
		{
			name: "低调", //特定指令需求更多或更少配合值
			group: "行为",
			des: "应该没人知道我吧……？",
			order: 0,
		},
		{
			name: "高自尊",
			group: "行为",
			des: "我是有尊严的人，钱也不能收买我。",
			order: -10,
		},
		{
			name: "无节操",
			group: "行为",
			des: "尊严又不能吃，只要给我钱，什么都能满足你。",
			order: 10,
		},
		{
			name: "贞洁", //欲情down, 非合意时抵触大幅up, 好意大幅down, 非正常play需求值++
			group: "行为",
			des: "性行为只能跟结婚对象做，而且必须得婚后。",
			order: 0,
			sourceEffect: [["lust", 0.9]],
		},
		{
			name: "放荡", //欲情up，好意很容易提升，非正常play需求值--
			group: "行为",
			des: "想做就做，没人可以约束我。",
			order: 5,
			sourceEffect: [
				["lust", 1.5],
				["favo", 1.5],
			],
		},

		//陷落系
		{
			name: "恋慕",
			group: "陷落",
			des: "喜欢但说不出口。",
			order: 10,
		},
		{
			name: "依恋",
			group: "陷落",
			des: "你不在身边会感到寂寞。",
			order: 20,
		},
		{
			name: "深爱",
			group: "陷落",
			des: "深爱着你。",
			order: 50,
		},
		{
			name: "三人行",
			group: "陷落",
			des: "同时与你们两人一起交往。",
			order: 30,
		},
		{
			name: "服从",
			group: "陷落",
			des: "是你忠实的下属。",
			order: 10,
		},
		{
			name: "隶属",
			group: "陷落",
			des: "是你忠诚的奴仆。",
			order: 20,
		},
		{
			name: "烙印",
			group: "陷落",
			des: "放弃自我，完全属于你。",
			order: 50,
		},
		{
			name: "炮友",
			group: "陷落",
			des: "是你的淫乱炮友。",
			order: 10,
		},
		{
			name: "情欲",
			group: "陷落",
			des: "对你萌生感情的炮友。",
			order: 20,
		},
		{
			name: "爱欲",
			group: "陷落",
			des: "完全离不开你的身体。",
			order: 50,
		},

		{
			name: "淫乱",
			group: "陷落",
			des: "很轻易的就能张开双腿。",
			order: 10,
		},
		{
			name: "淫荡",
			group: "陷落",
			des: "不仅淫乱还放荡。",
			order: 20,
		},
		{
			name: "淫魔",
			group: "陷落",
			des: "已经变成了以性为生以精液为食物的淫魔。",
			order: 50,
		},
	];

	let conflict = [
		["强壮", "纤弱"],
		["耐疼", "不耐疼"],
		["M倾向", "M体质"],
		["强欲", "淡漠"],
		["胆大", "胆小"],
		["乐观", "悲观"],
		["乖顺", "叛逆", "傲娇"],
		["性保守", "性开放", "禁欲", "放纵", "洁癖", "性瘾"],
		["变态", "高洁"],
		["鬼畜", "高洁"],
		["高调", "低调"],
		["高自尊", "无节操"],
		["高自尊", "厚脸皮"],
		["冲动", "忍耐"],
		["脆弱", "坚韧"],
		["贞洁", "放荡"],
		["忠诚", "善嫉"],
	];

	let loadjson = await getTraitJson();
	slog("log", `Get file list from json`, loadjson);
	if (loadjson) {
		list = list.concat(loadjson.list);
		conflict = conflict.concat(loadjson.conflict);
	}

	//add conflict to trait
	for (const cf of conflict) {
		for (const name of cf) {
			const trait = list.find((trait) => trait.name.includes(name));
			if (!trait) continue;

			if (!trait?.conflict) {
				trait.conflict = [];
			}

			trait.conflict = trait.conflict.concat(cf.delete(name));
			//remove duplicate
			trait.conflict = [...new Set(trait.conflict)];
		}
	}

	D.traits = D.traits.concat(list);
	Trait.init();
	InitTraitsConflict();
}

export async function getTraitJson() {
	let list: setTrait[] = [];
	let conflict: string[][] = [];

	const filesData: any[] | void = await getJson("./json/traits.json").then((res) => {
		slog("log", "Get file list from traits.json:", res);
		return res;
	});

	if (filesData) {
		filesData.forEach(([filename, trait]) => {
			slog("log", "Get traits from " + filename, trait);
			//if is conflict file
			if (filename.includes("conflict")) {
				//ensure is array
				if (!Array.isArray(trait)) {
					slog("warn", "Error: format error, skip this file. conflict file must be array:", trait);
				}
				conflict = conflict.concat(trait);
			}

			//if is trait file
			else if (Array.isArray(trait)) {
				if (trait.length === 0) {
					slog("warn", "Error: format error, skip this file. trait file must be array and not empty:", trait);
				}
				//ensure the format is correct
				if (trait[0].name && trait[0].group && trait[0].des) {
					list = list.concat(trait);
				} else {
					slog("warn", "Error: format error, skip this file:", trait);
				}
			}
		});
		slog("log", "Get all the list done:", list, conflict);
	}
	return { list, conflict };
}
