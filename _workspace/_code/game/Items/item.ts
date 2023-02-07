import {
	ItemStats,
	ItemPalam,
	itemEffectType,
	ItemGroup,
	materialType,
	accesoryType,
	potionType,
	weaponType,
	clothcategory,
	ItemCategory,
	shop,
	statskey,
	basekey,
	itemMethod,
	palamkey,
	rarity,
} from "../types";

declare var Db: typeof window.Db;
declare var D: typeof window.D;

export interface Items {
	id: string; //在库中所登记的id

	name: [string, string?]; //中文名，英文名。英文名可选，若无则为中文名
	des: [string, string?]; //中文描述，英文描述。英文描述可选，若无则为中文描述
	group: ItemGroup; //物品组

	rarity?: rarity; //稀有度

	category?: ItemCategory | materialType | accesoryType | potionType | weaponType | clothcategory; //物品类型
	type?: string; //物品分类
	tags?: string[]; //物品标签
	shop?: shop[]; //入手途径或商店种类

	price?: number; //物品价格
	durable?: [number, number]; //耐久度，最大耐久度

	stats?: ItemStats; //物品对个属性的影响
	source?: ItemPalam; //物品对各个状态条的影响
	method?: itemEffectType; //影响方法
}

export class Items {
	public static data: Items[];
	public static newId(group: string, name: string, cate?: string) {
		if (cate) {
			return `${cate}_${name[1].replace(/\s/g, "") || name[0]}`;
		} else {
			return `${group}_${name[1] || name[0]}`;
		}
	}
	public static getByName(group: ItemGroup, name: string): Items | undefined {
		return Array.from(Db.Items[group]).find(
			(item: Items) => item[1].name[0] === name || item[1].name[1] === name
		) as Items;
	}
	public static getTypelist(
		group: ItemGroup,
		cate: ItemCategory | materialType | accesoryType | potionType | weaponType | clothcategory
	): Items[] | undefined {
		return Array.from(Db[group]).filter((item: Items) => item[1].category === cate) as Items[];
	}
	public static get(Itemid): Items | undefined {
		const itemGroup = Itemid.split("_")[0];
		return Array.from(Db.Items[itemGroup]).find((item: Items) => item[0] === Itemid) as Items;
	}
	constructor(obj = {} as Items) {
		const { group, category } = obj;
		this.id = Items.newId(group, category);
		for (let key in obj) {
			if (key == "sourceMethod" || key == "source") {
				continue;
			}
			this[key] = obj[key];
		}
	}
	Price(num: number) {
		this.price = num;
		return this;
	}
	Durable(num: number) {
		this.durable = [num, num];
		return this;
	}
	Shop(...shops: shop[]) {
		this.shop = shops;
		return this;
	}
	Tags(...tags: string[]) {
		this.tags = tags;
		return this;
	}

	Stats(...stats: Array<[statskey, number]>) {
		stats.forEach(([key, add]) => {
			this.stats[key] = add;
		});
		return this;
	}
	Source(...palam: Array<[palamkey | basekey, itemMethod, number]>) {
		palam.forEach(([key, m, v]) => {
			this.source[key] = { m, v };
		});
		return this;
	}
	Method(method: itemEffectType) {
		this.method = method;
		return this;
	}
}

Items.data = [];
