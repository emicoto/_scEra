import { Items } from "./item";
import { potionType } from "../types";

declare var Db: typeof window.Db;

export interface Recipies {
	//合成配方
	id: string; //合成配方id
	resultItemId: string; //合成结果物品id
	result: number; //合成结果数量

	requireLv: number; //需求最低技能等级
	require: string[]; //合成所需物品

	byproduct?: Array<[string, number]>; //副产物
	byproductChance?: number; //副产物出现几率

	failProduct?: Array<[string, number]>; //失败产物

	rate: number; //合成成功率
}

export class Recipies {
	public static new(id, obj) {
		Db.Items["recipies"].set(id, new Recipies(obj));
	}
	public static getByName(itemname: string) {
		const itemId = Items.getByName("items", itemname).id;
		return Array.from(Db.Items["Recipies"]).find((recipie: Recipies) => recipie.resultItemId === itemId);
	}
	public static getBySrcName(itemname: string) {
		const itemId = Items.getByName("items", itemname).id;
		return Array.from(Db.Items["Recipies"]).find((recipie: Recipies) => recipie.require.includes(itemId));
	}
	constructor(obj = {} as any) {
		const { itemId, result, require, rate } = obj;

		this.id = Db.Items["Recipies"].size;
		this.resultItemId = itemId;
		this.result = result;
		this.require = require;
		this.rate = rate;
	}
	set(key, value) {
		this[key] = value;
		return this;
	}
}

export interface Potion extends Items {
	group: "items";
	category: "potion";
	type: potionType;

	daily?: number; //每日有效使用次数
	lifetime?: number; //终生有效使用次数
	effectsDecrease?: number; //每次使用后效果减少的百分比
	specialEffects?: string; //特殊效果
}

export interface SexToy extends Items {
	group: "accessory";
	category: "sextoy";

	switch?: boolean; //开关状态
	switchable?: boolean; //是否可开关
	specialEffects?: string; //特殊效果
}

export class Potion extends Items {
	constructor(obj = {} as any) {
		const { name, des, type } = obj;
		super({ name, des, group: "items", category: "potion" } as Items);
		this.type = type;
	}
	Daily(num: number) {
		this.daily = num;
		return this;
	}
	Lifetime(num: number) {
		this.lifetime = num;
		return this;
	}
	EffectsDecrease(num: number) {
		this.effectsDecrease = num;
		return this;
	}
	SpecialEffects(str: string) {
		this.specialEffects = str;
		return this;
	}
}

export class SexToy extends Items {
	constructor(obj = {} as any) {
		const { name, des } = obj;
		super({ name, des, group: "accessory", category: "sextoy" } as Items);
	}
	Switchable() {
		this.switchable = true;
		return this;
	}
	SpecialEffects(str: string) {
		this.specialEffects = str;
		return this;
	}
}
