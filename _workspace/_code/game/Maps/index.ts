export * from "./Map";
export * from "./MapUtils";

// Path: _workspace\code\game\Maps\Map.ts
import { boardtype, spotType } from "../types";
import { Boards, Spots, Square, typeTags, setTagByBoardType, printMap } from "./Map";
import {
	moveableTile,
	GenerateSpot,
	AutoFillRoads,
	GenerateMap,
	clearExtraRoad,
	Distance,
	findPath,
	printPath,
	createPath,
} from "./MapUtils";
declare var scEra: typeof window.scEra;

//-------------------------------------------------------//
//  Map modules
//
//-------------------------------------------------------//

const worldMap = {
	CommonSpots: {},
	Boards: {},
	Spots: {},
};

async function initWorldMap() {
	scEra.modules.Maps.worldMap = worldMap;
	Object.defineProperty(window, "worldMap", {
		get: () => scEra.modules.Maps.worldMap,
	});
}

function addBoard(
	name: string,
	group: string,
	obj: {
		type: boardtype;
		name: string[];
		entry: string[];
		xy?: [number, number?];
	}
) {
	worldMap.Boards[name] = new Boards(name, group, obj);

	Object.defineProperty(worldMap, name, {
		get: () => worldMap[name],
	});

	return worldMap[name];
}

function addSpot([boardId, spotId, name, spotType]: [string, string, string[], spotType]) {
	worldMap[boardId][spotId] = new Spots([boardId, spotId, name, spotType]);

	Object.defineProperty(worldMap.Spots, spotId, {
		get: () => worldMap[boardId][spotId],
	});

	return worldMap[boardId][spotId];
}

const modules = {
	name: "Maps",
	version: "1.0.0",
	des: "A module for map system.",
	data: {
		typeTags,
		moveableTile,
	},
	database: {
		worldMap,
	},
	classObj: {
		Boards,
		Spots,
	},
	func: {
		Square,
		printMap,
		GenerateSpot,
		AutoFillRoads,
		GenerateMap,
		Distance,
		findPath,
		printPath,
		createPath,
		Init: {
			initWorldMap,
		},
	},
	config: {
		globalFunc: {
			addBoard,
			addSpot,
		},
	},
	setup: {
		setTagByBoardType,
	},
	Init: ["initWorldMap"],
};

declare function addModule(modules): boolean;
addModule(modules);
