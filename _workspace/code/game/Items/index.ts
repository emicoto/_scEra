export * from "./Clothes";
export * from "./item";
export * from "./misc";

import { getJson } from "../function";
import { Clothes } from "./Clothes";
import { Items } from "./item";
import { Potion, SexToy, Recipies } from "./misc";
declare var Db: typeof window.Db;
declare function slog(type: string, ...args: any[]): void;

const itemGroup = ["weapon", "shield", "armor", "clothes", "accessory", "items", "material", "recipies", "books"];

itemGroup.forEach((group) => {
	Items.data[group] = new Map();
});

async function loadItems() {
	const filesdata = await getJson("./json/items.json").then((res) => {
		slog("log", "Items loaded:", res);
		return res;
	});

	if (filesdata) {
		filesdata.forEach(([filename, filedata]) => {
			filedata.forEach((data) => {
				const { name, group, category, type, des, tags, source, method } = data;
				const id = Items.newId(group, name, category);
				Db.Items[group].set(id, new Items(name, des, group, category));

				const idata = Db.Items[group].get(id);
				idata.type = type;
				idata.tags = tags;
				idata.source = {};
				if (source) {
					for (let i in source) {
						if (typeof source[i] === "number") {
							idata.source[i] = { v: source[i], m: method };
						} else {
							idata.source[i] = source[i];
						}
					}
				}
			});
		});
	}

	slog("log", "Items loaded:", Db.Items);
}

const modules = {
	name: "Items",
	version: "1.0.0",
	des: "A module for items system.",
	data: {
		itemGroup,
	},
	database: Items.data,
	classObj: {
		Items,
		Clothes,
		Potion,
		SexToy,
		Recipies,
	},
	func: {
		Init: {
			loadItems,
		},
	},
};

declare function addModule(modules): boolean;
addModule(modules);
