import { iPos } from "../types";
import { printMap } from "./Map";

declare function groupmatch(arg, ...args): boolean;
export const moveableTile = ["road", "glass", "field", "passable", "area"];
const directions = [
	[-1, 0], //north
	[1, 0], //south
	[0, -1], //west
	[0, 1], //east
];
const directions2 = [
	[-1, -1], //northwest
	[-1, 1], //northeast
	[1, -1], //southwest
	[1, 1], //southeast
];

export function GenerateSpot(map) {
	//初始化地图
	const board = new Array(map.mapsize.x).fill(0).map(() => new Array(map.mapsize.y).fill(""));
	console.log(board);

	//根据x,y坐标，整理个地点的坐标。首先按x坐标排序，从小到大。
	//接着检查排序，如果y坐标相同，则按y坐标排序，从小到大。
	const spots = Array.from(map.spots);

	spots.sort((a, b) => {
		if (a[1].pos.x === b[1].pos.x) {
			return a[1].pos.y - b[1].pos.y;
		}
		return a[1].pos.x - b[1].pos.x;
	});

	//放置地点
	spots.forEach((loc) => {
		const pos = loc[1].pos;

		pos.forEach(({ x, y }) => {
			board[x][y] = loc[0] + loc[1].tileType;
		});
	});

	//先可通过方向，在地点前方放置道路。
	//并且缓存道路的位置，以便后续的道路连接。
	const road = [];
	const setRoad = (x, y, s) => {
		if (x < 0 || y < 0 || x >= map.mapsize.x || y >= map.mapsize.y) return;
		//console.log(x, y);
		if (groupmatch(board[x][y], "", ".", "blank")) {
			board[x][y] = "road";
			road.push({ x, y, s });
		}
	};

	spots.forEach((loc) => {
		const pos = loc[1].pos;
		const side = loc[1].dside;

		pos.forEach(({ x, y }) => {
			side.split("").forEach((s) => {
				switch (s) {
					case "W": //west
					case "w":
						setRoad(x, y - 1, "W");
						break;
					case "E": //east
					case "e":
						setRoad(x, y + 1, "E");
						break;
					case "S": //south
					case "s":
						setRoad(x + 1, y, "S");
						break;
					case "N": //north
					case "n":
						setRoad(x - 1, y, "N");
						break;
				}
			});
		});
	});

	return [board, road];
}

export function AutoFillRoads(map: string[][]) {
	//先获取已经放置好的地点的位置。
	const spots = [];
	for (let x = 0; x < map.length; x++) {
		for (let y = 0; y < map[x].length; y++) {
			if (!groupmatch(map[x][y], "", ".", "blank")) {
				spots.push({ x, y });
			}
		}
	}
	//根据地点的位置，自动生成连接各地点之间的道路。
	for (let i = 0; i < spots.length; i++) {
		const start = spots[i];
		for (let j = i + 1; j < spots.length; j++) {
			const goal = spots[j];
			const path = createPath(map, start, goal);
			if (!path) continue;

			path.forEach((p) => {
				if (groupmatch(map[p[0]][p[1]], "", ".", "blank")) {
					map[p[0]][p[1]] = "road";
				}
			});
		}
	}
	//清除不必要的道路
	clearExtraRoad(map);
	clearUnconnectRoad(map);
	//打印地图
	printMap(map);
	return map;
}

//根据各个地点的坐标，自动生成连接各地点之间的道路。
export function GenerateMap(map) {
	//初始化地图
	const maps = GenerateSpot(map);
	const board = maps[0];
	const road = maps[1];

	for (let i = 0; i < road.length; i++) {
		const start = road[i];
		for (let j = i + 1; j < road.length; j++) {
			const goal = road[j];
			const path = createPath(board, start, goal, start.s);
			if (!path) continue;

			path.forEach((p) => {
				if (groupmatch(board[p[0]][p[1]], "", ".", "blank")) {
					board[p[0]][p[1]] = "road";
				}
			});
		}
	}

	clearExtraRoad(board);
	clearUnconnectRoad(board);

	//打印地图
	printMap(board);

	return board;
}

export function clearExtraRoad(map: string[][]) {
	for (let x = 0; x < map.length; x++) {
		for (let y = 0; y < map[x].length; y++) {
			if (roadAroundRoads(x, y, map) >= 7) {
				map[x][y] = "";
			}
		}
	}
}

//计算两个地点之间的绝对距离
export function Distance(start: iPos, goal: iPos) {
	return Math.abs(start.x - start.x) + Math.abs(goal.y - goal.y);
}

function outOfMap(x, y, map: string[][]) {
	return x < 0 || y < 0 || x >= map.length || y >= map[x].length;
}

//检查周围八个方向是否有路
function roadAroundRoads(x, y, map: string[][]) {
	let count = 0,
		edge = 0;
	const dir = directions.concat(directions2);
	if (map[x][y] !== "road") return 0;

	dir.forEach((d) => {
		if (outOfMap(x + d[0], y + d[1], map)) {
			edge++;
		} else if (map[x + d[0]][y + d[1]] === "road") count++;
	});
	return count + edge;
}

function UnconnectRoad(x, y, map: string[][]) {
	let i = 0;
	directions.forEach((dir) => {
		if (outOfMap(x + dir[0], y + dir[1], map)) {
		} else if (!groupmatch(map[x + dir[0]][y + dir[1]], "", ".")) i++;
	});

	return i === 0;
}

function clearUnconnectRoad(map: string[][]) {
	for (let x = 0; x < map.length; x++) {
		for (let y = 0; y < map[x].length; y++) {
			if (map[x][y] === "road") {
				if (UnconnectRoad(x, y, map)) {
					map[x][y] = "";
				}
			}
		}
	}
	return map;
}

//检查两点之间是否有道路或可移动点相连
function isConnected(pos1: iPos, pos2: iPos, map: string[][]) {
	const x1 = pos1.x,
		y1 = pos1.y,
		x2 = pos2.x,
		y2 = pos2.y;
	if (x1 === x2 && y1 === y2) return true;
	if (x1 === x2) {
		if (y1 > y2) {
			for (let i = y2; i <= y1; i++) {
				if (groupmatch(map[x1][i], "", ".") || map[x1][i].has("unpassable")) return false;
			}
		} else {
			for (let i = y1; i <= y2; i++) {
				if (groupmatch(map[x1][i], "", ".") || map[x1][i].has("unpassable")) return false;
			}
		}
	} else if (y1 === y2) {
		if (x1 > x2) {
			for (let i = x2; i <= x1; i++) {
				if (groupmatch(map[i][y1], "", ".") || map[x1][i].has("unpassable")) return false;
			}
		} else {
			for (let i = x1; i <= x2; i++) {
				if (groupmatch(map[i][y1], "", ".") || map[x1][i].has("unpassable")) return false;
			}
		}
	} else {
		return Distance(pos1, pos2) === 1;
	}
	return true;
}
//根据两个地点的坐标，以及道路连接情况，获取两个地点之间的最短路径
export function findPath(mapdata, startPoint, goalPoint) {
	const queue = [];
	const visited = new Set();

	queue.push({ x: startPoint.x, y: startPoint.y, path: [], from: null });
	visited.add(startPoint);

	while (queue.length > 0) {
		const current = queue.shift();

		if (current.x === goalPoint.x && current.y === goalPoint.y) {
			// goalPoint found, return the path
			return current.path;
		}

		for (const dir of directions) {
			const x = current.x + dir[0];
			const y = current.y + dir[1];

			if (x < 0 || y < 0 || x >= mapdata.length || y >= mapdata[0].length) {
				// out of bounds
				continue;
			}

			//unpassable
			if (mapdata[x][y].has("unpassable")) continue;

			//not a road or not goalPoint
			if (!mapdata[x][y].has(moveableTile) && x != goalPoint.x && y != goalPoint.y) continue;

			//not connect
			if (!isConnected({ x: current.x, y: current.y }, { x, y }, mapdata)) continue;

			if (visited.has(`${x},${y}`)) {
				// cell already visited or not a road
				continue;
			}
			if (current.from !== null && current.from[0] === -dir[0] && current.from[1] === -dir[1]) continue;
			visited.add(`${x},${y}`);
			queue.push({ x, y, path: current.path.concat([[x, y]]), from: dir });
		}
	}

	// goalPoint not found
	return null;
}

//根据移动路线，打印路线图
export function printPath(mapdata, path) {
	//先根据地图数据创建一个空白的地图
	const map = mapdata.map((row) => row.map((cell) => " "));
	//将路线上的点标记为路线
	path.forEach((point) => {
		map[point[0]][point[1]] = "x";
	});
	//打印地图
	map.forEach((row) => console.log(row.join("")));
}

export function createPath(mapdata, startPoint, goalPoint, side?) {
	const queue = [];
	const visited = new Set();
	let dirs;

	switch (side) {
		case "N":
			dirs = [
				[0, -1], //west
				[0, 1], //east
				[1, 0], //south
			];
		case "S":
			dirs = [
				[0, -1], //west
				[0, 1], //east
				[-1, 0], //north
			];
		case "W":
			dirs = [
				[-1, 0], //north
				[1, 0], //south
				[0, 1], //east
			];
		case "E":
			dirs = [
				[-1, 0], //north
				[1, 0], //south
				[0, -1], //west
			];
		default:
			dirs = directions;
	}

	queue.push({ x: startPoint.x, y: startPoint.y, path: [], from: null });
	visited.add(startPoint);

	while (queue.length > 0) {
		const current = queue.shift();

		if (current.x === goalPoint.x && current.y === goalPoint.y) {
			// goalPoint found, return the path
			return current.path;
		}

		for (const dir of dirs) {
			const x = current.x + dir[0];
			const y = current.y + dir[1];

			if (x < 0 || y < 0 || x >= mapdata.length || y >= mapdata[0].length) {
				// out of bounds
				continue;
			}

			//unpassable
			if (mapdata[x][y].has("unpassable")) continue;

			//not a blank or road or goalPoint
			if (!groupmatch(mapdata[x][y], "", ".", "blank", "road") && x != goalPoint.x && y != goalPoint.y) continue;

			//too many roads around
			if (roadAroundRoads(x, y, mapdata) > 2) continue;

			if (visited.has(`${x},${y}`)) {
				// cell already visited
				continue;
			}

			if (current.from !== null && current.from[0] === -dir[0] && current.from[1] === -dir[1]) continue;
			visited.add(`${x},${y}`);
			queue.push({ x, y, path: current.path.concat([[x, y]]), from: dir });
		}
	}
	// goalPoint not found
	return null;
}
