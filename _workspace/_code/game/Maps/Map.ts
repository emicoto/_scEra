import { GenerateMap } from "./MapUtils";
import { Dict, maptype, maptags, rarity, dirside, spotType, tileType, boardtype, iPos, iSpotsInfo } from "../types";

//-----------------------------------------------------
//  declare zone
//-----------------------------------------------------
declare var worldMap: typeof window.worldMap;
declare var Config: typeof window.Config;
declare var S: typeof window.S;
declare var D: typeof window.D;

//-----------------------------------------------------
//  Class Interface
//-----------------------------------------------------
export interface GameMap {
	boardId: string; //所属棋盘的id
	id: string; //绝对id

	mapType: maptype; //地图类型
	tags: maptags[]; //地图标签

	name?: string[]; //地图中英文名字
	events?: Function; //地图事件
	staticNPC?: Function; //固有NPC
	portal?: {
		//传送点
		exist: boolean;
		points: Array<iPos | string>;
	};
}

//地图格子数据
export interface squareData {
	p: string; //display pattern /显示的图片or文字
	t: tileType | string; //tile type/ 地形类型
	enemy: string[]; //在这个点上的敌人
	loot: string[]; //在这个点上的物品
	visit: number; //被访问的次数
	able: 0 | 1; //is to be passable / 是否可以通过
}

export interface Boards extends GameMap {
	boardType?: boardtype; //地图板块类型
	staticEntry: string; //固定入口
	entries?: string[]; //其他入口

	loot?: Dict<string[], rarity>; //地图掉落
	hunt?: string[]; //狩猎
	enemy?: string[]; //敌人群组

	spots?: Map<string, iSpotsInfo>; //各个地点信息
	mapsize?: iPos; //地图大小
	mapdata?: any; //地图数据
}

export interface FieldMap extends Boards {
	minlevel?: number; //怪物最低等级
	maxLevel?: number; //怪物最高等级

	boss?: string[]; //boss
	floor?: number; //层数
	floors?: Map<number, FieldMap>; //各层地图
	master?: string; //领域之主
}
export interface Spots extends GameMap {
	spotId: string; //所属地点格子的id

	rooms?: string[]; //房间id
	locked?: boolean; //是否上锁
	openhour?: {
		//开放时间
		weekday: number[] | "allday";
		open: number;
		close: number;
	};
	Home?: boolean; //你的家？
	hasParking?: boolean; //有无停靠区
	hasRailcar?: boolean; //有无轨道车
	hasAirship?: boolean; //有无飞艇
	placement?: string[]; //放置物
	roomId: string; //房间id
	owner?: string[]; //房主
	rent?: number; //租金
	visitCond?: Function; //访问条件
	maxslot?: number; //最大容量

	loot?: Dict<string[], rarity>; //地点掉落
	spotType?: spotType; //地点类型
}

export interface DungeonRooms extends Spots {
	roomtype?: string; //房间类型

	enemy?: string[]; //敌人群组
	hunt?: string[]; //狩猎
	treasure?: string[]; //宝箱
	puzzle?: string[]; //谜题
}

//-----------------------------------------------------
//  Class GameMap
//-----------------------------------------------------
export class GameMap {
	constructor([boardId, id, name]: [string, string, string[]]) {
		this.boardId = boardId;
		this.id = boardId !== "" ? `${boardId}.${id}` : id;
		this.name = name;
		this.tags = [];

		this.events = function () {
			return "";
		};
	}
	//连chain中需要修正名字时用
	setName(name) {
		this.name = name;
		return this;
	}
	//设置地图事件
	Events(callback) {
		this.events = callback;
		return this;
	}
	//设置地图标签
	Tags(...tags: maptags[]) {
		if (Config.debug) console.log("Try to set tags: ", tags, " to map: ", this.id, "");

		this.tags = this.tags.concat(tags);
		//去重复
		this.tags = [...new Set(this.tags)];

		if (Config.debug) console.log("Tags set to map: ", this.id, " successfully! Tags: ", this.tags, "");
		return this;
	}
	//获取父级id
	getParentId() {
		if (!this.boardId || this.boardId === this.id) {
			if (Config.debug) console.log("No parent id found for map: ", this.id, " !");
			return this.boardId;
		}

		if (Config.debug) console.log("Try to get parent id for map: ", this.id, " ...");
		const path = this.id.split(".");
		path.pop();
		return path.join(".");
	}
	//获取父级地图数据
	getParent() {
		if (!this.boardId || this.boardId === this.id) {
			return null;
		}
		const id = this.getParentId();
		return GameMap.get(id); //返回父级
	}
	//设置传送点
	setPortal(...points: Array<iPos>) {
		this.portal = {
			exist: true,
			points: points,
		};
		return this;
	}
	//添加传送点
	addPortal(...points: Array<string | iPos>) {
		this.portal.points.push(...points);
		return this;
	}

	//通过路径获取地图数据
	public static get(mapId: string) {
		if (Config.debug) console.log("Try to get Mapdata:", mapId);

		let path = mapId.split(".");
		let map = worldMap;
		for (let i = 0; i < path.length; i++) {
			try {
				map = map[path[i]];
			} catch (err) {
				console.log("Catch an error on get Mapdata:", mapId, path, err);
				return null;
			}
		}
		return map as unknown as Boards | Spots | DungeonRooms | FieldMap;
	}

	//通过类型获取地图数据
	public static getBy(type, mapdId, ...args) {
		if (Config.debug) console.log("Try to get Mapdata by type:", type, mapdId, args);

		const data = this.get(mapdId);
		if (!data) return null;
		if (type == "pos") {
			return data.spots.get(args[0]).pos;
		}
		if (type == "spots") {
			return data.spots.get(args[0]);
		}
		if (type == "rooms" && data.rooms) {
			return data.rooms;
		}
		if (data[type]) {
			return data[type];
		}
		console.log("Catch an error on get Mapdata by type:", type, mapdId, args);
		return null;
	}

	//获取父级组
	public static getParentGroup(type, boardId) {
		if (Config.debug) console.log("Try to get parent group:", type, boardId);

		if (!boardId) {
			console.log("No boardId!");
			return null;
		}

		let parent = worldMap;
		let path = boardId.split(".");
		//记录符合条件的父级，返回最后一个
		let parentlist = [];

		for (let i = 0; i < path.length; i++) {
			try {
				parent = parent[path[i]];
				if (parent.mapType === type) {
					parentlist.push(parent);
				}
			} catch (err) {
				console.log("The parent map is not found", path, i, path[i], err);
			}
		}

		if (parentlist.length === 0 && boardId !== "CommonSpots") {
			console.log("The parent map is not found", path, type, boardId);
			return null;
		} else if (boardId === "CommonSpots") {
			if (Config.debug) console.log("CommonSpots has no parent", boardId);
			return null;
		}

		if (Config.debug) console.log("Get parent group:", type, boardId, parentlist[parentlist.length - 1]);

		return parentlist[parentlist.length - 1];
	}

	//获取地图棋盘数据
	public static getBoard(mapId) {
		if (Config.debug) console.log("Try to get board:", mapId);

		const data = this.get(mapId);
		if (!data) {
			console.log("Catch error when getBoard. The mapdata doesn't exist:", mapId);
			return null;
		}
		if (data.mapType !== "board") {
			console.log("Catch error when getBoard. The mapdata type isnot board:", mapId);
			return null;
		}
		if (!data.mapdata) {
			console.log("Cathc error when getBoard. The mapdata has not inilization yet:", mapId);
			return null;
		}
		return mapdataToBoard(data.mapdata, data.mapsize.x, data.mapsize.y);
	}

	//将棋盘数据转换为地图数据
	public static convertData(mapdata: string[][]) {
		return boardToMapdata(mapdata);
	}

	//在控制台打印地图数据
	public static console(map: string[][]) {
		printMap(map);
	}

	//复制地图数据
	public static copy(map, boardId, mapId) {
		if (Config.debug) console.log("Try to copy mapdata:", map, boardId, mapId);

		let newMap, parent;
		if (map.mapType === "board") {
			newMap = new Boards(boardId, mapId, { type: map.boardType }, map);
			parent = this.getParentGroup("board", boardId);
		} else if (map.mapType === "spot" || map.mapType === "room") {
			newMap = new Spots([boardId, mapId, map.name, map.spotType], map);
			parent = this.getParentGroup("spot", boardId);
		} else {
			console.log("Catch error when copy mapdata. The type of map doesn't support to be copy:", map);
		}

		if (parent) {
			newMap.boardId = parent.boardId;
			newMap.spotId = parent.id;
		} else {
			newMap.boardId = boardId;
		}
		newMap.id = boardId + "." + mapId;

		return newMap;
	}
}

//-------------------->> Square  <<--------------------
// a function to create "class" Square

export function Square(p: string = "", t: string = "blank", able: number = 0) {
	this.p = p;
	this.t = t;
	this.visit = 0;
	this.able = able;

	this.set = function (key, values) {
		this[key] = values;
	};
}

//-------------------->> Boards <<-------------------------------
//  棋盘地图类
//  因为地图的构造是棋盘式的，所以命名为Boards
//-------------------->> Boards <<-------------------------------

/**
 * @name Boards
 * @description A class to create a map.
 * Because the map is constructed in a chessboard style, so named Boards.
 * The top level of the map is the board, the square is mean every square of the board. The spots is a building or an area or a room..etc, any interactive square.
 * then the roooms work as the spots but they are the units inside of the spot.
 */

export class Boards extends GameMap {
	constructor(
		mapdId: string,
		boardId: string,
		{
			type,
			name,
			entry,
			main,
			xy,
		}: { type: boardtype; name?: string[]; entry?: string | string[]; main?: string; xy?: [number, number?] },
		map?: Boards
	) {
		super([boardId, mapdId, name]);

		if (map) {
			// copy mapdata
			if (Config.debug) console.log("Copying mapdata from source:", map.id);
			for (let key in map) {
				this[key] = clone(map[key]);
			}
		} else {
			if (Config.debug) console.log("Creating new mapdata:", mapdId, boardId, type, name, entry, main, xy);

			// create new mapdata
			if (!xy[0]) xy[0] = 13;
			if (!xy[1]) xy[1] = xy[0];

			this.mapType = "board";
			this.boardType = type;

			if (Array.isArray(entry)) {
				this.entries = entry;
				this.staticEntry = main || entry[0];
				if (Config.debug)
					console.log(
						"Found multip entries, set the static entry to index 0. Entry:",
						this.entries,
						this.staticEntry
					);
			} else {
				this.staticEntry = entry;
				this.entries = [entry];
				if (Config.debug) console.log("Entry:", this.entries, this.staticEntry);
			}

			this.mapsize = { x: xy[0], y: xy[1] };
			this.spots = new Map();
		}
	}

	//设置地点
	Spots(...spots: Array<[string, number, number, string?, spotType[]?]>) {
		spots.forEach((spot) => {
			if (Config.debug) console.log("Setting spots:", spot);

			let x = (spot[1] += Math.floor(this.mapsize.x / 2));
			let y = (spot[2] += Math.floor(this.mapsize.y / 2));

			//split and merge tags
			let info = spot[0].split("|"),
				tileType;
			if (info.length > 1) {
				tileType = info.slice(1).join("|");
			} else {
				tileType = "spot";
			}

			let name = info[0];
			let dside = spot[3];
			let spotType = spot[4].join("|");

			this.spots.set(name, { pos: [{ x, y }], dside, spotType, tileType });

			if (Config.debug) console.log("Spot set successfully. Spot:", name, x, y, dside, spotType, tileType);
		});
		return this;
	}

	//初始化棋盘
	initBoard() {
		if (Config.debug) console.log("initBoard", this.id);

		this.mapdata = new Array(this.mapsize.x).fill(0).map(() => new Array(this.mapsize.y).fill(0).map(() => ""));
		this.spots.forEach((spot, name) => {
			let pos = spot.pos[0];
			this.mapdata[pos.x][pos.y] = name;
		});
		return this;
	}

	//生成地图数据
	Generate() {
		if (Config.debug) console.log("Generate a board automatically", this.id);

		const rawdata = GenerateMap(this);
		this.mapdata = boardToMapdata(rawdata);
		return this;
	}

	//在控制台打印地图数据
	console() {
		printMapFromData(this);
	}
}

//-------------------->> Configure Spots Type and Tags  <<--------------------
// configure types and tags at here
// 请在这里配置地点类型和标签

export const typeTags = {
	building: ["室内"],
	buildingEntry: ["室外"],
	gate: ["室外", "检查点"],
	mapEntry: ["地图接口"],
	transport: ["室外", "交通"],
	portal: ["室外"],
	shopAlley: ["商店街", "室外"],
	park: ["室外", "休息区"],
	field: ["开阔", "室外"],
	float: ["室外", "悬浮", "开阔"],
	private: ["私人", "上锁"],
	room: ["室内"],
	secretArea: ["隐蔽", "封闭"],
	ground: ["室外", "开阔", "活动"],
	house: ["室内", "个人", "休息区"],
};

export const setTagByBoardType = function (boardType: boardtype, tags: string[]) {
	switch (boardType) {
		case "forest":
			if (tags.has("室外")) {
				tags.push("森林");
			}
			break;
		case "ocean":
			if (tags.has("室外")) {
				tags.push("水下");
			}
			break;
		case "mountain":
			if (tags.has("室外")) {
				tags.push("山岳");
			}
			break;
		case "dungeon":
			tags.push("地下");
			break;
		case "maze":
			tags.push("异空间");
			break;
		case "floatingIsland":
		case "field":
			if (tags.has("室外")) {
				tags.push("开阔");
			}
			break;
		case "academy":
			if (!tags.has("异空间")) {
				tags.push("魔网");
			}
	}
};
//-------------------->> Class Spots <<-----------------------------------------
//  地点类
//  用于创建和管理地点
//------------------------------------------------------------------------------

/**
 * @name Spots
 * @description
 * a class to create and manage spots and rooms.
 * It was splited to two classes, but it's make management more complex.
 * since the room almost works as a spot, so we can use the same class to manage them.
 *
 */
export class Spots extends GameMap {
	constructor([boardId, mapId, name, type]: [string, string, string[], spotType], map?: Spots) {
		// 预处理，获取父级
		// get parent group for convenience
		if (Config.debug) {
			console.log("Creating a spot, try to get parent group before init:", boardId, mapId, name, type, map);
		}
		let parent,
			id = boardId + "." + mapId;
		if (type.has("room")) {
			parent = GameMap.getParentGroup("spot", boardId);
			if (parent?.spotType) type = (parent.spotType + "|" + type) as spotType;
			boardId = parent?.boardId || boardId;
		} else {
			parent = GameMap.getParentGroup("board", boardId);
		}

		//创建
		super([boardId, mapId, name]);
		if (map) {
			if (Config.debug) {
				console.log("Found copy source. Copying a spot....");
			}
			for (let key in map) {
				this[key] = clone(map[key]);
			}
		} else {
			if (Config.debug) {
				console.log("Creating a spot....");
			}
			this.boardId = boardId;
			this.mapType = "spot";
			this.spotType = type;
			this.spotId = mapId;
			this.placement = [];
			this.tags = [];

			//如果是房间，修正分类
			if (type.has("room")) {
				this.roomId = mapId.split(".").pop();
				this.spotId = parent?.id || mapId;
				this.id = id;
				this.mapType = "room";
				if (Config.debug) {
					console.log("This is a room. Fixing the id and mapType....", this.id, this.mapType);
				}
			}

			this.init();
		}
	}

	//初始化标签
	init() {
		const types = this.spotType.split("|");
		types.forEach((type) => {
			if (D.typeTags[type]) {
				this.tags.push(...D.typeTags[type]);
			}
		});

		const parent = GameMap.getParentGroup("board", this.boardId);
		if (parent?.boardType) {
			S.setTagByBoardType(parent.boardType, this.tags);
		}
		//最后去一下重复的tag
		this.tags = [...new Set(this.tags)];

		return this;
	}
	//设置房间
	Rooms(...rooms: string[]) {
		this.rooms = rooms;
		return this;
	}
	//设置开放时间
	OpenHour(weekday: number[] | "allday", open: number, close: number) {
		this.openhour = {
			weekday: weekday,
			open: open,
			close: close,
		};
		return this;
	}
	//设置家flag
	isHome() {
		this.Home = true;
		return this;
	}
	//设置停靠点
	Parking() {
		this.hasParking = true;
		return this;
	}
	//设置轨道车
	Railcar() {
		this.hasRailcar = true;
		return this;
	}
	//设置飞艇
	Airship() {
		this.hasAirship = true;
		return this;
	}
	//设置搜刮品
	Loot(loot: Dict<string[], rarity>) {
		this.loot = loot;
		return this;
	}
	addLoot(loot: Dict<string[], rarity>) {
		for (const key in loot) {
			if (!this.loot[key]) {
				this.loot[key] = [];
			}
			this.loot[key].push(...loot[key]);
			//去重
			this.loot[key] = [...new Set(this.loot[key])];
		}
		return this;
	}
	//设置放置品
	Placement(...placement: string[]) {
		this.placement = this.placement.concat(placement);
		//去重
		this.placement = [...new Set(this.placement)];
		return this;
	}
	//继承父类的标签
	AdoptParent() {
		const parent = this.getParent();
		if (Config.debug) console.log("Adopting parent tags....", parent);
		if (parent) {
			this.tags = this.tags.concat(parent.tags);
			this.placement = this.placement.concat(parent.placement);
			if (Config.debug) console.log("Adopted parent tags....", this.tags, this.placement);
		} else {
			if (Config.debug) console.log("No parent found....");
		}
		return this;
	}
	//继承父类的搜刮品
	AdoptLoot() {
		const parent = this.getParent();
		if (Config.debug) console.log("Adopting parent loot....", parent);
		if (parent) {
			this.addLoot(parent.loot);
			if (Config.debug) console.log("Adopted parent loot....", this.loot);
		} else {
			if (Config.debug) console.log("No parent found....");
		}
		return this;
	}
	//设置最大容量
	MaxSlots(number: number) {
		this.maxslot = number;
		return this;
	}
	//设置可访问条件
	Visitable(callback) {
		this.visitCond = callback;
		return this;
	}
	//设置房主
	setOwner(...owner: string[]) {
		this.owner = owner;
		return this;
	}
	//设置租金就代表可以租用
	Rentable(cost: number) {
		this.rent = cost;
		return this;
	}

	//计算房间放置品
	static countPlacement(placement: Array<string[]>) {
		if (Config.debug) {
			console.log("Start to count placement of room...", placement);
		}
		const objects = [];
		placement.forEach((object) => {
			objects.push(object[0]);
		});

		//去重复后返回数组
		return Array.from(new Set(objects));
	}
}

//将地图数组（棋盘）转换为地图对象
function boardToMapdata(mapData) {
	var map = {};
	for (var x = 0; x < mapData.length; x++) {
		for (var y = 0; y < mapData[x].length; y++) {
			if (mapData[x][y] != "") {
				if (map[mapData[x][y]] == undefined) {
					map[mapData[x][y]] = [];
				}
				map[mapData[x][y]].push([x, y]);
			}
		}
	}
	return map;
}

//将地图对象转换为地图数组（棋盘）
function mapdataToBoard(map, xsize, ysize) {
	var mapData = [];
	for (var i = 0; i < xsize; i++) {
		mapData[i] = [];
		for (var j = 0; j < ysize; j++) {
			mapData[i][j] = "";
		}
	}
	for (var key in map) {
		map[key].forEach((value) => {
			mapData[value[0]][value[1]] = key;
		});
	}
	return mapData;
}

export function printMap(map: string[][]) {
	const printmap = [];
	for (let i = 0; i < map.length; i++) {
		let line = "";
		for (let j = 0; j < map[i].length; j++) {
			if (map[i][j] === "" || map[i][j] === ".") line += " ";
			else if (map[i][j] === "road") line += ".";
			else line += map[i][j][0];
		}
		printmap.push(line);
	}

	console.log(printmap.join("\n"));
}

function printMapFromData(map) {
	const mapdata = mapdataToBoard(map, map.mapsize.x, map.mapsize.y);
	printMap(mapdata);
}
