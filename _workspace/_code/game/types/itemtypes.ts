import { Dict, statskey, basekey, palamkey } from ".";

export type ItemGroup =
	| "weapon" //武器
	| "shield" //盾牌或护盾
	| "armor" //盔甲
	| "clothes" //衣服
	| "accessory" //饰品
	| "items" //道具物品
	| "material" //纯素材
   | 'books' //书籍

export type ItemCategory = "foods" | "potion" | "drink" | "drug" | "misc" | "";

export type materialType = "metal" | "wood" | "stone" | "leather" | "cloth" | "herb" | "gem" | "other";

export type accesoryType = "facemask" | "glasses" | "earring" | "chest" | "sextoy";

export type potionType = "heal" | "restore" | "buff" | "debuff" | "misc";

export type weaponType = "sword" | "gun" | "bow" | "staff" | "hammer" | "spear";

export type shieldType = "shield" | "guard";

export type ItemTags = "consumable" | "craftable" | "wrapable" | "sweet" | "";


//各物品对个属性的影响。正数为加，负数为减，0为不变
//v为影响值，m为影响方法。add为加，mul为乘，fix为固定值
export type ItemStats = Dict<number, statskey>;
export type ItemPalam = Dict<itemEffect, basekey | palamkey>;

export type itemEffect = { v: number; m: itemMethod };
export type itemMethod = "add" | "mul" | "fix";
export type itemEffectType = "recover" | "sustain" | "onetime" | "change" | "fix" | "permanent";