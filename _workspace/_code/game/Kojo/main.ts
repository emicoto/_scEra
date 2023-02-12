import { Dict, wearlayers } from "../types";
declare var C: typeof window.C;
declare var T: typeof window.T;
declare var V: typeof window.V;
declare var P: typeof window.P;

interface schedule {
	location: string;
	weekday: string | number[];
	starthour: number;
	endhour: number;
	rate: number;
	stayhour?: number;
	action?: string;
}
interface customAction {
	id: string; // action id
	name: string; // display name
	type?: string; // action type, default is "Interact"
	tags?: string[]; // optional, require location tags
	placement?: string[]; // optional, require placement
	setting?: string | string[]; // optiona, action tag, and setting tag, default is "Kojo"
	actPart?: string[]; // optional, which part of the body will be used to interact with the target
	targetPart?: string[]; // optional, which part to interact with
}

interface charaEvent {
	id: string; // event id
	title: string; // event title for display at memory
	config?: any; // event config, can be used to store any flags will changed after the event
	cond?: (arg, ...args) => boolean; // event condition, return true to trigger the event
	branch?: string[]; //optional, event branch, can be used to create a event tree
	branchCond?: (arg, ...args) => string | void; // optional, branch condition, return the branch id to trigger the branch
}

type preset = Array<[wearlayers, string]>;

export interface Kojo {
	id: string;
	color?: string;
	intro?: string[]; // CN, En, etc, any supported language
	schedule?: Array<[string, schedule]>; // chara schedule
	preset?: Array<[string, preset]>; // clothing preset.
	filter?: (arg, ...args) => 0 | 1; // action filter function, return 0 to disable the action, return 1 to enable the action
	action?: Array<customAction>; // custom action
	event?: Array<charaEvent>; // chara event
	home?: string; // home location
	relation?: Dict<[string, number]>; // relation with other chara,
	counter?: Array<any>; // counter action. same as action, but will be triggered by counter
	sleeptime?: number; // sleep time, default 22
	wakeuptime?: number; // wake up time, default 6
}
/**
 * @name Kojo
 * @description
 * Kojo class, used to create character event and chara custom action, etc.
 * any kojo data will be stored in Kojo.data, use Kojo.set to create a new kojo data, then can use chain method to set the data.
 * @example
 * Kojo.set("kojo1", "red").intro("intro text").schedule('stay',  "home", 'all', 18, 6).preset("presetname", [ 'outfit_up','shirt1'] ,['outfit_bt',"skirt1"])
 */

export class Kojo {
	static data: Dict<Kojo> = {};
	/**
	 * @name Kojo.set
	 * @description
	 * create a new kojo data and set the kojo data
	 * @example
	 * Kojo.set("kojo1", "red").intro("intro text").home('home')
	 */
	static set(id: string, color: string) {
		let data = Kojo.data;
		if (!data[id]) data[id] = new Kojo(id, color);
		return data[id];
	}
	/**
	 * @name Kojo.get
	 * @description
	 * get kojo data
	 * @example
	 * Kojo.get("kojo1") // return kojo data
	 * @example
	 * Kojo.get("kojo1", "intro") // return kojo intro
	 */
	static get(cid: string, type?: string) {
		if (!cid) return;
		//当角色口上与角色id不一致时
		//when the cid is not the same as kojo id
		if (C[cid].kojo !== cid) cid = C[cid].kojo;

		let data = Kojo.data[cid];
		if (!data) return;
		return type ? data[type] : data;
	}

	/**
	 * @name Kojo.title
	 * @description
	 * combine kojo id, type, id and dif to a title
	 * @example
	 * Kojo.title('Nanaly',"Action", "talk") // return "Kojo_Nanaly_Action_talk"
	 */

	static title(cid, type, id, dif = "") {
		if (!cid) return;
		if (["Before", "After", "Cancel", "Keep", "Failed", "Force"].includes(dif)) {
			dif = ":" + dif;
		} else if (dif) {
			dif = "_" + dif;
		}
		//如果使用口上与id不一致，则覆盖。大概是随机NPC会不一样吧。
		//if the cid is not the same as kojo, then use the kojo id
		//maybe for random NPC
		if (C[cid].kojo !== cid) {
			cid = C[cid].kojo;
		}

		if (id) {
			id = `_${id}`;
		}

		return `Kojo_${cid}_${type}${id}${dif}`;
	}

	//check default
	static default(type: string, id: string, dif = "", check?) {
		let head = "Msg_" + type;

		if (!type.has("Action")) {
			head = type;
		}
		if (id) {
			id = `_${id}`;
		}
		if (dif) dif = `:${dif}`;

		let title = `${head}${id}${dif}`;

		if (check) {
			return Story.has(title);
		}

		return Story.has(title) ? Story.get(title) : "";
	}

	/**
	 * @name Kojo.has
	 * @description
	 * check if the kojo data has the title
	 * the check flag is used to check if has the default msg title
	 * @example
	 * Kojo.has("charaID", {type:"Com", id:"Talk"}) // return true or false
	 *
	 */
	static has(cid, { type, id = "", dif = "", check }) {
		let title = Kojo.title(cid, type, id, dif);
		if (dif) {
			dif = `:${dif}`;
		}

		if (type == "custom") {
			title = `Msg_${id}${dif}`;
		}
		if (!title) return;
		//if not found the title, then try to find the default one
		if (check && !Story.has(title)) {
			return this.default(type, id, dif, true);
		}
		return Story.has(title);
	}
	/**
	 * @name Kojo.put
	 * @description
	 * put the kojo text to the dialog flow
	 * @example
	 * Kojo.put("charaID", {type:"Com", id:"Talk"}) // return the story passage text from :: Kojo_CharaID_Com_Talk
	 */
	static put(cid, { type, id, dif, noTag }: any) {
		let title = Kojo.title(cid, type, id, dif);

		if (dif) {
			dif = `:${dif}`;
		}
		if (type == "custom") {
			title = `Msg_${id}${dif}`;
		}
		if (!title) return;

		let retext: any = "";

		T.noMsg = 0;

		if (Story.has(title)) {
			retext = Story.get(title);
		}

		if (cid == V.pc && type == "PCAction" && !V.system.showPCKojo) {
			retext = "";
		}

		if (!retext) {
			retext = this.default(type, id, dif) || "";
		}

		//如果是空模板，直接返回无内容
		if (!retext || retext.tags.has("noMsg")) {
			T.noMsg = 1;
			return "";
		}

		//计算有效文本长度;
		//console.log(title, retext.text);
		let txt = checkTxtWithCode(retext.text);
		//console.log(title, txt, txt.length);

		//有内容的话长度怎么也不会少于2字吧
		if (txt.length > 1) {
			retext = retext.text;

			let matcher = [`<<nameTag '${cid}'>>`, `<<nameTag "${cid}">>`];

			if (!retext.has(matcher) && !noTag) {
				retext = `<<nameTag '${cid}'>>` + retext;
			}

			if (cid == V.pc) T.noNameTag = 1;
			else T.noNameTag = 0;

			if (!noTag) retext += "<<dashline>>";

			return retext;
		}

		T.noMsg = 1;

		return "";
	}

	constructor(id, color = "#22A0FC") {
		this.id = id;
		this.color = color;
		this.intro = [];
		this.schedule = [];
		this.preset = [];
		this.filter = () => {
			return 1;
		};
		this.action = [];
		this.event = [];
		this.home = "void";
		this.relation = {};
		this.counter = [];
	}
	Intro(str) {
		this.intro = str;
		return this;
	}
	/**
	 * @name Kojo.Schedule
	 * @description
	 * set the schedule for the character.
	 * the action is the action name, like "stay", "go", "work", "sleep", "eat", "shop", "visit", "custom"
	 * the list is the parameters for the schedule, the input order is location, weekday, starthour, endhour, stayhour, rate
	 * the weekday is the day of the week, like [1,2,3] means Monday, Tuesday, Wednesday, the "all" means all the week
	 *
	 * @example
	 * Kojo.Schedule("stay", "home", "all", 8, 18, 10, 80) // the character will stay at home from 8am to 6pm, and the rate is 80
	 * if the stayhour is not set, then the stayhour will be the same as the endhour - starthour
	 * if the rate is not set, then the rate will be 80
	 *
	 */
	Schedule(action: string = "stay", ...list: any) {
		if (list.length == 1 && list[0] instanceof Array) list = list[0];
		if (!list[0]) return this;
		const schedule: schedule = {
			location: list[0],
			weekday: list[1] || "all",
			starthour: list[2],
			endhour: list[3],
			stayhour: list[4] || list[3] - list[2],
			rate: list[5] || 80,
		};
		this.schedule.push([action, schedule]);
		return this;
	}
	Filter(cond) {
		this.filter = cond;
		return this;
	}
	/**
	 * @name Kojo.Action
	 * @description
	 * set the custom action for the character
	 * @example
	 * Kojo.Action({ id:'Research', name:'研究', type:'General'})
	 * @example
	 * Kojo.Action({ id:'KissNekoMimi', name:'亲亲猫耳', type:'Touch', actPart:'mouth', targetPart:'ears'})
	 */
	Action(obj: customAction) {
		this.action.push(obj);
		return this;
	}
	/**
	 * @name Kojo.Event
	 * @description
	 * set the custom event for the character
	 * @example
	 * Kojo.Event({ id:'CookFirstTry', title:'Nanaly - The First Try of Cooking', cond:()=>{return C['Nanalu'].tsv.lastAction == 'Cooking' && C['Nanaly'].exp.cook == 1 } })
	 */
	Event(obj: charaEvent) {
		this.event.push(obj);
		return this;
	}
	Home(str) {
		this.home = str;
		return this;
	}
	/**
	 * @name Kojo.Relation
	 * @description
	 * set the relation between the character and other character
	 * @example
	 * Kojo.Relation('Mia', 'best friend', 100)
	 * @example
	 * Kojo.Relation('Jennifer', 'hate', -100)
	 */
	Relation(id, des, val) {
		this.relation[id] = [val, des];
		return this;
	}
	/**
	 * @name Kojo.Counter
	 * @description
	 * set the counter action for the character
	 * is same as Kojo.Action
	 */
	Counter(obj: customAction) {
		this.counter.push(obj);
		return this;
	}
	SleepTime(time) {
		this.sleeptime = time * 60;
		return this;
	}
	WakeupTime(time) {
		this.wakeuptime = time * 60;
		return this;
	}
	/**
	 * @name Kojo.Preset
	 * @description
	 * set the clothes preset for the character.
	 * if the preset is exist, will update it.
	 * @example
	 * Kojo.Preset('swimwear', ['innerUp', 'swimwear'], ['innerBt', 'swimwear'], ['feet', 'sandals']).Preset('swimwear', ['outfitUp', 'none'], ['outfitBt', 'none'])
	 *
	 * then it should be like this in the database:
	 * ['swimwear', [['innerUp', 'swimwear'], ['innerBt', 'swimwear'], ['feet', 'sandals'], ['outfitUp', 'none'], ['outfitBt', 'none']]
	 */
	Preset(name: string, ...objs: Array<[wearlayers, string]>) {
		let p;

		//find the preset by name, if not found, then create a new one
		//if arleady has the same name, then update it
		if (this.preset.length) {
			p = this.preset.find((p) => p[0] == name);
		}
		if (p) {
			//remove the old item if the wearlayer is the same
			//then keep the new one
			objs.forEach((o) => {
				const i = p[1].findIndex((i) => i[0] == o[0]);
				if (i != -1) {
					p[1].splice(i, 1);
				}
			});
			p[1].push(...objs);
		} else {
			this.preset.push([name, objs]);
		}
		return this;
	}
}

/**
 * @name convertKojo
 * @description
 * find the kojo.put in the twine code, and convert it to js code
 * then get the result text and replace the original text
 * @example
 * <<=Kojo.put(C['Nanalu'].tsv.lastAction)>>
 *  //will be converted to
 *  Kojo.put(C['Nanalu'].tsv.lastAction)
 *  then run the Kojo.put function get the result text
 *
 *  this is used during the Action or Com system running. if the event text includes the kojo.put, then it will need to convert and get the kojo text to count and show.
 */

export const convertKojo = function (txt) {
	if (!txt.includes("<<=Kojo.put")) return txt;

	console.log("find kojo?");

	const match = txt.match(/<<=Kojo.put(.+?)>>/g);
	match.forEach((p) => {
		const t = p.match(/<<=Kojo.put\((.+?)\)>>/);
		const code = t[0].replace("<<=", "").replace(">>", "");

		//然后直接eval
		console.log(code);

		txt = txt.replace(p, eval(code));
	});
	``;
	return txt;
};

//将sugarcube的条件式转换为js后，再根据条件检查有效文本长度
//this is used to check the valid text length after the sugarcube condition code is converted to js code
//if the condition is true, then the text length will be added
//this is for how to show the text. if the length is 0 or less than 2, then the dialog system will skip it.
//if the length is more than 4, then the dialog system will create a new bubble to show the text.
export const checkTxtWithCode = function (text) {
	//清理注释并按行分割
	const raw = text.replace(/\/\*(.+)\*\//g, "").split(/\n/);
	const condition = [];
	const retext = [];
	let count = 0;

	raw.forEach((txt) => {
		if (
			txt.match(/<<if(.+)>>/) ||
			txt.match(/<<else(.+)>>/) ||
			txt.match(/<<case(.+)>>/) ||
			txt.match(/switch/) ||
			txt.match(/<<else>>/) ||
			txt.match(/<<default>>/)
		) {
			let code = txt.match(/<<(.+)>>/)[1];
			count++;
			condition[count] = code;
		} else if (!count) {
			retext[1000] += txt;
		} else {
			if (retext[count] === undefined) retext[count] = "";
			retext[count] += txt;
		}
	});

	if (condition.length === 0) return P.countText(text);

	let isSwitch,
		switchcond,
		code,
		result = "";

	//console.log(condition, retext);

	condition.forEach((con, i) => {
		if (con.includes("switch")) {
			isSwitch = true;
			switchcond = `${con.replace(/switch/g, "")} ===`;
		}
		if (con.includes("if")) isSwitch = false;

		if (isSwitch && con.includes("case")) {
			code = `${switchcond} ${con.replace(/case/g, "")}`;
			if (eval(code)) {
				result += P.countText(retext[i]);
			}
			retext[i] = "";
		} else if (!isSwitch && con.includes("if")) {
			code = con
				.replace(/elseif/g, "")
				.replace(/if/g, "")
				.replace(/is/g, "==")
				.replace(/isnot/g, "!=")
				.replace(/lte/g, "<=")
				.replace(/gte/g, ">=")
				.replace(/lt/g, "<")
				.replace(/gt/g, ">")
				.replace(/and/g, "&&")
				.replace(/or/g, "||")
				.replace(/\$/g, "V.")
				.replace(/_/g, "T.");

			if (eval(code)) {
				result += P.countText(retext[i]);
			}
			retext[i] = "";
		}
	});

	let txt = P.countText(retext.join(""));
	return result + txt;
};

//--------------------------------------------------
// clean the comment and code
// then count the valid text length
//--------------------------------------------------
export const countText = function (text: string) {
	//clean the comment
	text = P.clearComment(text);

	const regExp = [
		/<script[\s\S]*?<\/script>/g,
		/<<run[\s\S]*?>>/g,
		/<<if(.+)>>/g,
		/<<else(.+)>>/g,
		/<<\/(.+)>>/g,
		/<<switch(.+)>>/g,
		/<<case(.+)>>/g,
		/<<select(.+)>>/g,
		/<<replace(.+)>>/g,
		/<<set(.+)>>/g,
		/<br>/g,
		/<<else>>/g,
		/<<default>>/g,
		/<fr>/g,
	];

	regExp.forEach((reg) => {
		text = text.replace(reg, "");
	});

	if (Config.debug) console.log(text);

	return text.length;
};
