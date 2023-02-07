import { Items } from "./item";
import { potionType } from "../types";

declare var Db: typeof window.Db;
declare var D: typeof window.D;


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
	public static new(id, { resultItemId, result, require, rate }) {
		Db.Items['recipies'].set(id, new Recipies(resultItemId, result, require, rate));
	}
	public static getByName(itemname: string) {
		const itemId = Items.getByName("items", itemname).id;
		return Array.from(Db.Items['Recipies']).find((recipie: Recipies) => recipie.resultItemId === itemId);
	}
	public static getBySrcName(itemname: string) {
		const itemId = Items.getByName("items", itemname).id;
		return Array.from(Db.Items['Recipies']).find((recipie: Recipies) => recipie.require.includes(itemId));
	}
	constructor(itemId: string, result: number, requires: string[], rate: number) {
		this.id = Db.Items['Recipies'].size;
		this.resultItemId = itemId;
		this.result = result;
		this.require = requires;
		this.rate = rate;
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
	constructor(name: [string, string?], des: [string, string?], type: potionType) {
		super(name, des, "items", "potion");
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
	constructor(name: [string, string?], des: [string, string?]) {
		super(name, des, "accessory", "sextoy");
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