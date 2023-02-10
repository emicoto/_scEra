import { Dict } from "../types";

declare function now(): string;

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

//era classic command system
export class Com {
	public static data: Dict<Com>;
	//add new command
	static new(key, obj) {
		Com.data[obj.id] = new Com(key, obj);
		return Com.data[obj.id];
	}
	//get command
	static set(id, time) {
		if (!Com.data[id]) {
			return console.log(`[error] ${now()} | no such command`);
		}
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
