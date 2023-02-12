;(function () {
	'use strict';

	const support = ["CN", "EN", "JP"];
	function lan$1(...txts) {
	  let first = Config.lan || "CN", sec = Config.secLan || "EN";
	  let i = support.indexOf(first);
	  if (txts[i])
	    return txts[i];
	  i = support.indexOf(sec);
	  if (txts[i])
	    return txts[i];
	  return txts[0];
	}
	function percent(...num) {
	  let min = num[0], max = num[1];
	  if (num.length == 3) {
	    min = num[1];
	    max = num[2];
	  }
	  return Math.clamp(Math.trunc(min / max * 100), 1, 100);
	}
	Object.defineProperties(window, {
	  percent: { value: percent },
	  lan: { value: lan$1 }
	});

	const moveableTile = ["road", "glass", "field", "passable", "area"];
	const directions = [
	  [-1, 0],
	  [1, 0],
	  [0, -1],
	  [0, 1]
	];
	const directions2 = [
	  [-1, -1],
	  [-1, 1],
	  [1, -1],
	  [1, 1]
	];
	function GenerateSpot(map) {
	  const board = new Array(map.mapsize.x).fill(0).map(() => new Array(map.mapsize.y).fill(""));
	  console.log(board);
	  const spots = Array.from(map.spots);
	  spots.sort((a, b) => {
	    if (a[1].pos.x === b[1].pos.x) {
	      return a[1].pos.y - b[1].pos.y;
	    }
	    return a[1].pos.x - b[1].pos.x;
	  });
	  spots.forEach((loc) => {
	    const pos = loc[1].pos;
	    pos.forEach(({ x, y }) => {
	      board[x][y] = loc[0] + loc[1].tileType;
	    });
	  });
	  const road = [];
	  const setRoad = (x, y, s) => {
	    if (x < 0 || y < 0 || x >= map.mapsize.x || y >= map.mapsize.y)
	      return;
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
	          case "W":
	          case "w":
	            setRoad(x, y - 1, "W");
	            break;
	          case "E":
	          case "e":
	            setRoad(x, y + 1, "E");
	            break;
	          case "S":
	          case "s":
	            setRoad(x + 1, y, "S");
	            break;
	          case "N":
	          case "n":
	            setRoad(x - 1, y, "N");
	            break;
	        }
	      });
	    });
	  });
	  return [board, road];
	}
	function AutoFillRoads(map) {
	  const spots = [];
	  for (let x = 0; x < map.length; x++) {
	    for (let y = 0; y < map[x].length; y++) {
	      if (!groupmatch(map[x][y], "", ".", "blank")) {
	        spots.push({ x, y });
	      }
	    }
	  }
	  for (let i = 0; i < spots.length; i++) {
	    const start = spots[i];
	    for (let j = i + 1; j < spots.length; j++) {
	      const goal = spots[j];
	      const path = createPath(map, start, goal);
	      if (!path)
	        continue;
	      path.forEach((p) => {
	        if (groupmatch(map[p[0]][p[1]], "", ".", "blank")) {
	          map[p[0]][p[1]] = "road";
	        }
	      });
	    }
	  }
	  clearExtraRoad(map);
	  clearUnconnectRoad(map);
	  printMap(map);
	  return map;
	}
	function GenerateMap(map) {
	  const maps = GenerateSpot(map);
	  const board = maps[0];
	  const road = maps[1];
	  for (let i = 0; i < road.length; i++) {
	    const start = road[i];
	    for (let j = i + 1; j < road.length; j++) {
	      const goal = road[j];
	      const path = createPath(board, start, goal, start.s);
	      if (!path)
	        continue;
	      path.forEach((p) => {
	        if (groupmatch(board[p[0]][p[1]], "", ".", "blank")) {
	          board[p[0]][p[1]] = "road";
	        }
	      });
	    }
	  }
	  clearExtraRoad(board);
	  clearUnconnectRoad(board);
	  printMap(board);
	  return board;
	}
	function clearExtraRoad(map) {
	  for (let x = 0; x < map.length; x++) {
	    for (let y = 0; y < map[x].length; y++) {
	      if (roadAroundRoads(x, y, map) >= 7) {
	        map[x][y] = "";
	      }
	    }
	  }
	}
	function Distance(start, goal) {
	  return Math.abs(start.x - start.x) + Math.abs(goal.y - goal.y);
	}
	function outOfMap(x, y, map) {
	  return x < 0 || y < 0 || x >= map.length || y >= map[x].length;
	}
	function roadAroundRoads(x, y, map) {
	  let count = 0, edge = 0;
	  const dir = directions.concat(directions2);
	  if (map[x][y] !== "road")
	    return 0;
	  dir.forEach((d) => {
	    if (outOfMap(x + d[0], y + d[1], map)) {
	      edge++;
	    } else if (map[x + d[0]][y + d[1]] === "road")
	      count++;
	  });
	  return count + edge;
	}
	function UnconnectRoad(x, y, map) {
	  let i = 0;
	  directions.forEach((dir) => {
	    if (outOfMap(x + dir[0], y + dir[1], map)) ; else if (!groupmatch(map[x + dir[0]][y + dir[1]], "", "."))
	      i++;
	  });
	  return i === 0;
	}
	function clearUnconnectRoad(map) {
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
	function isConnected(pos1, pos2, map) {
	  const x1 = pos1.x, y1 = pos1.y, x2 = pos2.x, y2 = pos2.y;
	  if (x1 === x2 && y1 === y2)
	    return true;
	  if (x1 === x2) {
	    if (y1 > y2) {
	      for (let i = y2; i <= y1; i++) {
	        if (groupmatch(map[x1][i], "", ".") || map[x1][i].has("unpassable"))
	          return false;
	      }
	    } else {
	      for (let i = y1; i <= y2; i++) {
	        if (groupmatch(map[x1][i], "", ".") || map[x1][i].has("unpassable"))
	          return false;
	      }
	    }
	  } else if (y1 === y2) {
	    if (x1 > x2) {
	      for (let i = x2; i <= x1; i++) {
	        if (groupmatch(map[i][y1], "", ".") || map[x1][i].has("unpassable"))
	          return false;
	      }
	    } else {
	      for (let i = x1; i <= x2; i++) {
	        if (groupmatch(map[i][y1], "", ".") || map[x1][i].has("unpassable"))
	          return false;
	      }
	    }
	  } else {
	    return Distance(pos1, pos2) === 1;
	  }
	  return true;
	}
	function findPath(mapdata, startPoint, goalPoint) {
	  const queue = [];
	  const visited = /* @__PURE__ */ new Set();
	  queue.push({ x: startPoint.x, y: startPoint.y, path: [], from: null });
	  visited.add(startPoint);
	  while (queue.length > 0) {
	    const current = queue.shift();
	    if (current.x === goalPoint.x && current.y === goalPoint.y) {
	      return current.path;
	    }
	    for (const dir of directions) {
	      const x = current.x + dir[0];
	      const y = current.y + dir[1];
	      if (x < 0 || y < 0 || x >= mapdata.length || y >= mapdata[0].length) {
	        continue;
	      }
	      if (mapdata[x][y].has("unpassable"))
	        continue;
	      if (!mapdata[x][y].has(moveableTile) && x != goalPoint.x && y != goalPoint.y)
	        continue;
	      if (!isConnected({ x: current.x, y: current.y }, { x, y }, mapdata))
	        continue;
	      if (visited.has(`${x},${y}`)) {
	        continue;
	      }
	      if (current.from !== null && current.from[0] === -dir[0] && current.from[1] === -dir[1])
	        continue;
	      visited.add(`${x},${y}`);
	      queue.push({ x, y, path: current.path.concat([[x, y]]), from: dir });
	    }
	  }
	  return null;
	}
	function printPath(mapdata, path) {
	  const map = mapdata.map((row) => row.map((cell) => " "));
	  path.forEach((point) => {
	    map[point[0]][point[1]] = "x";
	  });
	  map.forEach((row) => console.log(row.join("")));
	}
	function createPath(mapdata, startPoint, goalPoint, side) {
	  const queue = [];
	  const visited = /* @__PURE__ */ new Set();
	  let dirs;
	  switch (side) {
	    case "N":
	      dirs = [
	        [0, -1],
	        [0, 1],
	        [1, 0]
	      ];
	    case "S":
	      dirs = [
	        [0, -1],
	        [0, 1],
	        [-1, 0]
	      ];
	    case "W":
	      dirs = [
	        [-1, 0],
	        [1, 0],
	        [0, 1]
	      ];
	    case "E":
	      dirs = [
	        [-1, 0],
	        [1, 0],
	        [0, -1]
	      ];
	    default:
	      dirs = directions;
	  }
	  queue.push({ x: startPoint.x, y: startPoint.y, path: [], from: null });
	  visited.add(startPoint);
	  while (queue.length > 0) {
	    const current = queue.shift();
	    if (current.x === goalPoint.x && current.y === goalPoint.y) {
	      return current.path;
	    }
	    for (const dir of dirs) {
	      const x = current.x + dir[0];
	      const y = current.y + dir[1];
	      if (x < 0 || y < 0 || x >= mapdata.length || y >= mapdata[0].length) {
	        continue;
	      }
	      if (mapdata[x][y].has("unpassable"))
	        continue;
	      if (!groupmatch(mapdata[x][y], "", ".", "blank", "road") && x != goalPoint.x && y != goalPoint.y)
	        continue;
	      if (roadAroundRoads(x, y, mapdata) > 2)
	        continue;
	      if (visited.has(`${x},${y}`)) {
	        continue;
	      }
	      if (current.from !== null && current.from[0] === -dir[0] && current.from[1] === -dir[1])
	        continue;
	      visited.add(`${x},${y}`);
	      queue.push({ x, y, path: current.path.concat([[x, y]]), from: dir });
	    }
	  }
	  return null;
	}

	class GameMap {
	  constructor([boardId, id, name]) {
	    this.boardId = boardId;
	    this.id = boardId !== "" ? `${boardId}.${id}` : id;
	    this.name = name;
	    this.tags = [];
	    this.events = function() {
	      return "";
	    };
	  }
	  setName(name) {
	    this.name = name;
	    return this;
	  }
	  Events(callback) {
	    this.events = callback;
	    return this;
	  }
	  Tags(...tags) {
	    if (Config.debug)
	      console.log("Try to set tags: ", tags, " to map: ", this.id, "");
	    this.tags = this.tags.concat(tags);
	    this.tags = [...new Set(this.tags)];
	    if (Config.debug)
	      console.log("Tags set to map: ", this.id, " successfully! Tags: ", this.tags, "");
	    return this;
	  }
	  getParentId() {
	    if (!this.boardId || this.boardId === this.id) {
	      if (Config.debug)
	        console.log("No parent id found for map: ", this.id, " !");
	      return this.boardId;
	    }
	    if (Config.debug)
	      console.log("Try to get parent id for map: ", this.id, " ...");
	    const path = this.id.split(".");
	    path.pop();
	    return path.join(".");
	  }
	  getParent() {
	    if (!this.boardId || this.boardId === this.id) {
	      return null;
	    }
	    const id = this.getParentId();
	    return GameMap.get(id);
	  }
	  setPortal(...points) {
	    this.portal = {
	      exist: true,
	      points
	    };
	    return this;
	  }
	  addPortal(...points) {
	    this.portal.points.push(...points);
	    return this;
	  }
	  static get(mapId) {
	    if (Config.debug)
	      console.log("Try to get Mapdata:", mapId);
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
	    return map;
	  }
	  static getBy(type, mapdId, ...args) {
	    if (Config.debug)
	      console.log("Try to get Mapdata by type:", type, mapdId, args);
	    const data = this.get(mapdId);
	    if (!data)
	      return null;
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
	  static getParentGroup(type, boardId) {
	    if (Config.debug)
	      console.log("Try to get parent group:", type, boardId);
	    if (!boardId) {
	      console.log("No boardId!");
	      return null;
	    }
	    let parent = worldMap;
	    let path = boardId.split(".");
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
	      if (Config.debug)
	        console.log("CommonSpots has no parent", boardId);
	      return null;
	    }
	    if (Config.debug)
	      console.log("Get parent group:", type, boardId, parentlist[parentlist.length - 1]);
	    return parentlist[parentlist.length - 1];
	  }
	  static getBoard(mapId) {
	    if (Config.debug)
	      console.log("Try to get board:", mapId);
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
	  static convertData(mapdata) {
	    return boardToMapdata(mapdata);
	  }
	  static console(map) {
	    printMap(map);
	  }
	  static copy(map, boardId, mapId) {
	    if (Config.debug)
	      console.log("Try to copy mapdata:", map, boardId, mapId);
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
	function Square(p = "", t = "blank", able = 0) {
	  this.p = p;
	  this.t = t;
	  this.visit = 0;
	  this.able = able;
	  this.set = function(key, values) {
	    this[key] = values;
	  };
	}
	class Boards extends GameMap {
	  constructor(mapdId, boardId, {
	    type,
	    name,
	    entry,
	    main,
	    xy
	  }, map) {
	    super([boardId, mapdId, name]);
	    if (map) {
	      if (Config.debug)
	        console.log("Copying mapdata from source:", map.id);
	      for (let key in map) {
	        this[key] = clone(map[key]);
	      }
	    } else {
	      if (Config.debug)
	        console.log("Creating new mapdata:", mapdId, boardId, type, name, entry, main, xy);
	      if (!xy[0])
	        xy[0] = 13;
	      if (!xy[1])
	        xy[1] = xy[0];
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
	        if (Config.debug)
	          console.log("Entry:", this.entries, this.staticEntry);
	      }
	      this.mapsize = { x: xy[0], y: xy[1] };
	      this.spots = /* @__PURE__ */ new Map();
	    }
	  }
	  Spots(...spots) {
	    spots.forEach((spot) => {
	      if (Config.debug)
	        console.log("Setting spots:", spot);
	      let x = spot[1] += Math.floor(this.mapsize.x / 2);
	      let y = spot[2] += Math.floor(this.mapsize.y / 2);
	      let info = spot[0].split("|"), tileType2;
	      if (info.length > 1) {
	        tileType2 = info.slice(1).join("|");
	      } else {
	        tileType2 = "spot";
	      }
	      let name = info[0];
	      let dside = spot[3];
	      let spotType2 = spot[4].join("|");
	      this.spots.set(name, { pos: [{ x, y }], dside, spotType: spotType2, tileType: tileType2 });
	      if (Config.debug)
	        console.log("Spot set successfully. Spot:", name, x, y, dside, spotType2, tileType2);
	    });
	    return this;
	  }
	  initBoard() {
	    if (Config.debug)
	      console.log("initBoard", this.id);
	    this.mapdata = new Array(this.mapsize.x).fill(0).map(() => new Array(this.mapsize.y).fill(0).map(() => ""));
	    this.spots.forEach((spot, name) => {
	      let pos = spot.pos[0];
	      this.mapdata[pos.x][pos.y] = name;
	    });
	    return this;
	  }
	  Generate() {
	    if (Config.debug)
	      console.log("Generate a board automatically", this.id);
	    const rawdata = GenerateMap(this);
	    this.mapdata = boardToMapdata(rawdata);
	    return this;
	  }
	  console() {
	    printMapFromData(this);
	  }
	}
	const typeTags = {
	  building: ["\u5BA4\u5185"],
	  buildingEntry: ["\u5BA4\u5916"],
	  gate: ["\u5BA4\u5916", "\u68C0\u67E5\u70B9"],
	  mapEntry: ["\u5730\u56FE\u63A5\u53E3"],
	  transport: ["\u5BA4\u5916", "\u4EA4\u901A"],
	  portal: ["\u5BA4\u5916"],
	  shopAlley: ["\u5546\u5E97\u8857", "\u5BA4\u5916"],
	  park: ["\u5BA4\u5916", "\u4F11\u606F\u533A"],
	  field: ["\u5F00\u9614", "\u5BA4\u5916"],
	  float: ["\u5BA4\u5916", "\u60AC\u6D6E", "\u5F00\u9614"],
	  private: ["\u79C1\u4EBA", "\u4E0A\u9501"],
	  room: ["\u5BA4\u5185"],
	  secretArea: ["\u9690\u853D", "\u5C01\u95ED"],
	  ground: ["\u5BA4\u5916", "\u5F00\u9614", "\u6D3B\u52A8"],
	  house: ["\u5BA4\u5185", "\u4E2A\u4EBA", "\u4F11\u606F\u533A"]
	};
	const setTagByBoardType = function(boardType, tags) {
	  switch (boardType) {
	    case "forest":
	      if (tags.has("\u5BA4\u5916")) {
	        tags.push("\u68EE\u6797");
	      }
	      break;
	    case "ocean":
	      if (tags.has("\u5BA4\u5916")) {
	        tags.push("\u6C34\u4E0B");
	      }
	      break;
	    case "mountain":
	      if (tags.has("\u5BA4\u5916")) {
	        tags.push("\u5C71\u5CB3");
	      }
	      break;
	    case "dungeon":
	      tags.push("\u5730\u4E0B");
	      break;
	    case "maze":
	      tags.push("\u5F02\u7A7A\u95F4");
	      break;
	    case "floatingIsland":
	    case "field":
	      if (tags.has("\u5BA4\u5916")) {
	        tags.push("\u5F00\u9614");
	      }
	      break;
	    case "academy":
	      if (!tags.has("\u5F02\u7A7A\u95F4")) {
	        tags.push("\u9B54\u7F51");
	      }
	  }
	};
	class Spots extends GameMap {
	  constructor([boardId, mapId, name, type], map) {
	    if (Config.debug) {
	      console.log("Creating a spot, try to get parent group before init:", boardId, mapId, name, type, map);
	    }
	    let parent, id = boardId + "." + mapId;
	    if (type.has("room")) {
	      parent = GameMap.getParentGroup("spot", boardId);
	      if (parent == null ? void 0 : parent.spotType)
	        type = parent.spotType + "|" + type;
	      boardId = (parent == null ? void 0 : parent.boardId) || boardId;
	    } else {
	      parent = GameMap.getParentGroup("board", boardId);
	    }
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
	      if (type.has("room")) {
	        this.roomId = mapId.split(".").pop();
	        this.spotId = (parent == null ? void 0 : parent.id) || mapId;
	        this.id = id;
	        this.mapType = "room";
	        if (Config.debug) {
	          console.log("This is a room. Fixing the id and mapType....", this.id, this.mapType);
	        }
	      }
	      this.init();
	    }
	  }
	  init() {
	    const types = this.spotType.split("|");
	    types.forEach((type) => {
	      if (D.typeTags[type]) {
	        this.tags.push(...D.typeTags[type]);
	      }
	    });
	    const parent = GameMap.getParentGroup("board", this.boardId);
	    if (parent == null ? void 0 : parent.boardType) {
	      S.setTagByBoardType(parent.boardType, this.tags);
	    }
	    this.tags = [...new Set(this.tags)];
	    return this;
	  }
	  Rooms(...rooms) {
	    this.rooms = rooms;
	    return this;
	  }
	  OpenHour(weekday, open, close) {
	    this.openhour = {
	      weekday,
	      open,
	      close
	    };
	    return this;
	  }
	  isHome() {
	    this.Home = true;
	    return this;
	  }
	  Parking() {
	    this.hasParking = true;
	    return this;
	  }
	  Railcar() {
	    this.hasRailcar = true;
	    return this;
	  }
	  Airship() {
	    this.hasAirship = true;
	    return this;
	  }
	  Loot(loot) {
	    this.loot = loot;
	    return this;
	  }
	  addLoot(loot) {
	    for (const key in loot) {
	      if (!this.loot[key]) {
	        this.loot[key] = [];
	      }
	      this.loot[key].push(...loot[key]);
	      this.loot[key] = [...new Set(this.loot[key])];
	    }
	    return this;
	  }
	  Placement(...placement) {
	    this.placement = this.placement.concat(placement);
	    this.placement = [...new Set(this.placement)];
	    return this;
	  }
	  AdoptParent() {
	    const parent = this.getParent();
	    if (Config.debug)
	      console.log("Adopting parent tags....", parent);
	    if (parent) {
	      this.tags = this.tags.concat(parent.tags);
	      this.placement = this.placement.concat(parent.placement);
	      if (Config.debug)
	        console.log("Adopted parent tags....", this.tags, this.placement);
	    } else {
	      if (Config.debug)
	        console.log("No parent found....");
	    }
	    return this;
	  }
	  AdoptLoot() {
	    const parent = this.getParent();
	    if (Config.debug)
	      console.log("Adopting parent loot....", parent);
	    if (parent) {
	      this.addLoot(parent.loot);
	      if (Config.debug)
	        console.log("Adopted parent loot....", this.loot);
	    } else {
	      if (Config.debug)
	        console.log("No parent found....");
	    }
	    return this;
	  }
	  MaxSlots(number) {
	    this.maxslot = number;
	    return this;
	  }
	  Visitable(callback) {
	    this.visitCond = callback;
	    return this;
	  }
	  setOwner(...owner) {
	    this.owner = owner;
	    return this;
	  }
	  Rentable(cost) {
	    this.rent = cost;
	    return this;
	  }
	  static countPlacement(placement) {
	    if (Config.debug) {
	      console.log("Start to count placement of room...", placement);
	    }
	    const objects = [];
	    placement.forEach((object) => {
	      objects.push(object[0]);
	    });
	    return Array.from(new Set(objects));
	  }
	}
	function boardToMapdata(mapData) {
	  var map = {};
	  for (var x = 0; x < mapData.length; x++) {
	    for (var y = 0; y < mapData[x].length; y++) {
	      if (mapData[x][y] != "") {
	        if (map[mapData[x][y]] == void 0) {
	          map[mapData[x][y]] = [];
	        }
	        map[mapData[x][y]].push([x, y]);
	      }
	    }
	  }
	  return map;
	}
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
	function printMap(map) {
	  const printmap = [];
	  for (let i = 0; i < map.length; i++) {
	    let line = "";
	    for (let j = 0; j < map[i].length; j++) {
	      if (map[i][j] === "" || map[i][j] === ".")
	        line += " ";
	      else if (map[i][j] === "road")
	        line += ".";
	      else
	        line += map[i][j][0];
	    }
	    printmap.push(line);
	  }
	  console.log(printmap.join("\n"));
	}
	function printMapFromData(map) {
	  const mapdata = mapdataToBoard(map, map.mapsize.x, map.mapsize.y);
	  printMap(mapdata);
	}

	var __async$3 = (__this, __arguments, generator) => {
	  return new Promise((resolve, reject) => {
	    var fulfilled = (value) => {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var rejected = (value) => {
	      try {
	        step(generator.throw(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
	    step((generator = generator.apply(__this, __arguments)).next());
	  });
	};
	const worldMap$1 = {
	  CommonSpots: {},
	  Boards: {},
	  Spots: {}
	};
	function initWorldMap() {
	  return __async$3(this, null, function* () {
	    scEra.modules.Maps.worldMap = worldMap$1;
	    Object.defineProperty(window, "worldMap", {
	      get: () => scEra.modules.Maps.worldMap
	    });
	  });
	}
	function addBoard(name, group, obj) {
	  worldMap$1.Boards[name] = new Boards(name, group, obj);
	  Object.defineProperty(worldMap$1, name, {
	    get: () => worldMap$1[name]
	  });
	  return worldMap$1[name];
	}
	function addSpot([boardId, spotId, name, spotType2]) {
	  worldMap$1[boardId][spotId] = new Spots([boardId, spotId, name, spotType2]);
	  Object.defineProperty(worldMap$1.Spots, spotId, {
	    get: () => worldMap$1[boardId][spotId]
	  });
	  return worldMap$1[boardId][spotId];
	}
	const modules$4 = {
	  name: "Maps",
	  version: "1.0.0",
	  des: "A module for map system.",
	  data: {
	    typeTags,
	    moveableTile
	  },
	  database: {
	    worldMap: worldMap$1
	  },
	  classObj: {
	    Boards,
	    Spots
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
	      initWorldMap
	    }
	  },
	  config: {
	    globalFunc: {
	      addBoard,
	      addSpot
	    }
	  },
	  setup: {
	    setTagByBoardType
	  },
	  Init: ["initWorldMap"]
	};
	addModule(modules$4);

	var __async$2 = (__this, __arguments, generator) => {
	  return new Promise((resolve, reject) => {
	    var fulfilled = (value) => {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var rejected = (value) => {
	      try {
	        step(generator.throw(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
	    step((generator = generator.apply(__this, __arguments)).next());
	  });
	};
	class Talent {
	  constructor({ name, des, rate = 0.5, conflict = [], group = "Netural" } = {}) {
	    this.type = "talent";
	    this.name = name;
	    this.des = des;
	    this.group = group;
	    this.conflict = conflict;
	    this.group = "";
	    this.rate = rate;
	    this.effect = function() {
	    };
	  }
	  Effects(callback) {
	    this.effect = callback;
	    return this;
	  }
	}
	class Trait extends Talent {
	  static init() {
	    D.traits.forEach((obj) => {
	      let id;
	      if (typeof obj.name == "string")
	        id = obj.name;
	      else
	        id = `${obj.name[1] || obj.name[0]}`;
	      obj.id = id;
	      Trait.data[id] = new Trait(obj);
	    });
	    console.log(Trait.data);
	  }
	  static set(type, name) {
	    const traitdata = Object.values(Trait.data).filter((trait) => {
	      return trait.name.includes(name) && trait.type == type;
	    });
	    if (traitdata) {
	      return traitdata[0];
	    } else {
	      console.log("trait has not found:", name);
	      return null;
	    }
	  }
	  static get(type, name, key = "", event) {
	    const traitdata = this.set(type, name);
	    if (traitdata) {
	      if (key == "") {
	        return traitdata;
	      }
	      if (traitdata[key] && event) {
	        return traitdata[key](event);
	      }
	      if (traitdata[key])
	        return traitdata[key];
	      else {
	        console.log("key has not found:", name, key);
	        return null;
	      }
	    } else {
	      return null;
	    }
	  }
	  static list(type) {
	    return Object.values(Trait.data).filter((trait) => {
	      return trait.group == type;
	    });
	  }
	  constructor({ id, name, des, order, group = "mental", rate = 0.5, sourceEffect = [], conflict = [] } = {}) {
	    if (typeof name == "string") {
	      name = [name, name];
	    }
	    if (typeof des == "string") {
	      des = [des, des];
	    }
	    super({ name, des, rate, conflict, group });
	    this.type = "trait";
	    this.id = id;
	    this.order = order;
	    this.group = group;
	    this.get = {};
	    this.lose = {};
	    this.conflict = conflict;
	    this.init(sourceEffect);
	  }
	  init(source) {
	    if (source == null ? void 0 : source.length) {
	      source.forEach(([key, value, option]) => {
	        if (option) {
	          this.lose[key] = value;
	        } else {
	          this.get[key] = value;
	        }
	      });
	    }
	  }
	  initConflict(conflict) {
	    conflict.forEach((traitname, index) => {
	      conflict[index] = Trait.get("trait", traitname).id;
	    });
	    this.conflict = conflict;
	  }
	  Order(callback) {
	    this.onOrder = callback;
	    return this;
	  }
	  Source(callback) {
	    this.onSource = callback;
	    return this;
	  }
	  Fix(callback) {
	    this.onFix = callback;
	    return this;
	  }
	}
	Trait.data = {};
	function findConflic(source, conflicGroup) {
	  let conflicArr = source.filter((val) => conflicGroup.includes(val));
	  if (conflicArr.length < 2) {
	    return source;
	  } else {
	    let index = random(conflicArr.length - 1);
	    source.delete(conflicGroup);
	    source.push(conflicArr[index]);
	    return source;
	  }
	}
	function InitTraitsConflict() {
	  return __async$2(this, null, function* () {
	    Object.values(Trait.data).forEach((trait) => {
	      if (trait.conflict) {
	        trait.initConflict(trait.conflict);
	      }
	    });
	  });
	}
	const traitslist = [
	  {
	    name: ["\u76F2\u76EE", "Blind"],
	    group: "mental",
	    conflict: ["\u72C2\u70ED"],
	    des: [
	      "\u4F60\u603B\u662F\u5728\u505A\u51FA\u9519\u8BEF\u7684\u51B3\u5B9A\u3002\u4F60\u7684\u6240\u6709\u6280\u80FD\u68C0\u5B9A\u90FD\u6709-1\u51CF\u503C\u3002",
	      "You always make the wrong decision. All your skill checks have a -1 penalty."
	    ],
	    order: 2
	  },
	  {
	    name: ["\u72C2\u70ED", "Fanatic"],
	    group: "mental",
	    conflict: ["\u76F2\u76EE"],
	    des: [
	      "\u4F60\u7684\u4FE1\u4EF0\u662F\u4F60\u751F\u547D\u7684\u5168\u90E8\u3002\u4F60\u7684\u6240\u6709\u6280\u80FD\u68C0\u5B9A\u90FD\u6709+1\u52A0\u503C\u3002",
	      "Your faith is your life. All your skill checks have a +1 bonus."
	    ],
	    order: 2
	  }
	];
	const talentlist = [
	  {
	    name: ["\u7B28\u86CB", "Idiot"],
	    des: ["\u4F60\u7684\u667A\u529B\u662F-2\u3002", "Your intelligence is -2."]
	  }
	];

	var __async$1 = (__this, __arguments, generator) => {
	  return new Promise((resolve, reject) => {
	    var fulfilled = (value) => {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var rejected = (value) => {
	      try {
	        step(generator.throw(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
	    step((generator = generator.apply(__this, __arguments)).next());
	  });
	};
	function TraitList() {
	  return __async$1(this, null, function* () {
	    let list = [];
	    let conflict = [];
	    let loadjson = yield getTraitJson();
	    slog("log", `Get file list from json`, loadjson);
	    if (loadjson) {
	      list = list.concat(loadjson.list);
	      conflict = conflict.concat(loadjson.conflict);
	    }
	    for (const cf of conflict) {
	      for (const name of cf) {
	        const trait = list.find((trait2) => trait2.name.includes(name));
	        if (!trait)
	          continue;
	        if (!(trait == null ? void 0 : trait.conflict)) {
	          trait.conflict = [];
	        }
	        trait.conflict = trait.conflict.concat(cf.delete(name));
	        trait.conflict = [...new Set(trait.conflict)];
	      }
	    }
	    D.traits = D.traits.concat(list);
	    Trait.init();
	    InitTraitsConflict();
	    setTimeout(() => {
	      delete D.traits;
	    }, 2e3);
	  });
	}
	function getTraitJson() {
	  return __async$1(this, null, function* () {
	    let list = [];
	    let conflict = [];
	    const filesData = yield getJson("./data/traits.json").then((res) => {
	      slog("log", "Get file list from traits.json:", res);
	      return res;
	    });
	    if (filesData) {
	      filesData.forEach(([filename, trait]) => {
	        dlog("log", "Get traits from " + filename, trait);
	        if (filename.includes("conflict")) {
	          if (!Array.isArray(trait)) {
	            slog("warn", "Error: format error, skip this file. conflict file must be array:", trait);
	          }
	          conflict = conflict.concat(trait);
	        } else if (Array.isArray(trait)) {
	          if (trait.length === 0) {
	            slog("warn", "Error: format error, skip this file. trait file must be array and not empty:", trait);
	          }
	          if (trait[0].name && trait[0].group && trait[0].des) {
	            list = list.concat(trait);
	          } else {
	            slog("warn", "Error: format error, skip this file:", trait);
	          }
	        }
	      });
	      dlog("log", "Get all the list done:", list, conflict);
	    }
	    return { list, conflict };
	  });
	}

	const modules$3 = {
	  name: "Traits",
	  version: "1.0.0",
	  des: "A module for trait system.",
	  data: {
	    traits: traitslist,
	    talents: talentlist
	  },
	  database: Trait.data,
	  classObj: {
	    Trait,
	    Talent
	  },
	  func: {
	    findConflic,
	    Init: {
	      Traitlist: TraitList
	    }
	  },
	  config: {
	    globalFunc: {
	      findConflic
	    },
	    globaldata: true
	  },
	  Init: ["Traitlist"]
	};
	addModule(modules$3);

	class Items {
	  static newId(group, name, cate) {
	    if (cate) {
	      return `${cate}_${name[1].replace(/\s/g, "") || name[0]}`;
	    } else {
	      return `${group}_${name[1] || name[0]}`;
	    }
	  }
	  static getByName(group, name) {
	    return Array.from(Db.Items[group]).find(
	      (item) => item[1].name[0] === name || item[1].name[1] === name
	    );
	  }
	  static getTypelist(group, cate) {
	    return Array.from(Db[group]).filter((item) => item[1].category === cate);
	  }
	  static get(Itemid) {
	    const itemGroup = Itemid.split("_")[0];
	    return Array.from(Db.Items[itemGroup]).find((item) => item[0] === Itemid);
	  }
	  constructor(obj = {}) {
	    const { group, category } = obj;
	    this.id = Items.newId(group, category);
	    for (let key in obj) {
	      if (key == "sourceMethod" || key == "source") {
	        continue;
	      }
	      this[key] = obj[key];
	    }
	  }
	  Price(num) {
	    this.price = num;
	    return this;
	  }
	  Durable(num) {
	    this.durable = [num, num];
	    return this;
	  }
	  Shop(...shops) {
	    this.shop = shops;
	    return this;
	  }
	  Tags(...tags) {
	    this.tags = tags;
	    return this;
	  }
	  Stats(...stats) {
	    stats.forEach(([key, add]) => {
	      this.stats[key] = add;
	    });
	    return this;
	  }
	  Source(...palam) {
	    palam.forEach(([key, m, v]) => {
	      this.source[key] = { m, v };
	    });
	    return this;
	  }
	  Method(method) {
	    this.method = method;
	    return this;
	  }
	}
	Items.data = [];

	class Clothes extends Items {
	  constructor(category, name, des, gender2 = "n") {
	    super({ name, des, group: "clothes", category });
	    this.gender = gender2;
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
	    this.uid = random(1e5, 999999).toString();
	    return this;
	  }
	  Color(colorcode, colorname) {
	    this.color = [colorcode, colorname];
	    return this;
	  }
	  Cover(...parts) {
	    this.cover = parts;
	    return this;
	  }
	  Set(key, value) {
	    this[key] = value;
	    return this;
	  }
	}

	class Recipies {
	  static new(id, obj) {
	    Db.Items["recipies"].set(id, new Recipies(obj));
	  }
	  static getByName(itemname) {
	    const itemId = Items.getByName("items", itemname).id;
	    return Array.from(Db.Items["Recipies"]).find((recipie) => recipie.resultItemId === itemId);
	  }
	  static getBySrcName(itemname) {
	    const itemId = Items.getByName("items", itemname).id;
	    return Array.from(Db.Items["Recipies"]).find((recipie) => recipie.require.includes(itemId));
	  }
	  constructor(obj = {}) {
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
	class Potion extends Items {
	  constructor(obj = {}) {
	    const { name, des, type } = obj;
	    super({ name, des, group: "items", category: "potion" });
	    this.type = type;
	  }
	  Daily(num) {
	    this.daily = num;
	    return this;
	  }
	  Lifetime(num) {
	    this.lifetime = num;
	    return this;
	  }
	  EffectsDecrease(num) {
	    this.effectsDecrease = num;
	    return this;
	  }
	  SpecialEffects(str) {
	    this.specialEffects = str;
	    return this;
	  }
	}
	class SexToy extends Items {
	  constructor(obj = {}) {
	    const { name, des } = obj;
	    super({ name, des, group: "accessory", category: "sextoy" });
	  }
	  Switchable() {
	    this.switchable = true;
	    return this;
	  }
	  SpecialEffects(str) {
	    this.specialEffects = str;
	    return this;
	  }
	}

	var __async = (__this, __arguments, generator) => {
	  return new Promise((resolve, reject) => {
	    var fulfilled = (value) => {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var rejected = (value) => {
	      try {
	        step(generator.throw(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
	    step((generator = generator.apply(__this, __arguments)).next());
	  });
	};
	const itemGroup = ["weapon", "shield", "armor", "clothes", "accessory", "items", "material", "recipies", "books"];
	itemGroup.forEach((group) => {
	  Items.data[group] = /* @__PURE__ */ new Map();
	});
	function loadItems() {
	  return __async(this, null, function* () {
	    const filesdata = yield getJson("./data/items.json").then((res) => {
	      slog("log", "Items loaded:", res);
	      return res;
	    });
	    if (filesdata) {
	      filesdata.forEach(([filename, filedata]) => {
	        dlog("log", "Loading items from:", filename);
	        filedata.forEach((data) => {
	          const { name, group, category, source, sourceMethod } = data;
	          const id = Items.newId(group, name, category);
	          Db.Items[group].set(id, new Items(data));
	          const idata = Db.Items[group].get(id);
	          idata.source = {};
	          if (source) {
	            for (let i in source) {
	              if (typeof source[i] === "number") {
	                idata.source[i] = { v: source[i], m: sourceMethod };
	              } else {
	                idata.source[i] = source[i];
	              }
	            }
	          }
	        });
	      });
	    }
	    slog("log", "All items loaded:", Db.Items);
	  });
	}
	const modules$2 = {
	  name: "Items",
	  version: "1.0.0",
	  des: "A module for items system.",
	  data: {
	    itemGroup
	  },
	  database: Items.data,
	  classObj: {
	    Items,
	    Clothes,
	    Potion,
	    SexToy,
	    Recipies
	  },
	  func: {
	    Init: {
	      loadItems
	    }
	  },
	  Init: ["loadItems"]
	};
	addModule(modules$2);

	const bodyDict = {
	  head: "\u5934\u90E8",
	  eyes: "\u53CC\u773C",
	  eyeL: "\u5DE6\u773C",
	  eyeR: "\u53F3\u773C",
	  eye: "\u773C\u775B",
	  ears: "\u8033\u6735",
	  earL: "\u5DE6\u8033",
	  earR: "\u53F3\u8033",
	  ear: "\u8033\u6735",
	  face: "\u9762\u90E8",
	  nose: "\u9F3B\u5B50",
	  mouth: "\u5634\u5DF4",
	  hairs: "\u5934\u53D1",
	  hair: "\u5934\u53D1",
	  brain: "\u5927\u8111",
	  beak: "\u5599",
	  neck: "\u8116\u5B50",
	  shoulders: "\u80A9\u90E8",
	  shoulderL: "\u5DE6\u80A9",
	  shoulderR: "\u53F3\u80A9",
	  shoulder: "\u80A9\u90E8",
	  arms: "\u624B\u81C2",
	  armL: "\u5DE6\u81C2",
	  armR: "\u53F3\u81C2",
	  arm: "\u624B\u81C2",
	  hands: "\u53CC\u624B",
	  handL: "\u5DE6\u624B",
	  handR: "\u53F3\u624B",
	  hand: "\u624B",
	  wrists: "\u624B\u8155",
	  wristL: "\u5DE6\u624B\u8155",
	  wristR: "\u53F3\u624B\u8155",
	  wrist: "\u624B\u8155",
	  fingers: "\u624B\u6307",
	  finger: "\u624B\u6307",
	  torso: "\u80F4\u4F53",
	  body: "\u8EAB\u4F53",
	  top: "\u4E0A\u8EAB",
	  organ: "\u5668\u5B98",
	  organs: "\u5668\u5B98",
	  slimebody: "\u53F2\u83B1\u59C6\u8EAB",
	  snakebody: "\u86C7\u8EAB",
	  tailbody: "\u5C3E\u8EAB",
	  hoursebody: "\u9A6C\u8EAB",
	  abdomen: "\u8179\u90E8",
	  belly: "\u809A\u5B50",
	  back: "\u80CC\u90E8",
	  waist: "\u8170\u90E8",
	  chest: "\u80F8\u8154",
	  nipple: "\u4E73\u5934",
	  breasts: "\u80F8\u90E8",
	  breastL: "\u5DE6\u80F8",
	  breastR: "\u53F3\u80F8",
	  breast: "\u80F8\u90E8",
	  heart: "\u5FC3\u810F",
	  hearts: "\u5FC3\u810F",
	  lung: "\u80BA",
	  lungs: "\u80BA\u90E8",
	  lungL: "\u5DE6\u80BA",
	  lungR: "\u53F3\u80BA",
	  liver: "\u809D",
	  stomach: "\u80C3",
	  intestine: "\u80A0\u9053",
	  bladder: "\u8180\u80F1",
	  ovary: "\u5375\u5DE2",
	  testicles: "\u777E\u4E38",
	  testicle: "\u777E\u4E38",
	  prostate: "\u524D\u5217\u817A",
	  uetrus: "\u5B50\u5BAB",
	  womb: "\u5B50\u5BAB",
	  fetus: "\u80CE\u513F",
	  bottom: "\u4E0B\u8EAB",
	  groin: "\u8179\u80A1\u6C9F",
	  crotch: "\u88C6\u90E8",
	  privates: "\u79C1\u5904",
	  private: "\u79C1\u5904",
	  genital: "\u751F\u6B96\u5668",
	  genitals: "\u751F\u6B96\u5668",
	  clitoris: "\u9634\u8482",
	  anal: "\u809B\u95E8",
	  penis: "\u9634\u830E",
	  vagina: "\u9634\u9053",
	  anus: "\u809B\u95E8",
	  urin: "\u5C3F\u9053",
	  urinary: "\u5C3F\u9053",
	  urethral: "\u5C3F\u9053\u53E3",
	  hips: "\u81C0\u90E8",
	  butts: "\u5C41\u80A1",
	  buttL: "\u5DE6\u81C0",
	  buttR: "\u53F3\u81C0",
	  thighs: "\u5927\u817F",
	  thighL: "\u5DE6\u5927\u817F",
	  thighR: "\u53F3\u5927\u817F",
	  thigh: "\u5927\u817F",
	  legs: "\u817F\u90E8",
	  legL: "\u5DE6\u817F",
	  legR: "\u53F3\u817F",
	  leg: "\u817F",
	  feet: "\u53CC\u811A",
	  footL: "\u5DE6\u811A",
	  footR: "\u53F3\u811A",
	  foot: "\u811A",
	  hoofs: "\u53CC\u8E44",
	  hoof: "\u8E44",
	  hoofL: "\u5DE6\u8E44",
	  hoofR: "\u53F3\u8E44",
	  ankles: "\u811A\u8E1D",
	  ankleL: "\u5DE6\u811A\u8E1D",
	  ankleR: "\u53F3\u811A\u8E1D",
	  wings: "\u7FC5\u8180",
	  wingL: "\u5DE6\u7FFC",
	  wingR: "\u53F3\u7FFC",
	  horns: "\u89D2",
	  horn: "\u89D2",
	  hornL: "\u5DE6\u89D2",
	  hornR: "\u53F3\u89D2",
	  tails: "\u5C3E\u5DF4",
	  tail: "\u5C3E\u5DF4",
	  tentacles: "\u89E6\u624B",
	  skin: "\u76AE\u80A4",
	  fur: "\u76AE\u6BDB",
	  furs: "\u76AE\u6BDB"
	};
	const bodyGroup = [
	  "organs",
	  "bottom",
	  "genital",
	  "privates",
	  "belly",
	  "abdomen",
	  "chest",
	  "waist",
	  "back",
	  "top",
	  "chest"
	];
	const posDict = {
	  s: "side",
	  l: "left",
	  r: "right",
	  f: "front",
	  b: "back",
	  t: "top",
	  d: "bottom",
	  c: "center",
	  e: "end",
	  i: "inside",
	  o: "outside",
	  rt: "root"
	};
	const Psize = [
	  { l: [40, 60], d: [10, 20] },
	  { l: [60, 90], d: [20, 36] },
	  { l: [90, 134], d: [30, 48] },
	  { l: [130, 152], d: [40, 52] },
	  { l: [150, 170], d: [42, 58] },
	  { l: [164, 184], d: [54, 70] },
	  { l: [176, 210], d: [64, 90] },
	  { l: [200, 250], d: [72, 100] },
	  { l: [250, 400], d: [90, 148] }
	];
	const bodysize = [
	  [1300, 1450],
	  [1450, 1600],
	  [1600, 1750],
	  [1750, 1900],
	  [1900, 2050],
	  [2050, 2200]
	];
	const existency = ["natural", "ionic", "slime", "artifact", "hideable", "none", "invisible"];

	const species = {
	  human: ["\u4EBA\u7C7B", "Human"],
	  elvin: ["\u7CBE\u7075", "Elvin"],
	  deamon: ["\u9B54\u4EBA", "Half Deamon"],
	  wolves: ["\u72FC\u4EBA", "Wolves"],
	  drawf: ["\u77EE\u4EBA", "Drawf"],
	  goblin: ["\u5730\u7CBE", "Goblin"],
	  catvinx: ["\u72D0\u732B", "Catvinx"],
	  centaur: ["\u9A6C\u5934\u4EBA", "Centaur"],
	  bestiary: ["\u517D\u5316\u4EBA", "Bestiary Human"],
	  orc: ["\u5965\u514B\u4EBA", "Orc"],
	  titan: ["\u5DE8\u4EBA", "Titan"],
	  dracon: ["\u9F99\u4EBA", "Dracon"],
	  kijin: ["`\u9B3C\u4EBA", "Kijin"]
	};

	function fixLanArr(obj) {
	  const lang = ["CN", "EN", "JP"];
	  let result = [];
	  for (const [key, value] of Object.entries(obj)) {
	    if (Array.isArray(value) && value[0].lan) {
	      value.forEach((obj2) => {
	        const i = lang.indexOf(obj2.lan);
	        delete obj2.lan;
	        let k = Object.keys(obj2)[0];
	        result[i] = obj2[k];
	      });
	      obj[key] = result;
	      result = [];
	    }
	  }
	}
	function initBodyObj(body) {
	  const bodytype = body.type;
	  const fixkey = function(obj, key) {
	    if (obj[key] && Array.isArray(obj[key])) {
	      obj.parts = obj[key];
	      delete obj[key];
	    } else if (obj[key] && typeof obj[key] === "string") {
	      obj.name = obj[key];
	      delete obj[key];
	    }
	  };
	  const fillObj = function(obj, key, parent) {
	    if (groupmatch(key, "group", "option", "sens", "size", "config", "setting", "tags"))
	      return;
	    if (!obj.name)
	      obj.name = key;
	    if ((parent == null ? void 0 : parent.name) && !obj.group)
	      obj.group = parent.name;
	    if (!obj.type)
	      obj.type = (parent == null ? void 0 : parent.type) || bodytype || "natural";
	    if (!obj.count && key !== "organs")
	      obj.count = 1;
	  };
	  const fixObj = function(obj) {
	    for (let [key, value] of Object.entries(obj)) {
	      if (typeof value === "string" && posDict[value]) {
	        obj[key] = posDict[value];
	      } else if (typeof value === "string" && value.includes("/")) {
	        let side = value.split("/");
	        side = side.map((s) => posDict[s]);
	        obj[key] = side;
	      } else if (typeof value === "object" && !Array.isArray(value)) {
	        let v = value;
	        fixkey(v, key);
	        fillObj(v, key, obj);
	        fixObj(value);
	      } else {
	        obj[key] = value;
	      }
	    }
	  };
	  fixObj(body);
	  body.parts = listAllParts(body);
	  body.settings = {};
	  for (const [key, value] of Object.entries(body)) {
	    if (bodyDict[key]) {
	      body.settings[key] = value;
	      delete body[key];
	    }
	  }
	  return body;
	}
	function listAllParts(obj) {
	  let parts = Object.keys(obj);
	  const listObj = function(obj2) {
	    for (let key in obj2) {
	      let value = obj2[key];
	      if (value.parts) {
	        parts = parts.concat(value.parts);
	      }
	      if (typeof value === "object" && !Array.isArray(value)) {
	        parts = parts.concat(Object.keys(value));
	        listObj(value);
	      }
	    }
	  };
	  listObj(obj);
	  parts = [...new Set(parts)];
	  parts = parts.filter((part) => bodyDict.hasOwnProperty(part) && !bodyGroup.includes(part));
	  return parts;
	}
	function InitSpecies() {
	  let xml = scEra.xml;
	  xml.forEach((value, key) => {
	    if (key.includes("Species")) {
	      let obj = value.race;
	      fixLanArr(obj);
	      Species.data[obj.id] = new Species(obj);
	    }
	  });
	  slog("log", "All Species Loaded: ", Species.data);
	}

	var __defProp = Object.defineProperty;
	var __getOwnPropSymbols = Object.getOwnPropertySymbols;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __propIsEnum = Object.prototype.propertyIsEnumerable;
	var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
	var __spreadValues = (a, b) => {
	  for (var prop in b || (b = {}))
	    if (__hasOwnProp.call(b, prop))
	      __defNormalProp(a, prop, b[prop]);
	  if (__getOwnPropSymbols)
	    for (var prop of __getOwnPropSymbols(b)) {
	      if (__propIsEnum.call(b, prop))
	        __defNormalProp(a, prop, b[prop]);
	    }
	  return a;
	};
	class Organs {
	  constructor(obj) {
	    if (!isValid(obj)) {
	      slog("warn", "Invalid organs object:", obj);
	      return;
	    }
	    const { type, pos, group, name } = obj;
	    this.name = name;
	    this.type = type;
	    this.pos = pos;
	    this.group = group;
	    this.initSexStats(name);
	    this.init(obj);
	    if (!this.hediff)
	      this.hediff = [];
	  }
	  init(obj) {
	    const { side, count, size, sens, shape, trait } = obj;
	    if (side)
	      this.side = side;
	    if (count)
	      this.count = count;
	    if (size)
	      this.sizeLv = size.default;
	    if (sens)
	      this.sens = sens.default;
	    if (typeof shape === "string")
	      this.shape = shape;
	    if (trait)
	      this.initTrait(trait);
	    const { adj } = obj;
	    if (adj) {
	      this.initStats(adj);
	    }
	  }
	  initSexStats(part) {
	    switch (part) {
	      case "vagina":
	      case "anus":
	      case "penis":
	      case "urethral":
	        if (!this.size)
	          this.size = [0, 0];
	      case "mouth":
	      case "clitoris":
	        if (!this.size)
	          this.size = 0;
	      case "breasts":
	        if (!this.sizeLv)
	          this.sizeLv = 0;
	        if (!this.sens)
	          this.sens = 0;
	        break;
	    }
	    return this;
	  }
	  initStats(adj) {
	    const { sens, d, l, size, trait } = adj;
	    if (sens)
	      this.sens = sens;
	    if (d)
	      this.size[0] = d;
	    if (l)
	      this.size[1] = l;
	    if (size)
	      this.sizeLv = size;
	    if (adj.trait)
	      this.initTrait(trait);
	    return this;
	  }
	  initProduce(config) {
	    this.produce = config.type;
	    if (!(config.amountPerDay || config.volumePerSize || config.volume))
	      return this;
	    this.volume = { cur: 0 };
	    const { volume = 0, amountPerDay = 0, volumePerSize = 0 } = config;
	    this.volume.day = amountPerDay;
	    this.volume.max = volume || volumePerSize * (this.sizeLv || 1);
	    return this;
	  }
	  initCapacity(config, size) {
	    if (!this.capacity) {
	      this.capacity = [0, 0];
	    }
	    if (config.default) {
	      this.capacity[1] = config.default;
	    }
	    if (config.scale) {
	      this.capacity[1] = size * config.scale;
	    }
	    return this;
	  }
	  initTrait(config) {
	    if (!this.trait) {
	      this.trait = [];
	    }
	    if (typeof config === "string") {
	      this.trait.push(config);
	    } else if (Array.isArray(config)) {
	      this.trait.push(...config);
	    }
	    return this;
	  }
	  initClitoris(BodyRatio) {
	    this.size = this.sizeLv + BodyRatio;
	    return this;
	  }
	  initMouth(height) {
	    this.size = Organs.MouthDiameter(height, this.sizeLv);
	    return this;
	  }
	  initUrethral(gender, config, height) {
	    const option = this.group;
	    if (typeof option === "object" && option[gender]) {
	      this.group = option[gender];
	    }
	    this.initCapacity(config, height);
	    if (this.group === "penis") {
	      this.capacity[1] /= 5;
	    }
	    return this;
	  }
	  initUrethralSize(height, penis) {
	    switch (this.group) {
	      case "penis":
	        if (!penis) {
	          slog(
	            "error",
	            "Caught error on init urethral size. the urethral depent on penis, but not penis data found:",
	            this,
	            penis
	          );
	          return;
	        }
	        this.size[0] = Organs.UrethralDiameter(penis.size[0], this.sizeLv);
	        this.size[1] = Math.floor(penis.size[1] * 1.2 + 0.5);
	        break;
	      default:
	        this.size[0] = Organs.UrethralGeneralDiameter(height, this.sizeLv);
	        this.size[1] = Organs.UrethralGeneralDepth(height);
	    }
	    return this;
	  }
	  initVagina(height, config) {
	    this.size[0] = Organs.VagiDiameter(height, this.sizeLv);
	    this.size[1] = Organs.VagiDepth(height);
	    this.initCapacity(config, height);
	    return this;
	  }
	  initAnal(height, config) {
	    this.size[0] = Organs.AnalDiameter(height, this.sizeLv);
	    this.size[1] = Organs.AnalDepth(height);
	    if (config == null ? void 0 : config.trait)
	      this.trait = config.trait;
	    this.initCapacity(config, height);
	    return this;
	  }
	  initPenis(scale = 1) {
	    const size = D.Psize[this.sizeLv];
	    const d = random(size.d[0], size.d[1]) + random(8);
	    const l = random(size.l[0], size.l[1]) + random(8);
	    if (!this.size[0])
	      this.size[0] = d * scale;
	    if (!this.size[1])
	      this.size[1] = l * scale;
	    return this;
	  }
	  static theoriticalMaxiumHoleSize(height) {
	    return height / 10 * 0.9;
	  }
	  static strechLevelSize(height) {
	    return this.theoriticalMaxiumHoleSize(height) / 12;
	  }
	  static VagiDiameter(height, sizeLv) {
	    const max = this.strechLevelSize(height) * 1.1;
	    return Math.floor(max + sizeLv * max) + random(-2, 2);
	  }
	  static VagiDepth(height) {
	    return Math.floor(height / 21 + 0.5) + random(-4, 8);
	  }
	  static AnalDiameter(height, sizeLv) {
	    const max = this.strechLevelSize(height);
	    return Math.floor(max + sizeLv * max) + random(-2, 2);
	  }
	  static AnalDepth(height) {
	    return Math.floor(height / 12 + 0.5) + random(-4, 8);
	  }
	  static MaxUrethralSize(height) {
	    return this.theoriticalMaxiumHoleSize(height) / 4;
	  }
	  static UrethralStrechLevelSize(height) {
	    return this.MaxUrethralSize(height) / 12;
	  }
	  static UrethralGeneralDiameter(height, sizeLv) {
	    const max = this.UrethralStrechLevelSize(height);
	    return Math.floor(max + sizeLv * max) + random(-2, 4) / 10;
	  }
	  static UrethralGeneralDepth(height) {
	    return Math.floor(height / 30) + random(-4, 8);
	  }
	  static UrethralDiameter(penisDiameter, sizeLv) {
	    const max = penisDiameter * 0.8 / 12;
	    return Math.floor(max + sizeLv * max) + random(-2, 2) / 10;
	  }
	  static MouthDiameter(height, sizeLv) {
	    const multip = 1 + sizeLv * 0.15;
	    return Math.floor(height / 40 * multip) + random(10);
	  }
	  static addHediff(organ, type, hediff) {
	    organ.hediff.push(__spreadValues({ type }, hediff));
	    return organ;
	  }
	}

	class Species {
	  static get(name, type, ...args) {
	    const data = this.data[name];
	    if (type === "buffs" && data.speciesBuffs) {
	      if (args[0] && data.speciesBuffs[args[0]]) {
	        return data.speciesBuffs[args[0]];
	      } else if (args[0]) {
	        slog("warn", "Caught Error on Species.get, no such buff", name, args[0]);
	      }
	      return data.speciesBuffs;
	    }
	    if (type && data[type]) {
	      return data[type];
	    } else if (type) {
	      slog("warn", "Caught Error on Species.get, no such type", name, type);
	    }
	    if (data) {
	      return data;
	    } else {
	      slog("warn", "Caught Error on Species.get, no such species", name);
	    }
	  }
	  constructor(obj) {
	    const {
	      type,
	      name,
	      des,
	      gender = ["male", "female"],
	      talent = [],
	      buffs = {},
	      bodysize = { scale: 1, min: 1300, max: 2e3 },
	      trait = [],
	      skill = []
	    } = obj;
	    this.type = type;
	    this.name = name;
	    this.des = des;
	    this.availableGender = gender;
	    this.speciesTalent = talent;
	    this.speciesTraits = trait;
	    this.speciesSkill = skill;
	    this.speciesBuffs = buffs;
	    this.bodyScale = bodysize.scale;
	    this.bodyheight = [bodysize.min, bodysize.max];
	    const { cycle, threesize, bodygroup } = obj;
	    const list = ["id", "basicStats", "avatar", "temper", "lifespan", "produce"];
	    list.forEach((item) => {
	      if (obj[item]) {
	        this[item] = obj[item];
	      }
	    });
	    if (cycle)
	      this.cycleInfo = cycle;
	    if (threesize)
	      this.threeSizeScale = threesize;
	    const ignore = Object.keys(this);
	    ignore.push("bodygroup", "bodysize", "threesize", "cycle", "gender", "talent", "buffs", "trait", "skill");
	    this.options = {};
	    for (let key in obj) {
	      if (ignore.includes(key))
	        continue;
	      this.options[key] = obj[key];
	    }
	    this.initBody(bodygroup);
	  }
	  Options(key, obj) {
	    this.options[key] = obj;
	    return this;
	  }
	  InitFunc(callback) {
	    this.initFunc = callback;
	    return this;
	  }
	  initBody(body) {
	    this.bodyConfig = initBodyObj(body);
	  }
	  initTalent() {
	    if (!this.speciesTalent || !this.speciesTalent.length)
	      return;
	    const talent = [];
	    for (const t of this.speciesTalent) {
	      if (Math.random() < t.rate) {
	        talent.push(t.name);
	      }
	    }
	    return talent;
	  }
	  initTraits() {
	    if (!this.speciesTraits || !this.speciesTraits.length)
	      return;
	    const traits = [];
	    for (const t of this.speciesTraits) {
	      if (Math.random() < t.rate) {
	        traits.push(t.name);
	      }
	    }
	    return traits;
	  }
	  initSkill() {
	    if (!this.speciesSkill || !this.speciesSkill.length)
	      return;
	    const skill = [];
	    for (const t of this.speciesSkill) {
	      if (Math.random() < t.rate) {
	        skill.push(t.name);
	      }
	    }
	    return skill;
	  }
	  configureBody(gender, height, adj) {
	    const body = {};
	    const set = clone(this.bodyConfig.settings);
	    for (const key in this.produce) {
	      if (set[key]) {
	        set[key].produce = this.produce[key];
	      }
	    }
	    if (adj) {
	      for (const key in adj) {
	        if (set[key]) {
	          set[key].adj = adj[key];
	        }
	      }
	    }
	    for (const key in set) {
	      const part = set[key];
	      if (gender == "female" && groupmatch(key, "penis", "prostate", "testicles")) {
	        continue;
	      }
	      if (gender == "male" && groupmatch(key, "vagina", "clitoris", "uterus")) {
	        continue;
	      }
	      if (gender == "herm") {
	        if (key == "clitoris" && !part.herm)
	          continue;
	        if (key == "prostate" && !part.herm)
	          continue;
	        if (key == "testicles" && !part.herm)
	          continue;
	      }
	      body[key] = new Organs(part);
	      switch (key) {
	        case "vagina":
	          body[key].initVagina(height, part);
	          break;
	        case "anus":
	          body[key].initAnal(height, part);
	          break;
	        case "penis":
	          body[key].initPenis((part == null ? void 0 : part.scale) || 1);
	          break;
	        case "urethral":
	          body[key].initUrethral(gender, part, height);
	          break;
	        case "mouth":
	          body[key].initMouth(height);
	          break;
	        case "clitoris":
	          body[key].initClitoris(BodyRatio(height));
	          break;
	      }
	      if (part.produce && key !== "penis") {
	        body[key].initProduce(part.produce);
	      }
	      if (part.capacity && !body[key].capacity) {
	        body[key].initCapacity(part.capacity, height);
	      }
	    }
	    if (body.urethral) {
	      body.urethral.initUrethralSize(height, body.penis);
	    }
	    if (body.penis) {
	      fixPenisProduce(body.penis, this.id);
	    }
	    return body;
	  }
	  GenerateBust(height, gender, cup) {
	    const r = gender == "male" ? 0.61 : 0.51;
	    const standard = height * r + random(-5, 5);
	    const cupsize = standard / 12 * cup;
	    let result = cupsize + standard * (this.threeSizeScale.bust || 1);
	    return result.fixed(2);
	  }
	  GenerateWaist(height, gender) {
	    const r = gender == "male" ? 0.4 : 0.42;
	    const standard = height * r + random(-5, 5);
	    let result = standard * (this.threeSizeScale.waist || 1);
	    return result.fixed(2);
	  }
	  GenerateHip(height, gender) {
	    const r = gender == "male" ? 0.51 : 0.54;
	    const standard = height * r + random(-5, 5);
	    let result = standard * (this.threeSizeScale.hip || 1);
	    return result.fixed(2);
	  }
	}
	Species.data = {};

	function GenerateHeight(size, scale = 1) {
	  if (typeof size !== "number") {
	    size = random(5);
	  }
	  const r = D.bodysize[size];
	  const height = random(r[0], r[1]) + random(30);
	  return height * scale;
	}
	function GenerateWeight(height) {
	  const r = height / 1e3;
	  const BMI = 19 + random(-2, 4);
	  return Math.floor(r * r * BMI + 0.5) + random(30) / 10;
	}
	function BodyRatio(height) {
	  const select = new SelectCase();
	  select.case([240, 800], 3.5).case([800, 1240], 4).case([1300, 1400], 4.5).case([1400, 1500], 5).case([1500, 1660], 6).case([1660, 1740], 6.5).case([1740, 1800], 7).else(7.5);
	  return select.has(height);
	}
	function BodySizeCalc(height) {
	  return Math.floor((height / this.bodyScale - 1300) / 1500);
	}
	function HeadSize(height) {
	  return height / BodyRatio(height);
	}
	function fixPenisProduce(p, species) {
	  if (!p)
	    return;
	  let r;
	  if (species) {
	    r = Species.data[species];
	  }
	  if (!p.produce) {
	    p.produce = "cum";
	    p.volume = { cur: 0, day: 0, max: 0 };
	  }
	  p.volume.max = Math.floor(p.size[0] * p.size[1] / 360) * 10;
	  p.volume.max += (p.sizeLv + 1) * (r.produce.penis.volumePerSize || 50);
	  if (p.trait && p.trait.has("ThickCum"))
	    p.volume.max *= 3;
	  p.volume.day = r.produce.penis.volumePerSize || 10;
	}
	function setCycle(chara) {
	  if (!chara.pregnancy) {
	    initCycle(chara);
	  }
	  const { cycle } = chara.pregnancy;
	  let len, day;
	  len = cycle.cycleDays + random(cycle.rng);
	  day = cycle.stageDays;
	  cycle.lastCircleDays = cycle.cycleDays;
	  cycle.stages = [0, len - day, len + 0.5];
	  console.log(chara.pregnancy);
	}
	function initParasite(chara) {
	  chara.parasite = {
	    maxslot: 6,
	    type: "",
	    aware: false,
	    intestinal: []
	  };
	}
	function initCycle(chara) {
	  var _a;
	  const r = (_a = Species) == null ? void 0 : _a.data[chara.species];
	  let info, len = [24, 36], day = [3, 5], rng = [0, 3], frng = [0, 2], ovul = 1, type = "menst";
	  if (r) {
	    info = r.cycleInfo;
	    type = info.type;
	    len = info.cycleDays;
	    rng = info.cycleRng;
	    day = info.baseDays;
	    ovul = info.ovulateNum;
	    frng = info.ovulateRng;
	  }
	  if (!chara.pregnancy) {
	    chara.pregnancy = {
	      womb: {
	        maxslot: info.wombSlot || 3,
	        state: "normal",
	        aware: false,
	        fetus: []
	      },
	      bellysize: 0,
	      sperm: []
	    };
	    if (chara.gender != "male") {
	      chara.pregnancy.cycle = {
	        type,
	        cycleDays: random(len[0], len[1]),
	        stageDays: random(day[0], day[1]),
	        rng: random(rng[0], rng[1]),
	        current: 0,
	        state: "normal",
	        running: true,
	        stages: [],
	        ovulate: ovul,
	        frng: random(frng[0], frng[1]),
	        lastCircleDays: 0
	      };
	    }
	  }
	}
	function RandomSpeciesName(species) {
	  return lan(draw(D.randomCharaNamePool));
	}

	class Creature {
	  static newId(species) {
	    const len = Object.keys(Creature.data).length;
	    return `${species}_${len}`;
	  }
	  constructor(obj = {}) {
	    const { type = "charatemplate", species = "human" } = obj;
	    this.type = type;
	    this.species = species;
	    this.id = Creature.newId(species);
	    this.name = "";
	    this.gender = "none";
	    this.traits = [];
	    this.talent = [];
	    this.skill = [];
	    this.stats = {};
	    this.base = {};
	    this.palam = {};
	    this.appearance = {};
	    this.body = {};
	    this.bodysize = 1;
	    this.source = {};
	    this.state = [];
	    this.tsv = {};
	    this.abl = {};
	    this.sbl = {};
	  }
	  Init(obj = {}) {
	    const { name = "", gender = "" } = obj;
	    console.log("init creature:", obj);
	    this.r = Species.data[this.species];
	    this.name = name;
	    if (gender) {
	      this.gender = gender;
	    } else {
	      let g = ["female", "herm", "male"];
	      this.gender = g[random(2)];
	    }
	    if (!this.name) {
	      if (!this.r)
	        this.name = lan(draw(D.randomCharaNamePool));
	      else
	        this.name = RandomSpeciesName(this.species);
	      this.randomchara = true;
	    }
	    this.InitCommon();
	    if (this.r) {
	      this.initSpecies(obj);
	    }
	    if (this.randomchara) {
	      this.RandomInitDefault();
	    }
	    $(document).trigger(":initCreature", [this, obj]);
	    return this;
	  }
	  InitCommon() {
	    this.initStats();
	    this.initBase();
	    this.initPalam();
	    this.initAbility();
	    this.initEquipment();
	  }
	  RandomInitDefault() {
	    this.randomStats();
	    this.randomAbility();
	    this.randomSituAbility();
	    if (!this.r) {
	      this.RandomInitBody();
	      this.RandomInitApp();
	    } else {
	      let adj = {
	        bodysize: random(5),
	        breasts: {
	          sizeLv: this.gender === "male" ? 0 : random(10),
	          penis: { sizeLv: this.gender === "female" ? 0 : random(7) }
	        }
	      };
	      this.initSpecies(adj);
	    }
	  }
	  initSpecies(obj = {}) {
	    this.bodysize = obj.bodysize || random(5);
	    this.initApp(obj);
	    this.body = this.r.configureBody(this.gender, this.appearance.height, obj);
	    this.initTalent(obj);
	    this.initTraits(obj);
	    this.initSkill(obj);
	    if (this.r.temper)
	      this.temper = this.r.temper;
	  }
	  initTraits(obj = {}) {
	    this.traits = this.r.initTraits() || [];
	    if (!obj.traits)
	      return;
	    if (typeof obj.traits === "string") {
	      this.traits.push(obj.traits);
	    } else if (Array.isArray(obj.traits)) {
	      this.traits = this.traits.concat(obj.traits);
	    } else {
	      slog("error", "TypeError: traits must be string or array:", obj.traits);
	    }
	  }
	  initTalent(obj = {}) {
	    this.talent = this.r.initTalent() || [];
	    if (!obj.talent)
	      return;
	    if (typeof obj.talent === "string") {
	      this.talent.push(obj.talent);
	    } else if (Array.isArray(obj.talent)) {
	      this.talent = this.talent.concat(obj.talent);
	    } else {
	      slog("error", "TypeError: talent must be string or array:", obj.talent);
	    }
	  }
	  initSkill(obj = {}) {
	    this.skill = this.r.initSkill() || [];
	    if (!obj.skill)
	      return;
	    if (typeof obj.skill === "string") {
	      this.skill.push(obj.skill);
	    } else if (Array.isArray(obj.skill)) {
	      this.skill = this.skill.concat(obj.skill);
	    } else {
	      slog("error", "TypeError: skill must be string or array:", obj.skill);
	    }
	  }
	  initApp(obj = {}) {
	    const app = this.appearance;
	    app.height = obj.height || GenerateHeight(this.bodysize);
	    app.weight = obj.weight || GenerateWeight(app.height);
	    app.beauty = 1e3;
	    const list = ["haircolor", "eyecolor", "skincolor", "hairstyle"];
	    list.forEach((key) => {
	      var _a;
	      if (obj[key])
	        app[key] = obj[key];
	      else if ((_a = this.r) == null ? void 0 : _a.avatar[key])
	        app[key] = draw(this.r.avatar[key]);
	      else
	        app[key] = draw(D[key + "Pool"]);
	    });
	  }
	  initBody(obj = {}) {
	    const size = obj.bodysize || random[5];
	    let range = D.bodysize[size];
	    this.appearance.height = obj.height || random(range[0], range[1]);
	  }
	  initBust(obj) {
	    const app = this.appearance;
	    const breast = this.body.breasts;
	    if (this.r || obj.bust)
	      app.bust = obj.bust || this.r.GenerateBust(app.height, this.gender, breast.sizeLv);
	    else
	      app.bust = Math.floor(app.height * 0.52) + random(-10, 10);
	  }
	  initWaist(obj) {
	    const app = this.appearance;
	    if (this.r || obj.waist)
	      app.waist = obj.waist || this.r.GenerateWaist(app.height, this.gender);
	    else
	      app.waist = Math.floor(app.height * 0.37) + random(-10, 10);
	  }
	  initHip(obj) {
	    const app = this.appearance;
	    if (this.r || obj.hip)
	      app.hip = obj.hip || this.r.GenerateHip(app.height, this.gender);
	    else
	      app.hip = Math.floor(app.height * 0.54) + random(-10, 10);
	  }
	  init3Size(obj = {}) {
	    this.initBust(obj);
	    this.initWaist(obj);
	    this.initHip(obj);
	  }
	  initStats() {
	    this.stats = {};
	    D.stats.forEach((key) => {
	      this.stats[key] = [10, 10];
	    });
	    return this;
	  }
	  initBase() {
	    this.base = {};
	    Object.keys(D.basicNeeds).forEach((key) => {
	      this.base[key] = [1e3, 1e3];
	    });
	    Object.keys(D.basicPalam).forEach((key) => {
	      this.base[key] = [0, 1200];
	    });
	    return this;
	  }
	  initPalam() {
	    this.palam = {};
	    this.source = {};
	    Object.keys(D.palam).forEach((key) => {
	      this.palam[key] = [0, 1200];
	      this.source[key] = 0;
	    });
	    return this;
	  }
	  initAbility() {
	    this.abl = {};
	    Object.keys(D.abl).forEach((key) => {
	      this.abl[key] = { lv: 0, exp: 0 };
	    });
	  }
	  initSituAbility() {
	    this.sbl = {};
	    Object.keys(D.sbl).forEach((key) => {
	      this.sbl[key] = 0;
	    });
	  }
	  initEquipment() {
	    this.equip = {};
	    Object.keys(D.equipSlot).forEach((key) => {
	      this.equip[key] = {};
	    });
	    return this;
	  }
	  getRandomStats(key) {
	    var _a, _b;
	    if (Species.data[this.species]) {
	      let r = Species.data[this.species].basicStats;
	      if (((_a = r[key]) == null ? void 0 : _a.min) && ((_b = r[key]) == null ? void 0 : _b.max))
	        return [r[key].min, r[key].max];
	      else if ((r == null ? void 0 : r.min) && (r == null ? void 0 : r.max))
	        return [r.min, r.max];
	    }
	    return [5, 18];
	  }
	  randomStats() {
	    D.stats.forEach((key) => {
	      const v = this.getRandomStats(key);
	      const value = random(v[0], v[1]);
	      this.stats[key] = [value, value];
	    });
	  }
	  randomAbility() {
	    Object.keys(D.abl).forEach((key) => {
	      this.abl[key].lv = random(0, 8);
	    });
	  }
	  randomSituAbility() {
	    Object.keys(D.sbl).forEach((key) => {
	      this.sbl[key] = random(0, 6);
	    });
	  }
	  RandomInitBody() {
	    this.body = {};
	    this.bodysize = random(0, 5);
	    D.basicBodypart.forEach((key) => {
	      this.body[key] = {
	        type: random(100) < 12 ? "artifact" : "natural",
	        dp: [10, 10],
	        hediff: []
	      };
	    });
	  }
	  RandomInitApp() {
	    this.appearance = {
	      eyecolor: draw(D.eyecolorPool),
	      haircolor: draw(D.haircolorPool),
	      skincolor: draw(D.skincolorPool),
	      hairstyle: draw(D.hairstylePool),
	      beauty: 1e3,
	      height: GenerateHeight(this.bodysize)
	    };
	    const app = this.appearance;
	    this.appearance.weight = GenerateWeight(app.height);
	    this.init3Size();
	  }
	  End() {
	    delete this.r;
	  }
	  Freeze() {
	    Object.freeze(this);
	  }
	}
	Creature.data = {};

	class Chara extends Creature {
	  static get(charaId) {
	    let chara = new Chara(charaId, {});
	    Object.assign(chara, Chara.data[charaId]);
	    return chara;
	  }
	  static new(CharaId, obj) {
	    let chara = new Chara(CharaId, obj).Init(obj);
	    this.data[CharaId] = chara;
	    return chara;
	  }
	  static combineName(chara) {
	    const { name, midname, surname } = chara;
	    const fullname = `${name}${midname ? "\xB7" + midname : ""}${surname ? "\xB7" + surname : ""}`.trim();
	    return fullname;
	  }
	  constructor(CharaId, obj) {
	    super(obj);
	    this.cid = CharaId;
	    if (obj.name)
	      this.name = obj.name;
	    else if (!this.name)
	      this.name = lan(draw(D.randomCharaNamePool));
	    const { midname = "", surname = "", nickname = "", callname = "" } = obj;
	    this.midname = midname;
	    this.surname = surname;
	    this.nickname = nickname;
	    this.callname = callname;
	    this.fullname = Chara.combineName(this);
	    const { title = "", guildRank = 0, position = "any" } = obj;
	    this.title = title;
	    this.class = obj.class || "common";
	    this.guildRank = guildRank;
	    this.birthday = obj.birthday || [S.startyear - 20, 1, 1];
	    this.mood = 50;
	    this.intro = obj.intro || [lan("\u89D2\u8272\u7B80\u4ECB", "CharaIntro"), lan("\u89D2\u8272\u7B80\u4ECB", "CharaIntro")];
	    this.position = position;
	    this.mark = {};
	    this.exp = {};
	    this.expUp = {};
	    this.virginity = {};
	    this.relation = {};
	    this.flag = {};
	    this.wallet = 1e3;
	    this.debt = 0;
	    this.inventory = [];
	  }
	  initChara(obj) {
	    this.initMark();
	    this.initExp();
	    this.initSkin();
	    this.initLiquid();
	    this.initReveals();
	    this.initVirginity();
	    this.initDaily();
	    this.initFlag();
	    this.initLiquid();
	    if (obj.stats) {
	      this.Stats(obj.stats);
	    }
	    if (obj.abl) {
	      this.Ability(obj.abl);
	    }
	    if (obj.sbl) {
	      this.SituAbility(obj.sbl);
	    }
	    if (obj.exp) {
	      this.Exp(obj.exp);
	    }
	    if (obj.flag) {
	      this.Flag(obj.flag);
	    }
	    if (obj.virginity) {
	      this.Virginity(obj.virginity);
	    }
	    $(document).trigger(":initCharacter", [this, obj]);
	  }
	  initMark() {
	    Object.keys(D.mark).forEach((key) => {
	      this.mark[key] = { lv: 0, history: [] };
	    });
	  }
	  initExp() {
	    Object.keys(D.exp).forEach((key) => {
	      this.exp[key] = { aware: 0, total: 0 };
	    });
	  }
	  initSkin() {
	    var _a, _b;
	    this.skin = {};
	    if (!this.r) {
	      D.skinlayer.forEach((key) => {
	        this.skin[key] = [];
	      });
	    } else {
	      let layer = ((_b = (_a = this.r) == null ? void 0 : _a.options) == null ? void 0 : _b.skinLayer) || D.partSkinLayer;
	      for (let key in layer) {
	        let list = layer[key];
	        if (!this.body[key])
	          continue;
	        list.forEach((k) => {
	          this.skin[k] = [];
	        });
	      }
	    }
	    this.skin.total = {};
	    return this;
	  }
	  initReveals() {
	    this.reveals = {};
	    const ignore = ["vagina", "penis", "buttL", "buttR"];
	    this.reveals.expose = 3;
	    this.reveals.reveal = 1500;
	    this.reveals.detail = {};
	    D.skinlayer.forEach((k) => {
	      if (ignore.includes(k) === false)
	        this.reveals.detail[k] = { expose: 3, block: 3 };
	    });
	    this.reveals.detail.genital = { expose: 3, block: 3 };
	    this.reveals.detail.butts = { expose: 3, block: 3 };
	    this.reveals.parts = Object.keys(this.reveals.detail);
	    return this;
	  }
	  initVirginity() {
	    this.virginity = {};
	    const list = clone(D.virginity);
	    if (this.gender === "male")
	      list.delete();
	    if (this.gender === "female")
	      list.delete();
	    list.forEach((k) => {
	      this.virginity[k] = [];
	    });
	    return this;
	  }
	  initDaily() {
	    this.daily = {};
	    D.dailykeys.forEach((key) => {
	      this.daily[key] = 0;
	    });
	    if (!this.body.penis) {
	      delete this.daily.cum;
	    }
	    if (!this.body.vagina) {
	      delete this.daily.cumV;
	      delete this.daily.ogV;
	    }
	    return this;
	  }
	  initFlag() {
	    D.cflag.forEach((key) => {
	      this.flag[key] = 0;
	    });
	    return this;
	  }
	  initLiquid() {
	    this.liquid = {};
	    D.initials.forEach((alpha) => {
	      let i = alpha.toLowerCase();
	      this.liquid[i] = {};
	      D.liquidType.forEach((key) => {
	        this.liquid[i][key] = 0;
	      });
	      this.liquid[i].total = 0;
	    });
	    return this;
	  }
	  Names(obj) {
	    if (obj.v)
	      this.name = obj.n;
	    if (obj.m)
	      this.midname = obj.n;
	    if (obj.s)
	      this.surname = obj.n;
	    if (obj.n)
	      this.nickname = obj.n;
	    if (obj.c)
	      this.callname = obj.n;
	    this.fullname = Chara.combineName(this);
	    return this;
	  }
	  set(key, value) {
	    this[key] = value;
	    return this;
	  }
	  Stats(obj) {
	    D.stats.forEach((key) => {
	      const v = obj[key] || this.getRandomStats(key);
	      this[key] = [v, v];
	    });
	    return this;
	  }
	  Ability(obj) {
	    Object.keys(obj).forEach((key) => {
	      this.abl[key].lv = obj[key];
	    });
	    return this;
	  }
	  SituAbility(obj) {
	    Object.keys(obj).forEach((key) => {
	      this.sbl[key] = obj[key];
	    });
	    return this;
	  }
	  Exp(obj) {
	    Object.keys(obj).forEach((key) => {
	      let val = obj[key];
	      if (typeof val === "string") {
	        let match = val.match(/\d+/g);
	        if (match) {
	          console.log(match);
	          val = Number(match[0]) + random(Number(match[1]));
	        }
	      }
	      this.exp[key].total = val;
	      this.exp[key].aware = val;
	    });
	    return this;
	  }
	  Appearance(obj) {
	    Object.keys(obj).forEach((key) => {
	      this.appearance[key] = obj[key];
	    });
	    return this;
	  }
	  Virginity(obj) {
	    Object.keys(obj).forEach((key) => {
	      this.virginity[key] = obj[key];
	    });
	    return this;
	  }
	  Flag(obj) {
	    Object.keys(obj).forEach((key) => {
	      this.flag[key] = obj[key];
	    });
	    return this;
	  }
	}
	Chara.data = {};

	const getScar = function(chara, { times = 1, type, part, count = "never" } = {}) {
	  const skin = chara.skin;
	  for (let i = 0; i < times; i++) {
	    skin[part].push([type, count]);
	  }
	  return "";
	};
	const skinCounter = function(chara, t) {
	  const dolayer = function(layer, t2) {
	    for (let i = 0; i < layer.length; i++) {
	      let k = layer[i];
	      if (typeof k[1] == "number") {
	        k[1] -= t2;
	        if (k[1] <= 0 && k[0] !== "wound") {
	          layer.splice(i, 1);
	          i--;
	        } else if (k[1] <= 0) {
	          k[0] = "scar";
	          k[1] = "never";
	        }
	      }
	    }
	  };
	  const total = {};
	  const collect = (skin) => {
	    for (let i in skin) {
	      if (i == "total" || i == "detail")
	        continue;
	      let layer = skin[i];
	      dolayer(layer, t);
	      total[i] = {};
	      D.scarType.forEach((type) => {
	        total[i][type] = countArray(layer, type);
	      });
	    }
	    return total;
	  };
	  const count = () => {
	    const result = {};
	    D.scarType.forEach((type) => {
	      result[type] = [0, []];
	    });
	    for (let i in total) {
	      for (let k in total[i]) {
	        if (total[i][k] > 0) {
	          result[k][0] += total[i][k];
	          const detail = [i, total[i][k]];
	          result[k][1].push(detail);
	        }
	      }
	    }
	    return result;
	  };
	  const skinlayer = chara.skin;
	  collect(skinlayer);
	  chara.skin.total = count();
	  return total;
	};

	const module$2 = {
	  name: "Creatures",
	  version: "1.0.0",
	  des: "A module for species and character system.",
	  data: {
	    species,
	    bodyDict,
	    bodyGroup,
	    Psize,
	    existency,
	    bodysize
	  },
	  database: {
	    Species: Species.data,
	    Creature: Creature.data,
	    Chara: Chara.data
	  },
	  classObj: {
	    Organs,
	    Species,
	    Creature,
	    Chara
	  },
	  func: {
	    GenerateHeight,
	    GenerateWeight,
	    RandomSpeciesName,
	    listAllParts,
	    setCycle,
	    BodyRatio,
	    getScar,
	    skinCounter,
	    Fix: {
	      LanArr: fixLanArr,
	      BodySizeCalc,
	      HeadSize,
	      PenisProduce: fixPenisProduce
	    },
	    Init: {
	      InitSpecies,
	      BodyObj: initBodyObj,
	      Womb: initCycle,
	      parasite: initParasite
	    }
	  },
	  config: {
	    globaldata: true
	  },
	  Init: ["InitSpecies"]
	};
	addModule(module$2);

	/**
	 * @fileoverview Actions
	 * @version 1.0.0
	 * @license MIT
	 * @namespace Action
	 *
	 * @author LuneFox
	 * @description
	 * 1.0.0
	 */
	class Action {
	  static makeTemplate(data, mode) {
	    return "";
	  }
	  static output(data, mode) {
	  }
	  static add(id, type, obj) {
	    Action.data[id] = new Action(type, obj);
	  }
	  static get(arg, ...args) {
	    switch (arg) {
	      case "actPart":
	        if (!args[0]) {
	          slog("warn", "No args for actPart");
	          return [];
	        }
	        return Object.values(Action.data).filter((action) => action.actPart && action.actPart.has(args));
	      case "targetPart":
	        if (!args[0]) {
	          slog("warn", "No args for targetPart");
	          return [];
	        }
	        return Object.values(Action.data).filter((action) => action.targetPart && action.targetPart.has(args));
	      case "type":
	        if (!args[0]) {
	          slog("warn", "No args for type");
	          return [];
	        }
	        return Object.values(Action.data).filter((action) => action.type == args[0]);
	      default:
	        return Object.values(Action.data).filter((action) => action.name == arg || action.id == arg);
	    }
	  }
	  static set(id) {
	    if (!Action.data[id]) {
	      slog("error", "Error occured when setting action: " + id);
	      return new Action("error", { name: "Error", id: "error" });
	    }
	    return Action.data[id];
	  }
	  constructor(type, action) {
	    this.type = type;
	    for (let key in action) {
	      let value = action[key];
	      if (!value)
	        continue;
	      if (typeof value === "string" && !isNaN(Number(value))) {
	        value = Number(value);
	      }
	      if (typeof value === "string" && value.indexOf("|") > -1) {
	        value = value.split("|");
	      }
	      if (groupmatch(value, "true", "yes", "y")) {
	        value = true;
	      }
	      if (groupmatch(value, "false", "no", "n")) {
	        value = false;
	      }
	      this[key] = value;
	    }
	    if (this.type == "Tentacles") {
	      this.actPart = ["tentacles"];
	    }
	    this.filter = (...arg) => {
	      return 1;
	    };
	    this.check = (...arg) => {
	      return 1;
	    };
	    this.order = (...arg) => {
	      return 1;
	    };
	    this.effect = (...arg) => {
	      return "";
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
	  Order(callback) {
	    this.order = callback;
	    return this;
	  }
	  Effect(callback) {
	    this.effect = callback;
	    return this;
	  }
	  Name(calback) {
	    this.alterName = calback;
	    return this;
	  }
	  ForceAble() {
	    this.forceAble = true;
	    return this;
	  }
	  AutoKeep() {
	    this.autokeep = true;
	    return this;
	  }
	  Ready(callback) {
	    this.onReady = callback;
	    return this;
	  }
	  Options(str) {
	    this.options = str;
	    return this;
	  }
	  Set(key, value) {
	    this[key] = value;
	    return this;
	  }
	}
	Action.data = {};
	Action.kojo = {};

	const InitActionList = function() {
	  let tables = scEra.table.get("ActionList");
	  for (const type of Object.keys(tables)) {
	    let list = tables[type];
	    list.forEach((data) => {
	      if (data.actPart)
	        data.actPart = extendParts(data.actPart);
	      if (data.targetPart)
	        data.targetPart = extendParts(data.targetPart);
	      Action.data[data.id] = new Action(type, data);
	    });
	  }
	  console.log("ActionList", Action.data);
	};
	const InitKojoAction = function() {
	};
	const extendParts = function(raw) {
	  let list = "mbpcvauehfnsrgd";
	  let re = raw;
	  if (raw.match(/^--\S+$/)) {
	    raw = raw.replace("--", "");
	    for (let i in raw) {
	      list = list.replace(raw[i], "");
	    }
	    re = list;
	  }
	  if (raw == "all") {
	    re = list;
	  }
	  const part = {
	    m: "mouth",
	    b: "breast",
	    p: "penis",
	    c: "clitoris",
	    v: "vagina",
	    a: "anal",
	    u: "urin",
	    e: "ears",
	    h: ["handL", "handR"],
	    f: "foot",
	    n: "neck",
	    s: "butts",
	    r: "nipple",
	    g: "thighs",
	    d: "abdomen"
	  };
	  const arr = re.split("").map((char) => part[char]).flat();
	  return arr;
	};

	Action.makeGroup = "";
	Action.makeTemplate = function(data, mode) {
	  const { name, template, targetPart, actPart, type } = data;
	  let isCounter = mode.includes("counter");
	  let isKojo = mode.includes("kojo");
	  let groupTitle = `:: Action_${type}_Options[script]
`;
	  let txt = [
	    `/* ${name} */`,
	    `Action.set('${data.id}')`,
	    `     .Filter(()=>{`,
	    `         return 1`,
	    `      })`,
	    `     .Check(()=>{`,
	    `         return 1`,
	    `      })`,
	    `     .Order(()=>{`,
	    `         return 0`,
	    `      })`,
	    ``,
	    ``
	  ].join("\n");
	  if (groupmatch(mode, "kojo", "msg") || isKojo)
	    txt = "";
	  const converttemplate = (template2, ...args) => {
	    if (!args[0])
	      args[0] = "{0}";
	    if (!args[1])
	      args[1] = "{1}";
	    const charaA = isCounter ? "<<target>>" : "<<you>>";
	    const charaB = isCounter ? "<<you>>" : "<<target>>";
	    const replace2 = isCounter ? args[1] : args[0];
	    const replace3 = isCounter ? args[0] : args[1];
	    return template2.replace(/\{0}/g, charaA).replace(/\{1}/g, charaB).replace(/\{2}/g, replace2).replace(/\{3}/g, replace3);
	  };
	  const ctx = (use, parts, reverse) => {
	    if (!template) {
	      return "";
	    }
	    return parts.map((tar) => {
	      const m2 = reverse ? D.bodyDict[use] : D.bodyDict[tar];
	      const m3 = reverse ? D.bodyDict[tar] : use ? D.bodyDict[use] : "{actPart}";
	      return `<<case '${tar}'>>
${isKojo ? "/* " : ""}${converttemplate(template, m2, m3)}<br>${isKojo ? " */" : ""}
`;
	    }).join("");
	  };
	  let titlehead = isKojo ? "Kojo_NPCID_" : "";
	  let titleend = isKojo ? "[noMsg]" : "";
	  let titlemain = isCounter ? "Counter" : "Action";
	  let title = `:: ${titlehead}${titlemain}_${data.id}${titleend}`;
	  if (mode == "script") {
	    if (Action.makeGroup !== type) {
	      Action.makeGroup = type;
	      return groupTitle + txt;
	    } else {
	      return txt;
	    }
	  } else if (!groupmatch(mode, "kojo", "msg") && !isKojo) {
	    txt = `:: Action_${data.id}_Options[script]
` + txt;
	  }
	  const head = `${title}
/* ${name} */
`;
	  const makeTxt = function(part, use, parts, reverse) {
	    const main = `<<switch T.${part ? "actPart" : "selectPart"}>>
${ctx(use, parts, reverse)}<</switch>>


`;
	    return head + main;
	  };
	  switch (type) {
	    case "Train":
	    case "Tentacles":
	      txt += makeTxt(0, actPart ? actPart[0] : "", targetPart);
	      break;
	    case "Item":
	      txt += makeTxt(0, "hands", targetPart);
	      break;
	    case "Pose":
	      txt += makeTxt(0, "penis", targetPart);
	      break;
	    case "Reverse":
	      txt += makeTxt(1, "penis", actPart, 1);
	      break;
	    default:
	      if (template) {
	        txt += converttemplate(template);
	      } else {
	        txt += `${head}<<you>>\u5728${name}\u3002<br>


`;
	      }
	  }
	  return txt;
	};
	Action.output = function(mode, type) {
	  if (mode.has("id")) {
	    mode.replace("-id", "");
	    const data = Action.data[type];
	    return Action.makeTemplate(data, mode);
	  }
	  const txt = Object.values(Action.data).filter(
	    (action) => mode == "kojo" && !groupmatch(action.type, "General", "Menu", "Other", "System") || type && action.type == type || !type && action.type !== "System"
	  ).map((data) => Action.makeTemplate(data, mode)).join("");
	  download(txt, "Actiontemplate" + (type ? `_${type}` : ""), "twee");
	};

	const modules$1 = {
	  name: "Action",
	  version: "1.0.0",
	  des: "Action module for interaction",
	  data: {},
	  database: Action.data,
	  classObj: {
	    Action
	  },
	  func: {
	    Init: {
	      InitActionList,
	      KojoAction: InitKojoAction
	    }
	  },
	  config: {
	    globalFunc: {},
	    globaldata: true
	  },
	  Init: ["InitActionList"],
	  dependencies: ["Dialogs"]
	};
	addModule(modules$1);

	class Com {
	  static new(key, obj) {
	    Com.data[obj.id] = new Com(key, obj);
	    return Com.data[obj.id];
	  }
	  static set(id, time) {
	    let data = Com.data[id];
	    if (!data) {
	      return console.log(`[error] ${now()} | no such command`);
	    }
	    if (time) {
	      return data.Set("time", time);
	    } else {
	      return data;
	    }
	  }
	  constructor(type, obj = {}) {
	    const { id = "error", name = "error", tags = [], time = 5 } = obj;
	    this.id = id;
	    this.name = name;
	    this.tags = [type];
	    this.time = time;
	    if (tags.length)
	      this.tags = this.tags.concat(tags);
	    const ignore = ["id", "name", "tags", "time"];
	    for (let key in obj) {
	      if (ignore.includes(key))
	        continue;
	      this[key] = obj[key];
	    }
	    this.filter = () => {
	      return true;
	    };
	    this.check = () => {
	      return true;
	    };
	    this.source = () => {
	    };
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
	    if (!this.tags)
	      this.tags = [];
	    this.tags = this.tags.concat(arr);
	    this.tags = [...new Set(this.tags)];
	    return this;
	  }
	  Order(callback) {
	    this.order = callback;
	    return this;
	  }
	  AlterName(callback) {
	    this.alterName = callback;
	    return this;
	  }
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

	Com.showFilters = function() {
	  const general = clone(S.ComFilterGeneral);
	  const train = clone(S.ComFilterTrain);
	  const end = "<<=Com.listUp()>><</link>>";
	  const generalink = [];
	  const trainlink = [];
	  general.forEach((k) => {
	    generalink.push(`<<link '${k}'>><<set $currentFilter to '${k}'>>${end}`);
	  });
	  train.forEach((k) => {
	    trainlink.push(`<<link '${k}'>><<set $currentFilter to '${k}'>>${end}`);
	  });
	  return `<<link '\u5168\u90E8'>><<set $currentFilter to 'all'>>${end} \uFF5C ${generalink.join(
    ""
  )}<<if $mode is 'train'>>${trainlink.join("")}<</if>>`;
	};
	Com.listUp = function() {
	  const command = [];
	  Object.values(Com.data).forEach((com) => {
	    const { id, time } = com;
	    let name = "";
	    if (com.alterName)
	      name = com.alterName();
	    else
	      name = com.name;
	    let txt = "";
	    if (com.filter() && Com.globalFilter(id)) {
	      txt = `<<com '${name}' ${time} ${id}>><<run Com.Check('${id}')>><</com>>`;
	    } else if (V.system.showAllCommand) {
	      txt = `<div class='command unable'><<button '${name}'>><</button>></div>`;
	    }
	    command.push(txt);
	  });
	  if (command.length) {
	    new Wikifier(null, `<<replace #commandzone>>${command.join("")}<</replace>>`);
	  }
	};
	Com.shownext = function() {
	  let html = `<<link 'Next'>><<run Com.next()>><</link>>`;
	  new Wikifier(null, `<<replace #commandzone transition>>${html}<</replace>>`);
	};
	Com.hide = function() {
	  new Wikifier(null, `<<replace #commandmenu>> <</replace>>`);
	  new Wikifier(null, "<<replace #commandzone>> <</replace>>");
	};
	Com.reset = function() {
	  T.comPhase = "reset";
	  V.location.chara.forEach((cid) => {
	    F.charaEvent(cid);
	  });
	  V.lastCom = V.selectCom;
	  const clearlist = ["comCancel", "onselect", "comAble", "orderGoal", "force", "msgId"];
	  clearlist.forEach((k) => {
	    delete T[k];
	  });
	  delete T.msg;
	  T.msgId = 0;
	  T.comorder = 0;
	  T.reason = "";
	  T.order = "";
	  V.selectCom = 0;
	  Com.resetScene();
	};
	Com.updateMenu = function() {
	  const list = [[true, "System", "SystemOption", ""]];
	  let menu = [];
	  list.forEach((a) => {
	    if (a[0])
	      menu.push(`<<link '[ ${a[1]} ]' '${a[2]}'>>${a[3]}<</link>>`);
	  });
	  const html = `<span class='filter'>Filter: ${Com.showFilters()}</span>\u3000\uFF5C\u3000${menu.join("")}`;
	  new Wikifier(null, `<<replace #commandmenu>>${html}<</replace>>`);
	};
	Com.resetScene = function() {
	  V.target = C[V.tc];
	  V.player = C[V.pc];
	  Com.updateScene();
	  Com.listUp();
	  Com.updateMenu();
	  return "";
	};
	Com.next = function() {
	  if (T.msgId < T.msg.length && T.msg[T.msgId].has("<<selection", "<<linkreplace") && !T.selectwait) {
	    T.msg[T.msgId] += "<<unset _selectwait>><<set _onselect to 1>>";
	    T.selectwait = 1;
	  }
	  if (T.comPhase == "before" && T.msgId >= T.msg.length && !T.onselect && !T.selectwait) {
	    Com.Event(V.selectCom, 1);
	  } else {
	    if (T.msgId < T.msg.length && !T.onselect) {
	      P.flow(T.msg[T.msgId]);
	      T.msgId++;
	    }
	  }
	};
	Com.Check = function(id) {
	  const com = Com.data[id];
	  T.comorder = 0;
	  T.reason = "";
	  T.order = "";
	  T.orderGoal = Com.globalOrder(id) + com.order();
	  T.comAble = Com.globalCheck(id) && com.check();
	  T.msgId = 0;
	  T.comPhase = "before";
	  let txt = "";
	  let c;
	  if (Story.has(`Kojo_${V.tc}_Com`)) {
	    new Wikifier("#hidden", Story.get(`Kojo_${V.tc}_Com`).text);
	  }
	  Com.hide();
	  Com.shownext();
	  if (V.system.showOrder && T.order) {
	    P.msg(`\u914D\u5408\u5EA6\u68C0\u6D4B\uFF1A${T.order}\uFF1D${T.comorder}/${T.orderGoal}<br><<dashline>>`);
	  }
	  P.msg(
	    `${Story.get("Command::Before").text}<<run Com.next()>><<if _noMsg>><<unset _noMsg>><<else>><<dashline>><</if>>`
	  );
	  let type = "Com", dif = "Before";
	  if (Kojo.has(V.pc, { type, id, dif, check: 1 })) {
	    txt = Kojo.put(V.pc, { type, id, dif });
	    P.msg(txt);
	    c = 1;
	  }
	  if (Kojo.has(V.tc, { type, id, dif })) {
	    txt = Kojo.put(V.tc, { type, id, dif });
	    P.msg(txt);
	    c = 1;
	  }
	  if (com == null ? void 0 : com.before)
	    com.before();
	  if (!Story.has(`Com_${id}`)) {
	    P.flow("\u7F3A\u4E4F\u4E8B\u4EF6\u6587\u672C", 30, 1);
	    Com.resetScene();
	  } else if (c) {
	    Com.shownext();
	    Com.next();
	  } else {
	    Com.Event(id);
	  }
	};
	Com.Event = function(id, next) {
	  const com = Com.data[id];
	  const resetHtml = `<<run Com.reset()>>`;
	  let txt = "", type = "Com";
	  T.msg = [];
	  T.msgId = 0;
	  T.comPhase = "event";
	  T.lastCom = T.selectCom;
	  T.selectCom = id;
	  $("#contentMsg a").remove();
	  if (T.comCancel) {
	    P.msg(resetHtml);
	  } else if (T.comAble) {
	    if (T.orderGoal === 0 || V.system.debug || T.orderGoal > 0 && T.comorder >= T.orderGoal || (com == null ? void 0 : com.forceAble) && T.comorder + S.ignoreOrder >= T.orderGoal) {
	      T.passtime = com.time;
	      if (T.comorder < T.orderGoal && !V.system.debug) {
	        T.msg.push(
	          `\u914D\u5408\u5EA6\u4E0D\u8DB3\uFF1A${T.order}\uFF1D${T.comorder}/${T.orderGoal}<br>${(com == null ? void 0 : com.forceAble) ? "<<run Com.next()>>" : ""}<br>`
	        );
	        if (Kojo.has(V.pc, { type, id, dif: "Force", check: 1 })) {
	          txt = Kojo.put(V.pc, { type, id, dif: "Force" });
	        }
	        if (txt.includes("Kojo.put") === false && Kojo.has(V.tc, { type, id, dif: "Force" })) {
	          txt += Kojo.put(V.tc, { type, id, dif: "Force" });
	        }
	        T.force = true;
	      } else {
	        txt = Kojo.put(V.pc, { type, id });
	        if (txt.includes("Kojo.put") === false && Kojo.has(V.tc, { type, id })) {
	          txt += Kojo.put(V.tc, { type, id });
	        }
	      }
	      if (txt.includes("Kojo.put"))
	        txt = F.convertKojo(txt);
	      P.msg(txt);
	      P.msg(`<<run Com.data['${id}'].source(); F.passtime(T.passtime); Com.After()>>`, 1);
	      if (Kojo.has(V.pc, { type, id, dif: "After", check: 1 })) {
	        txt = `<br><<set _comPhase to 'after'>>` + Kojo.put(V.pc, { type, id, dif: "After" });
	        if (txt.includes("Kojo.put"))
	          txt = F.convertKojo(txt);
	        P.msg(txt);
	      }
	      if (txt.includes("Kojo.put") === false && Kojo.has(V.tc, { type, id, dif: "After" })) {
	        P.msg(Kojo.put(V.tc, { type, id, dif: "After" }));
	      }
	      P.msg("<<run Com.endEvent()>>", 1);
	    } else {
	      P.msg(`\u914D\u5408\u5EA6\u4E0D\u8DB3\uFF1A${T.order}\uFF1D${T.comorder}/${T.orderGoal}<br><<run F.passtime(1); >>`);
	      P.msg(resetHtml, 1);
	    }
	  } else {
	    if (Kojo.has(V.pc, { type, id, dif: "Cancel", check: 1 })) {
	      txt = Kojo.put(V.pc, { type, id, dif: "Cancel" });
	      P.msg(txt);
	    } else
	      P.msg(
	        `\u300B\u6761\u4EF6\u4E0D\u8DB3\u65E0\u6CD5\u6267\u884C\u6307\u4EE4\uFF1A${typeof com.name === "function" ? com.alterName() : com.name}<br>\u539F\u56E0\uFF1A${T.reason}<br>`
	      );
	    P.msg("<<run F.passtime(1)>>", 1);
	    P.msg(resetHtml, 1);
	  }
	  Com.shownext();
	  Com.next();
	};

	function InitComList() {
	  const table = scEra.table.get("ComList");
	  for (let key of Object.keys(table)) {
	    let list = table[key];
	    list.forEach((obj) => {
	      Com.new(key, obj);
	    });
	  }
	  console.log(Com.data);
	}
	function InitComSystem() {
	  const html = `
<div id='hidden' class='hidden'>you can't see me.</div>
<div id='location'></div>
<br>
<div id='content' class='content' onClick='if(S.msg)Com.next();'>
    <div id='contentMsg'>
    </div>
<div id="msg_end" style="height:0px; overflow:hidden"></div>
</div>

<div id='commandmenu'>

</div>
<br>
<div id='commandzone'>

</div>
<div id='next'>
</div>

<script>
Com.updateMovement();
Com.updateScene();
Com.updateMenu();
Com.listUp();
<\/script>
`;
	  scEra.newPsg("MainLoop", html);
	  const html2 = `<<if !$selectCom>>
<<set $selectCom = ''>>
<</if>>`;
	  scEra.newPsg("MainLoop:Before", html2);
	  addMacro();
	  DefineMacros("resetScene", Com.resetScene);
	}
	function addMacro() {
	  scEra.macro.add("com", {
	    tags: null,
	    handler: function() {
	      let { contents, args } = this.payload[0];
	      if (args.length === 0) {
	        return this.error("no command text specified");
	      }
	      if (!T.comcount)
	        T.comcount = 1;
	      else
	        T.comcount++;
	      let comId = args[2];
	      let output = `<div id='com_${T.comcount}' class='command'>
        <<button '${args[0]}'>>
        <<set _inputCom to '${comId}'>><<set $passtime to ${args[1]}>>
        ${contents}
        <</button>>
        </div>`;
	      if (Config.debug)
	        console.log(output);
	      jQuery(this.output).wiki(output);
	    }
	  });
	}

	const modules = {
	  name: "Command",
	  des: "A classic era-like command system.",
	  version: "1.0.0",
	  database: Com.data,
	  classObj: {
	    Com
	  },
	  func: {
	    Init: {
	      InitComList,
	      InitComSystem
	    }
	  },
	  config: {
	    globaldata: true
	  },
	  Init: ["InitComList", "InitComSystem"],
	  dependencies: ["Dialogs", "Kojo"]
	};
	addModule(modules);

	const flow = function(text, time = 60, hasDashline) {
	  let dashline = hasDashline ? "<<dashline>>" : "";
	  new Wikifier(null, `<<append #contentMsg transition>><<timed ${time}ms>>${text}${dashline}<</timed>><</append>>`);
	  setTimeout(() => {
	    msg_end.scrollIntoView();
	  }, time);
	  msg_end.scrollIntoView();
	};
	const clearComment = function(text) {
	  return text.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
	};
	const converTxt = function(text) {
	  const trans = function(t) {
	    let script = false;
	    t = clearComment(t);
	    if (t.includes("<fr>")) {
	      t = t.replace("<fr>", "<br>");
	    }
	    if (t.includes("<script") && !t.includes("/script") || t.includes("<<run") && !t.includes(">>")) {
	      script = true;
	    } else if (script && t.has("/script", ">>")) {
	      script = false;
	    } else if (script) ; else {
	      if (!t.match(/<<if|<<select|<<case|<<\/|<<switch|<<else|<<run|<script|<br>/)) {
	        t += "<br>";
	      }
	    }
	    return t;
	  };
	  if (typeof text === "string" && !text.includes("\n")) {
	    return trans(text);
	  } else if (typeof text === "string") {
	    text = text.split("\n");
	  }
	  const txt = [];
	  for (let i = 0; i < text.length; i++) {
	    txt[i] = trans(text[i]);
	  }
	  return txt.join("");
	};
	const setMsg = function(msg, add) {
	  if (!T.msg)
	    T.msg = [];
	  if (add) {
	    if (!T.msg.length)
	      T.msg[0] = "";
	    T.msg[T.msg.length - 1] += msg;
	  } else if (msg.includes("<fr>")) {
	    T.msg = T.msg.concat(msg.split("<fr>"));
	  } else {
	    T.msg.push(msg);
	  }
	};
	const resetMsg = function() {
	  T.msg = [];
	  T.msgId = 0;
	  T.noMsg = 0;
	};
	const errorView = function(text) {
	  return `<div class='error-view'><span class='error'>${text}</span></div>`;
	};

	const _Dialogs = class {
	  constructor(title, exit = S.defaultExit || "MainLoop", next = S.defaultNext || "Next Step") {
	    let raw;
	    if (!Story.has(title)) {
	      slog("error", "Dialogs: the story is not found:", title);
	      raw = `<div id='error-view'>Dialogs: the story is not found:${title}</div>`;
	    } else {
	      raw = scEra.getPsg(title).split("\n");
	    }
	    this.logs = [];
	    this.option = {};
	    this.title = title;
	    this.exit = exit;
	    this.next = next;
	    this.init(raw);
	    if (Config.debug)
	      console.log(this.logs);
	  }
	  init(raw) {
	    let config, text = [];
	    let fr;
	    raw.forEach((line) => {
	      if (line[0] === "#") {
	        config = JSON.parse(line.replace("#:", "")) || {};
	      } else if (line.match(/^\/\*(.+)\*\/$/)) ; else {
	        if (line.has("<fr>")) {
	          fr = true;
	          line.replace("<fr>", "<br>");
	        }
	        text.push(line);
	      }
	      if (fr || raw[raw.length - 1] === line) {
	        fr = false;
	        this.logs.push({ text, config });
	        config = {};
	        text = [];
	      }
	    });
	    this.len = this.logs.length;
	  }
	  static set(obj) {
	    const { tp, id, nm, ch, exit = S.defaultExit, next = S.defaultNext } = obj;
	    if (!tp || !nm)
	      return;
	    V.event = {
	      type: tp,
	      eid: id,
	      name: nm,
	      ch,
	      ep: 0,
	      sp: 0,
	      lastPhase: 0,
	      lastSelect: 0,
	      fullTitle: "",
	      exit,
	      next
	    };
	    let title = this.combineTitle(V.event);
	    V.event.fullTitle = title;
	    if (!Story.has(title)) {
	      new Error(`[error] ${now()} | Dialogs.set: the story is not found:` + title);
	      return;
	    }
	    if (Config.debug)
	      console.log("Dialogs.set", V.event, T.dialogBefore);
	    $(document).trigger("dialog:set", V.event);
	  }
	  static combineTitle({ eid, type, name, ch }) {
	    let title = `${type}_${name}`;
	    if (eid) {
	      title = `${type}_${eid}_${name}`;
	    }
	    if (ch) {
	      title += `_${ch}`;
	    }
	    return title;
	  }
	  static before(_title) {
	    let title = _title || V.event.fullTitle;
	    T.dialogBefore = "";
	    if (Story.has(title + "::Before")) {
	      T.dialogBefore = title + "::Before";
	      new Wikifier(null, scEra.getPsg(T.dialogBefore));
	    }
	    setTimeout(() => {
	      new Wikifier(null, `<<goto 'DialogMain'>>`);
	    }, 100);
	  }
	  static end(exit) {
	    let title = V.event.fullTitle;
	    T.dialogAfter = "";
	    if (Story.has(title + "::After")) {
	      T.dialogEnd = title + "::After";
	      new Wikifier(null, scEra.getPsg(T.dialogAfter));
	    }
	    setTimeout(() => {
	      new Wikifier(null, `<<goto '${exit}'>>`);
	      this.config = {};
	      V.event = {};
	      this.msg = null;
	    }, 100);
	  }
	  static start() {
	    const e = V.event;
	    let title = e.fullTitle;
	    if (e.ep) {
	      title += `_ep${e.ep}`;
	      _Dialogs.record("ep", `ep${e.ep}`);
	    }
	    if (e.sp) {
	      title += `:sp${e.sp}`;
	      _Dialogs.record("sp", `sp${e.sp}`);
	    }
	    if (Config.debug)
	      console.log("InitScene", title);
	    this.msg = new _Dialogs(title, e.exit, e.next);
	    T.eventTitle = title;
	    if (this.config.jump) {
	      T.msgId = this.config.jump;
	    } else {
	      T.msgId = 0;
	    }
	    this.config = {};
	    const log = this.msg.logs[T.msgId];
	    if (!log)
	      return "";
	    this.wiki(log, T.msgId);
	  }
	  static wiki(dialog, id) {
	    if (!dialog) {
	      let msg = `Error on wikify the dialog: the dialog is undefined or null:${this.msg.title},${id}`;
	      slog("warn", msg, dialog, this.msg);
	      return;
	    }
	    let config = dialog.config || {};
	    let txt = converTxt(dialog.text);
	    this.history.push(txt);
	    const { type = "", code = "" } = config;
	    V.event.next = this.nextButton(type);
	    if (id === this.msg.len - 1) {
	      this.config = config;
	    }
	    flow(txt);
	    if (code && V.mode !== "history") {
	      setTimeout(() => {
	        new Wikifier(null, code);
	      }, 100);
	    }
	  }
	  static nextButton(type) {
	    const select = new SelectCase();
	    select.else("Next").case("return", "Back").case("jump", "End").case(["endPhase", "endEvent", "end"], "Continue");
	    return select.has(type);
	  }
	  static trigger() {
	    $("#contentMsg").on("click", function() {
	      _Dialogs.next();
	    });
	    $("dialog").on("MsgEnd", function() {
	      _Dialogs.nextScene();
	    });
	    $("dialog").trigger("start", [T.eventTitle, V.event, this.msg]);
	  }
	  static next() {
	    if (T.selectwait) {
	      return;
	    }
	    if (T.afterselect && T.msgId < this.msg.len - 1) {
	      delete T.afterselect;
	      return;
	    }
	    T.msgId++;
	    let dialog = this.msg.logs[T.msgId];
	    if (T.msgId < this.msg.len) {
	      this.wiki(dialog, T.msgId);
	    } else {
	      $("dialog").trigger("MsgEnd");
	    }
	  }
	  static nextScene() {
	    const e = V.event;
	    const config = this.config;
	    const { type = "end", exit = this.msg.exit, exitButton = this.msg.next } = config;
	    console.log("nextScene", type, config, e, V.selectId);
	    switch (type) {
	      case "return":
	        this.return(config);
	        break;
	      case "jump":
	        this.jump(config);
	        break;
	      case "endPhase":
	        this.endPhase(config);
	        break;
	      case "selectEnd":
	        e.lastId = V.selectId;
	        e.sp = V.selectId;
	        this.start();
	        break;
	      default:
	        if (T.msgId <= this.msg.len) {
	          e.next = exitButton;
	          V.mode = "normal";
	        } else {
	          this.end(exit);
	        }
	    }
	  }
	  static return(config) {
	    const e = V.event;
	    const { phase } = config;
	    if (phase)
	      T.msgId = phase;
	    e.sp = 0;
	    e.lastId = V.selectId;
	    V.selectId = 0;
	    this.start();
	  }
	  static jump(config) {
	    const e = V.event;
	    const setList = ["name", "eid", "ch", "ep"];
	    if (config.target) {
	      e.ep = 0;
	      e.sp = 0;
	    }
	    setList.forEach((key) => {
	      if (config[key])
	        e[key] = config[key];
	    });
	    if (config.phase) {
	      this.config.jump = config.phase;
	    }
	    setTimeout(() => {
	      if (config.target && !e.fullTitle.includes(config.target)) {
	        this.before(config.target);
	      } else {
	        e.fullTitle = this.combineTitle(e);
	        this.start();
	      }
	    }, 100);
	  }
	  static endPhase(config) {
	    const e = V.event;
	    const setList = ["name", "eid", "ch", "ep", "sp"];
	    let setflag;
	    setList.forEach((key) => {
	      if (config[key]) {
	        e[key] = config[key];
	        setflag = true;
	      }
	    });
	    if (!setflag) {
	      e.ep++;
	    }
	    T.msgId = 0;
	    e.lastSelect = V.selectId;
	    V.selectId = 0;
	    if (!config.sp)
	      e.sp = 0;
	    this.start();
	  }
	  static record(char, point) {
	    const { type, id, ep } = V.event;
	    let now2 = point;
	    if (char === "sp" && ep) {
	      now2 = `ep${ep}:` + point;
	    }
	    let memory = setPath(V, `memory.${type}.${id}`);
	    if (!memory || !memory[point]) {
	      setPath(V, `memory.${type}.${id}.${point}`, []);
	      memory = setPath(V, `memory.${type}.${id}`);
	    }
	    if (!memory[point].includes(now2)) {
	      memory[point].push(now2);
	    }
	  }
	  static clear(step) {
	    let msg = $("#contentMsg").html();
	    msg = msg.split("<br></span></span>");
	    let last = msg.pop();
	    if (msg.length > step) {
	      msg = msg.slice(0, msg.length - step);
	      console.log(msg, last);
	      $("#contentMsg").html(msg.join("<br></span></span>") + last);
	    } else {
	      $("#contentMsg").html("");
	    }
	    this.next();
	  }
	};
	let Dialogs = _Dialogs;
	Dialogs.config = {};
	Dialogs.history = [];
	Dialogs.history = [];
	Dialogs.config = {};

	function InitDialogMain() {
	  let html = `
   <dialog class='hidden'> you can't see me .</dialog>

      

   <div id='content' class='content'>
      <div id='contentMsg'>
      </div>

   <div id="msg_end" style="height:0px; overflow:hidden"></div>

   </div>


   <script>

   Dialogs.start();

   Dialogs.trigger();

   <\/script>

   `;
	  scEra.newPsg("DialogMain", html);
	  $(document).on("dialog:set", function(event, data) {
	    console.log(event, data);
	    Dialogs.before();
	  });
	}

	const module$1 = {
	  name: "Dialogs",
	  des: "A flow type dialog system.",
	  version: "1.0.0",
	  classObj: {
	    Dialogs
	  },
	  func: {
	    Init: {
	      InitDialogMain
	    },
	    P: {
	      flow,
	      txt: converTxt,
	      msg: setMsg,
	      error: errorView,
	      resetMsg
	    }
	  },
	  Init: ["InitDialogMain"]
	};
	addModule(module$1);

	const _Kojo = class {
	  static set(id, color) {
	    let data = _Kojo.data;
	    if (!data[id])
	      data[id] = new _Kojo(id, color);
	    return data[id];
	  }
	  static get(cid, type) {
	    if (!cid)
	      return;
	    if (C[cid].kojo !== cid)
	      cid = C[cid].kojo;
	    let data = _Kojo.data[cid];
	    if (!data)
	      return;
	    return type ? data[type] : data;
	  }
	  static title(cid, type, id, dif = "") {
	    if (!cid)
	      return;
	    if (["Before", "After", "Cancel", "Keep", "Failed", "Force"].includes(dif)) {
	      dif = ":" + dif;
	    } else if (dif) {
	      dif = "_" + dif;
	    }
	    if (C[cid].kojo !== cid) {
	      cid = C[cid].kojo;
	    }
	    if (id) {
	      id = `_${id}`;
	    }
	    return `Kojo_${cid}_${type}${id}${dif}`;
	  }
	  static default(type, id, dif = "", check) {
	    let head = "Msg_" + type;
	    if (!type.has("Action")) {
	      head = type;
	    }
	    if (id) {
	      id = `_${id}`;
	    }
	    if (dif)
	      dif = `:${dif}`;
	    let title = `${head}${id}${dif}`;
	    if (check) {
	      return Story.has(title);
	    }
	    return Story.has(title) ? Story.get(title) : "";
	  }
	  static has(cid, { type, id = "", dif = "", check }) {
	    let title = _Kojo.title(cid, type, id, dif);
	    if (dif) {
	      dif = `:${dif}`;
	    }
	    if (type == "custom") {
	      title = `Msg_${id}${dif}`;
	    }
	    if (!title)
	      return;
	    if (check && !Story.has(title)) {
	      return this.default(type, id, dif, true);
	    }
	    return Story.has(title);
	  }
	  static put(cid, { type, id, dif, noTag }) {
	    let title = _Kojo.title(cid, type, id, dif);
	    if (dif) {
	      dif = `:${dif}`;
	    }
	    if (type == "custom") {
	      title = `Msg_${id}${dif}`;
	    }
	    if (!title)
	      return;
	    let retext2 = "";
	    T.noMsg = 0;
	    if (Story.has(title)) {
	      retext2 = Story.get(title);
	    }
	    if (cid == V.pc && type == "PCAction" && !V.system.showPCKojo) {
	      retext2 = "";
	    }
	    if (!retext2) {
	      retext2 = this.default(type, id, dif) || "";
	    }
	    if (!retext2 || retext2.tags.has("noMsg")) {
	      T.noMsg = 1;
	      return "";
	    }
	    let txt2 = checkTxtWithCode(retext2.text);
	    if (txt2.length > 1) {
	      retext2 = retext2.text;
	      let matcher = [`<<nameTag '${cid}'>>`, `<<nameTag "${cid}">>`];
	      if (!retext2.has(matcher) && !noTag) {
	        retext2 = `<<nameTag '${cid}'>>` + retext2;
	      }
	      if (cid == V.pc)
	        T.noNameTag = 1;
	      else
	        T.noNameTag = 0;
	      if (!noTag)
	        retext2 += "<<dashline>>";
	      return retext2;
	    }
	    T.noMsg = 1;
	    return "";
	  }
	  constructor(id, color = "#22A0FC") {
	    this.id = id;
	    this.color = color;
	    this.intro = [];
	    this.schedule = [];
	    this.preset = [];
	    this.filter = () => {
	      return 1;
	    };
	    this.action = [];
	    this.event = [];
	    this.home = "void";
	    this.relation = {};
	    this.counter = [];
	  }
	  Intro(str) {
	    this.intro = str;
	    return this;
	  }
	  Schedule(action = "stay", ...list) {
	    if (list.length == 1 && list[0] instanceof Array)
	      list = list[0];
	    if (!list[0])
	      return this;
	    const schedule = {
	      location: list[0],
	      weekday: list[1] || "all",
	      starthour: list[2],
	      endhour: list[3],
	      stayhour: list[4] || list[3] - list[2],
	      rate: list[5] || 80
	    };
	    this.schedule.push([action, schedule]);
	    return this;
	  }
	  Filter(cond) {
	    this.filter = cond;
	    return this;
	  }
	  Action(obj) {
	    this.action.push(obj);
	    return this;
	  }
	  Event(obj) {
	    this.event.push(obj);
	    return this;
	  }
	  Home(str) {
	    this.home = str;
	    return this;
	  }
	  Relation(id, des, val) {
	    this.relation[id] = [val, des];
	    return this;
	  }
	  Counter(obj) {
	    this.counter.push(obj);
	    return this;
	  }
	  SleepTime(time) {
	    this.sleeptime = time * 60;
	    return this;
	  }
	  WakeupTime(time) {
	    this.wakeuptime = time * 60;
	    return this;
	  }
	  Preset(name, ...objs) {
	    let p2;
	    if (this.preset.length) {
	      p2 = this.preset.find((p3) => p3[0] == name);
	    }
	    if (p2) {
	      objs.forEach((o) => {
	        const i2 = p2[1].findIndex((i3) => i3[0] == o[0]);
	        if (i2 != -1) {
	          p2[1].splice(i2, 1);
	        }
	      });
	      p2[1].push(...objs);
	    } else {
	      this.preset.push([name, objs]);
	    }
	    return this;
	  }
	};
	let Kojo$1 = _Kojo;
	Kojo$1.data = {};
	const convertKojo = function(txt) {
	  if (!txt.includes("<<=Kojo.put"))
	    return txt;
	  console.log("find kojo?");
	  const match = txt.match(/<<=Kojo.put(.+?)>>/g);
	  match.forEach((p) => {
	    const t = p.match(/<<=Kojo.put\((.+?)\)>>/);
	    const code = t[0].replace("<<=", "").replace(">>", "");
	    console.log(code);
	    txt = txt.replace(p, eval(code));
	  });
	  return txt;
	};
	const checkTxtWithCode = function(text) {
	  const raw = text.replace(/\/\*(.+)\*\//g, "").split(/\n/);
	  const condition = [];
	  const retext = [];
	  let count = 0;
	  raw.forEach((txt2) => {
	    if (txt2.match(/<<if(.+)>>/) || txt2.match(/<<else(.+)>>/) || txt2.match(/<<case(.+)>>/) || txt2.match(/switch/) || txt2.match(/<<else>>/) || txt2.match(/<<default>>/)) {
	      let code2 = txt2.match(/<<(.+)>>/)[1];
	      count++;
	      condition[count] = code2;
	    } else if (!count) {
	      retext[1e3] += txt2;
	    } else {
	      if (retext[count] === void 0)
	        retext[count] = "";
	      retext[count] += txt2;
	    }
	  });
	  if (condition.length === 0)
	    return P.countText(text);
	  let isSwitch, switchcond, code, result = "";
	  condition.forEach((con, i) => {
	    if (con.includes("switch")) {
	      isSwitch = true;
	      switchcond = `${con.replace(/switch/g, "")} ===`;
	    }
	    if (con.includes("if"))
	      isSwitch = false;
	    if (isSwitch && con.includes("case")) {
	      code = `${switchcond} ${con.replace(/case/g, "")}`;
	      if (eval(code)) {
	        result += P.countText(retext[i]);
	      }
	      retext[i] = "";
	    } else if (!isSwitch && con.includes("if")) {
	      code = con.replace(/elseif/g, "").replace(/if/g, "").replace(/is/g, "==").replace(/isnot/g, "!=").replace(/lte/g, "<=").replace(/gte/g, ">=").replace(/lt/g, "<").replace(/gt/g, ">").replace(/and/g, "&&").replace(/or/g, "||").replace(/\$/g, "V.").replace(/_/g, "T.");
	      if (eval(code)) {
	        result += P.countText(retext[i]);
	      }
	      retext[i] = "";
	    }
	  });
	  let txt = P.countText(retext.join(""));
	  return result + txt;
	};
	const countText = function(text2) {
	  text2 = P.clearComment(text2);
	  const regExp = [
	    /<script[\s\S]*?<\/script>/g,
	    /<<run[\s\S]*?>>/g,
	    /<<if(.+)>>/g,
	    /<<else(.+)>>/g,
	    /<<\/(.+)>>/g,
	    /<<switch(.+)>>/g,
	    /<<case(.+)>>/g,
	    /<<select(.+)>>/g,
	    /<<replace(.+)>>/g,
	    /<<set(.+)>>/g,
	    /<br>/g,
	    /<<else>>/g,
	    /<<default>>/g,
	    /<fr>/g
	  ];
	  regExp.forEach((reg) => {
	    text2 = text2.replace(reg, "");
	  });
	  if (Config.debug)
	    console.log(text2);
	  return text2.length;
	};

	const module = {
	  name: "Kojo",
	  version: "1.0.0",
	  des: "A management system for character event, custom action, schedule, etc.",
	  database: Kojo$1.data,
	  classObj: {
	    Kojo: Kojo$1
	  },
	  func: {
	    P: {
	      convertKojo,
	      checkTxtWithCode,
	      countText
	    }
	  },
	  dependencies: ["Dialogs"]
	};
	addModule(module);

	slog(
	  "log",
	  "game/main.ts is loaded. The current language is " + (Config == null ? void 0 : Config.lan) + ". State: " + lan$1("\u987A\u5229\u52A0\u8F7D\u6E38\u620F\u6A21\u7EC4", "Successfully loaded game modules")
	);

})();
