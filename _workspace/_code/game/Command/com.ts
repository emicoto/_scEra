import { Dict } from "../types";

declare var scEra: typeof window.scEra;
declare var T:typeof window.T;

export interface Com {
	id?: string;
	name?: string;
	time?: number;
	tags?: string[];
	filter: () => boolean;
	check: () => boolean;
	source: () => void;
	order: () => number;
	forceAble: boolean;
	alterName: (...args) => string;
}

export function InitComList() {
	const table: any = scEra.table.get("ComList") as any;
	for (let key of Object.keys(table)) {
		let list = table[key];
		list.forEach((obj) => {
			Com.new(obj.id, obj);
		});
	}
	console.log(Com.data);
}

export function InitComMacros() {
	//添加macro com
	Macro.add("com", {
		tags: null,
		handler: function () {
			let { contents, args } = this.payload[0];

			if (args.length === 0) {
				return this.error("no command text specified");
			}

			if (!T.comcount) T.comcount = 1;
			else T.comcount++;

			let comId = args[2];

			let output = `<div id='com_${T.comcount}' class='command'>
        <<button '${args[0]}'>>
        <<set $selectCom to '${comId}'>><<set $passtime to ${args[1]}>>
        ${contents}
        <</button>>
        </div>`;

			if (Config.debug) console.log(output);

			jQuery(this.output).wiki(output);
		},
	});
}

//era classic command system
export class Com {
	public static data: Dict<Com>;
	//add new command
	static new(id, obj) {
		Com.data[id] = new Com(obj);
		return Com.data[id];
	}
	//get command
	static set(id, time) {
		if (time) {
			return Com.data[id].Set("time", time);
		} else {
			return Com.data[id];
		}
	}

	//build command
	constructor(type, obj = {} as any) {
		const { id = "error", name = "error", tags = [], time = 5 } = obj;
		this.id = id;
		this.name = name;
		this.tags = [type];
		//passtime
		this.time = time;

		if (tags.length) this.tags = this.tags.concat(tags);

		const ignore = ["id", "name", "tags", "time"];
		for (let key in obj) {
			if (ignore.includes(key)) continue;
			this[key] = obj[key];
		}

		this.filter = () => {
			return true;
		};

		//check condition
		this.check = () => {
			return true;
		};
		//effect source
		this.source = () => {};

		//cooperation order
		this.order = () => {
			return 0;
		};
	}
	Check(callback) {
		this.check = callback;
		return this;
	}
	Filter(callback) {
		this.filter = callback;
		return this;
	}
	Effect(callback) {
		this.source = callback;
		return this;
	}
	Tags(...arr) {
		if (!this.tags) this.tags = [];

		this.tags = this.tags.concat(arr);
		//remove duplicate
		this.tags = [...new Set(this.tags)];
		return this;
	}
	Order(callback) {
		this.order = callback;
		//录入reason同时返回order值
		return this;
	}
	//动态设置指令名
	AlterName(callback) {
		this.alterName = callback;
		return this;
	}
	//即使配合度不足也可能强行执行。
	ForceAble() {
		this.forceAble = true;
		return this;
	}
	Set(key, ...args) {
		this[key] = args[0];
		return this;
	}
}

Com.data = {};
