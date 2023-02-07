import { Items } from "./item";
import {clothcategory, shop, gender, clothtags, coverparts} from '../types'

export interface Clothes extends Items {
	id: string; //在库中所登记的id,
	uid?: string; //购买时生成的绝对id，6位数字
	group: "clothes"; //物品组
	category: clothcategory;

	name: [string, string?];
	des: [string, string?];
	shop: shop[];

	gender: gender;
	tags: clothtags[];

	color: [string?, string?]; //默认色,颜色名字
	cover: coverparts[]; //覆盖部位

	expose: 0 | 1 | 2 | 3; //暴露度。0=无，1=若隐若现 2=看的清除但有阻隔 3=完全暴露
	open: 0 | 1 | 2 | 3; //开口。 0=必须脱下，1=敏感区附近有纽扣or纽带可解开，2=敏感区附近有开口 3=完全暴露

	allure: number; //魅力加值，乘数, 范围在 +0.05-0.5 之间
	defence: number; //防御加值，加数, 范围在 0-6 之间

	cursed?: 0 | 1; //是否诅咒物品。如果是则无法脱下

	img?: string[]; //图片路径。如果有多个图片，第一个为默认图片，后面的为变化差分
}

export class Clothes extends Items {
	constructor(cate: clothcategory, name: [string, string?], des: [string, string?], gender: gender = "n") {
		super(name, des, "clothes", cate);
		this.gender = gender;
		this.uid = "0";

		this.tags = [];
		this.price = 0;
		this.color = [];
		this.cover = [];

		this.expose = 3;
		this.open = 3;

		this.allure = 0;
		this.defence = 0;
	}
	UID() {
		this.uid = random(100000, 999999).toString();
		return this;
	}
	Color(colorcode: string, colorname: string) {
		this.color = [colorcode, colorname];
		return this;
	}
	Cover(...parts: coverparts[]) {
		this.cover = parts;
		return this;
	}
	Set(key, value) {
		this[key] = value;
		return this;
	}
}