;(function () {
	'use strict';

	var __async$4 = (__this, __arguments, generator) => {
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
	function lan(txt, ...txts) {
	  let CN, EN;
	  if (Array.isArray(txt)) {
	    CN = txt[0];
	    EN = txt[1] ? txt[1] : CN;
	  }
	  if (typeof txt === "string") {
	    CN = txt;
	    EN = txts[0] ? txts[0] : txt;
	  }
	  if (Config.lan == "EN" && EN)
	    return EN;
	  else if (CN)
	    return CN;
	  return txt;
	}
	function percent(...num) {
	  let min = num[0], max = num[1];
	  if (num.length == 3) {
	    min = num[1];
	    max = num[2];
	  }
	  return Math.clamp(Math.trunc(min / max * 100), 1, 100);
	}
	function getJson$1(path) {
	  return __async$4(this, null, function* () {
	    const files = [];
	    const response = yield fetch(path);
	    const filelist = yield response.json();
	    slog("log", `Loading json files from ${path}:`, filelist);
	    const requests = filelist.map((file) => __async$4(this, null, function* () {
	      return new Promise((resolve, reject) => __async$4(this, null, function* () {
	        const response2 = yield fetch("./json/" + file);
	        const json = yield response2.json();
	        if (!json || !isValid(json))
	          resolve(`[error] ${now()} | Failed to load json file: ${file}`);
	        files.push([file, json]);
	        slog("log", `[log] ${now()} | Loaded json file: ${file}:`, json);
	        resolve(json);
	      }));
	    }));
	    slog("log", `Waiting for json files to load...`);
	    yield Promise.all(requests);
	    slog("log", `All json files loaded!`);
	    return files;
	  });
	}
	Object.defineProperties(window, {
	  percent: { value: percent },
	  lan: { value: lan },
	  getJson: { value: getJson$1 }
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
	    if (config.debug)
	      console.log("Try to set tags: ", tags, " to map: ", this.id, "");
	    this.tags = this.tags.concat(tags);
	    this.tags = [...new Set(this.tags)];
	    if (config.debug)
	      console.log("Tags set to map: ", this.id, " successfully! Tags: ", this.tags, "");
	    return this;
	  }
	  getParentId() {
	    if (!this.boardId || this.boardId === this.id) {
	      if (config.debug)
	        console.log("No parent id found for map: ", this.id, " !");
	      return this.boardId;
	    }
	    if (config.debug)
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
	    if (config.debug)
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
	    if (config.debug)
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
	    if (config.debug)
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
	      if (config.debug)
	        console.log("CommonSpots has no parent", boardId);
	      return null;
	    }
	    if (config.debug)
	      console.log("Get parent group:", type, boardId, parentlist[parentlist.length - 1]);
	    return parentlist[parentlist.length - 1];
	  }
	  static getBoard(mapId) {
	    if (config.debug)
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
	    if (config.debug)
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
	      if (config.debug)
	        console.log("Copying mapdata from source:", map.id);
	      for (let key in map) {
	        this[key] = clone(map[key]);
	      }
	    } else {
	      if (config.debug)
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
	        if (config.debug)
	          console.log(
	            "Found multip entries, set the static entry to index 0. Entry:",
	            this.entries,
	            this.staticEntry
	          );
	      } else {
	        this.staticEntry = entry;
	        this.entries = [entry];
	        if (config.debug)
	          console.log("Entry:", this.entries, this.staticEntry);
	      }
	      this.mapsize = { x: xy[0], y: xy[1] };
	      this.spots = /* @__PURE__ */ new Map();
	    }
	  }
	  Spots(...spots) {
	    spots.forEach((spot) => {
	      if (config.debug)
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
	      if (config.debug)
	        console.log("Spot set successfully. Spot:", name, x, y, dside, spotType2, tileType2);
	    });
	    return this;
	  }
	  initBoard() {
	    if (config.debug)
	      console.log("initBoard", this.id);
	    this.mapdata = new Array(this.mapsize.x).fill(0).map(() => new Array(this.mapsize.y).fill(0).map(() => ""));
	    this.spots.forEach((spot, name) => {
	      let pos = spot.pos[0];
	      this.mapdata[pos.x][pos.y] = name;
	    });
	    return this;
	  }
	  Generate() {
	    if (config.debug)
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
	    if (config.debug) {
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
	      if (config.debug) {
	        console.log("Found copy source. Copying a spot....");
	      }
	      for (let key in map) {
	        this[key] = clone(map[key]);
	      }
	    } else {
	      if (config.debug) {
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
	        if (config.debug) {
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
	    if (config.debug)
	      console.log("Adopting parent tags....", parent);
	    if (parent) {
	      this.tags = this.tags.concat(parent.tags);
	      this.placement = this.placement.concat(parent.placement);
	      if (config.debug)
	        console.log("Adopted parent tags....", this.tags, this.placement);
	    } else {
	      if (config.debug)
	        console.log("No parent found....");
	    }
	    return this;
	  }
	  AdoptLoot() {
	    const parent = this.getParent();
	    if (config.debug)
	      console.log("Adopting parent loot....", parent);
	    if (parent) {
	      this.addLoot(parent.loot);
	      if (config.debug)
	        console.log("Adopted parent loot....", this.loot);
	    } else {
	      if (config.debug)
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
	    if (config.debug) {
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
	const modules$2 = {
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
	  }
	};
	addModule(modules$2);

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
	  constructor(name, des, rate = 0.1) {
	    this.type = "talent";
	    this.name = name;
	    this.des = des;
	    this.effect = function() {
	    };
	    this.rate = rate;
	  }
	  Effects(callback) {
	    this.effect = callback;
	    return this;
	  }
	}
	class Trait extends Talent {
	  static init() {
	    return __async$2(this, null, function* () {
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
	    });
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
	  constructor({ id, name, des, order, group, rate, sourceEffect, conflict } = {}) {
	    if (typeof name == "string") {
	      name = [name, name];
	    }
	    if (typeof des == "string") {
	      des = [des, des];
	    }
	    super(name, des, rate);
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
	    let list = [
	      {
	        name: ["\u7EA4\u5F31", "Weak"],
	        group: "physical",
	        des: ["\u98CE\u4E00\u5439\u5C31\u5012\u4F53\u7684\u6837\u5B50\u3002", "The one who is blown down by the wind."],
	        order: 1,
	        sourceEffect: [["stamina", 1.2, "lose"]]
	      },
	      {
	        name: ["\u5F3A\u58EE", "Strong"],
	        group: "physical",
	        des: ["\u8EAB\u5F3A\u529B\u58EE\u808C\u8089\u53D1\u8FBE\u3002", "Strong and muscular."],
	        order: 0,
	        sourceEffect: [["stamina", 0.8, "lose"]]
	      },
	      {
	        name: ["\u8010\u75BC", "Tough"],
	        group: "physical",
	        des: ["\u76AE\u7CD9\u8089\u539A\uFF0C\u4E9B\u8BB8\u78D5\u78B0\u4E5F\u4E0D\u89C9\u5F97\u75BC\u3002", "The skin is thick and tough, it's hard to feel pain."],
	        order: 0,
	        sourceEffect: [["paAll", 0.8]]
	      },
	      {
	        name: ["\u4E0D\u8010\u75BC", "Tender"],
	        group: "physical",
	        des: [
	          "\u7EC6\u76AE\u5AE9\u8089\uFF0C\u4E9B\u8BB8\u78D5\u78B0\u4E5F\u4F1A\u5F88\u75DB\u3002",
	          "The skin is tender and sensitive, it will feel painful even a little bumps."
	        ],
	        order: 0,
	        sourceEffect: [["paAll", 1.2]]
	      },
	      {
	        name: ["\u6613\u4F24\u4F53\u8D28", "GlassBody"],
	        group: "physical",
	        des: [
	          "\u8EAB\u4E0A\u5F88\u5BB9\u6613\u7559\u4E0B\u75D5\u8FF9\uFF0C\u8FD8\u4E0D\u5BB9\u6613\u6D88\u9000\u3002",
	          "It leaves marks easily on the body and difficult to recover from."
	        ],
	        order: 0
	      },
	      {
	        name: ["\u65E9\u6CC4", "Premature"],
	        group: "physical",
	        des: ["\u624B\u901F\u5F88\u5FEB\uFF0C\u4F46\u5C04\u5F97\u66F4\u5FEB\u3002", "The hands is fast, but the shot is faster."],
	        sourceEffect: [["ecstacy", 2.5]]
	      },
	      {
	        name: ["\u91D1\u67AA\u4E0D\u5012", "Durable"],
	        group: "physical",
	        des: ["\u5C0F\u5144\u5F1F\u5341\u5206\u52C7\u731B\uFF0C\u91D1\u67AA\u767E\u6218\u4E0D\u5012\u3002", "The cock is very brave, he will not fail in a hundred battles."],
	        sourceEffect: [["ecstacy", 0.25]]
	      },
	      {
	        name: ["\u6027\u51B7\u6DE1", "IceCold"],
	        group: "physical",
	        des: ["\u6CA1\u6709\u4E16\u4FD7\u7684\u6B32\u671B\u3002", "The sex drive is colder than ice."],
	        sourceEffect: [
	          ["libido", 0.3],
	          ["lust", 0.3],
	          ["libido", 2, "lose"]
	        ]
	      },
	      {
	        name: ["\u6027\u6B32\u5F3A", "FireHot"],
	        group: "physical",
	        des: ["\u8EAB\u4F53\u5F88\u5BB9\u6613\u88AB\u523A\u6FC0\u5230\u3002", "The sex drive is hotter than fire."],
	        sourceEffect: [
	          ["libido", 1.5],
	          ["lust", 1.5],
	          ["libido", 0.5, "lose"]
	        ]
	      },
	      {
	        name: ["M\u4F53\u8D28", "MasochicBody"],
	        group: "SM",
	        des: ["\u660E\u660E\u5F88\u75DB\uFF0C\u4F46\u83AB\u540D\u7684\u6709\u70B9\u9178\u723D\u3002", "It's kind of pain, but oddly feel a little bit good."],
	        order: 0
	      },
	      {
	        name: ["M\u503E\u5411", "Masochicsm"],
	        group: "SM",
	        des: ["\u6218\u6597\u65F6\u503E\u5411\u5F80\u524D\u6392\u627F\u53D7\u4F24\u5BB3\u3002", "Enjoy taking damage at the front during combat."],
	        order: 10
	      },
	      {
	        name: ["S\u503E\u5411", "Sadicsm"],
	        group: "SM",
	        des: ["\u6218\u6597\u65F6\u503E\u5411\u5F80\u524D\u6392\u8F93\u51FA\u4F24\u5BB3\u3002", "Enjoys outputting damage at the front during combat."],
	        order: 0
	      },
	      {
	        name: ["A\u540D\u5668", "QualityAnal"],
	        group: "quaility",
	        des: ["\u8FD9\u4E2A\u83CA\u7A74\u7528\u8D77\u6765\u4F1A\u5F88\u723D\u3002", "Oh..!So tight.."],
	        order: 0
	      },
	      {
	        name: ["V\u540D\u5668", "QuailityVagina"],
	        group: "quaility",
	        des: ["\u8FD9\u4E2A\u79D8\u7A74\u7528\u8D77\u6765\u4F1A\u5F88\u723D\u3002", "Oh..!So tight and smooth.."],
	        order: 0
	      },
	      {
	        name: ["M\u540D\u5668", "QualityMouth"],
	        group: "quaility",
	        des: ["\u8FD9\u4E2A\u5634\u7528\u8D77\u6765\u4F1A\u5F88\u723D\u3002", "Oh..!Nice mouth pussy.."],
	        order: 0
	      },
	      {
	        name: ["\u7406\u667A", "Rational"],
	        group: "mental",
	        des: [
	          "\u65E0\u8BBA\u4EC0\u4E48\u65F6\u5019\u90FD\u80FD\u505A\u51FA\u7406\u667A\u7684\u5224\u65AD\u3002\u4ECE\u8D1F\u9762\u72B6\u6001\u4E2D\u66F4\u5BB9\u6613\u6062\u590D\u3002",
	          "Can make sensible judgments no matter what. Recover more easily from negative states."
	        ],
	        order: 5
	      },
	      {
	        name: "\u4E0D\u8FC7\u7EBF",
	        group: "mental",
	        des: "\u5BF9\u4EC0\u4E48\u662F\u90FD\u5206\u5F97\u5F88\u6E05\u695A\uFF0C\u4E0D\u4F1A\u8F7B\u6613\u8FC7\u7EBF\u3002",
	        order: -10
	      },
	      {
	        name: "\u6DE1\u6F20",
	        group: "mental",
	        des: "\u65E0\u6240\u8C13\uFF0C\u6CA1\u6709\u4EC0\u4E48\u80FD\u8BA9\u6211\u5FC3\u52A8\u7684\u3002",
	        conflict: ["\u653E\u7EB5", "\u51B2\u52A8", "\u9AD8\u8C03", "\u5F3A\u6B32"],
	        order: 0,
	        sourceEffect: [
	          ["lust", 0.75],
	          ["eager", 0.8],
	          ["satisfy", 1.2]
	        ]
	      },
	      {
	        name: "\u5F3A\u6B32",
	        group: "mental",
	        des: "\u5C0F\u5B69\u624D\u505A\u9009\u62E9\uFF0C\u6211\u5168\u90FD\u8981\uFF01",
	        order: 0,
	        sourceEffect: [
	          ["lust", 1.25],
	          ["eager", 1.2],
	          ["satisfy", 0.8]
	        ]
	      },
	      {
	        name: "\u80C6\u5927",
	        group: "mental",
	        des: "\u65E0\u6CD5\u88AB\u6050\u60E7\u6253\u5012\u3002",
	        order: 5,
	        sourceEffect: [["fear", 0.8]]
	      },
	      {
	        name: "\u80C6\u5C0F",
	        group: "mental",
	        des: "\u5BB9\u6613\u53D7\u5230\u60CA\u5413\u3002",
	        order: -5,
	        sourceEffect: [["fear", 0.8]]
	      },
	      {
	        name: "\u51B2\u52A8",
	        group: "mental",
	        des: "\u522B\u62E6\u6211\uFF0C\u6211\u5C31\u8981\u53BB\uFF01",
	        order: 5,
	        sourceEffect: [["sanity", 1.2, "lose"]]
	      },
	      {
	        name: "\u5FCD\u8010",
	        group: "mental",
	        des: "\u5FCD\u5FCD\uFF0C\u5C31\u8FC7\u53BB\u4E86\u3002",
	        order: 0,
	        sourceEffect: [
	          ["paAll", 0.9],
	          ["fear", 0.9],
	          ["lust", 0.9],
	          ["esAll", 0.9]
	        ]
	      },
	      {
	        name: "\u8106\u5F31",
	        group: "mental",
	        des: "\u545C\u545C\u545C\u2026\u2026\u73BB\u7483\u5FC3\u2026\u2026\u788E\u4E86\u3002",
	        order: 3,
	        sourceEffect: [
	          ["sanity", 1.5, "lose"],
	          ["paALL", 1.2],
	          ["fear", 1.5]
	        ]
	      },
	      {
	        name: "\u575A\u97E7",
	        group: "mental",
	        des: "\u6CA1\u6709\u4EC0\u4E48\u53EF\u4EE5\u6253\u5012\u6211\u7684\u3002",
	        order: 0,
	        sourceEffect: [
	          ["sanity", 0.8, "lose"],
	          ["paAll", 0.9],
	          ["fear", 0.9],
	          ["lust", 0.9],
	          ["esAll", 0.9]
	        ]
	      },
	      {
	        name: "\u4E0D\u670D\u8F93",
	        group: "mental",
	        des: "\u518D\u6765\u4E00\u5C40\uFF01",
	        order: 5,
	        sourceEffect: [["surrend", 0.8]]
	      },
	      {
	        name: "\u4E50\u89C2",
	        group: "mental",
	        des: "\u6BCF\u5929\u90FD\u662F\u6674\u5929\u3002",
	        order: 2,
	        sourceEffect: [
	          ["depress", 0.8],
	          ["resist", 0.8]
	        ]
	      },
	      {
	        name: "\u60B2\u89C2",
	        group: "mental",
	        des: "\u6BCF\u5929\u90FD\u662F\u9634\u5929\u3002",
	        order: -2,
	        sourceEffect: [
	          ["depress", 1.2],
	          ["resist", 1.2]
	        ]
	      },
	      {
	        name: "\u539A\u8138\u76AE",
	        group: "mental",
	        des: "\u53EA\u8981\u6211\u4E0D\u5C34\u5C2C\uFF0C\u5C34\u5C2C\u7684\u5C31\u662F\u522B\u4EBA",
	        order: 2,
	        sourceEffect: [
	          ["mortify", 0.8],
	          ["favo", 1.1]
	        ]
	      },
	      {
	        name: "\u51B7\u9759",
	        group: "\u6027\u683C",
	        des: "\u65E0\u8BBA\u4EC0\u4E48\u60C5\u51B5\u90FD\u80FD\u7EF4\u6301\u51B7\u9759\u3002",
	        order: 0,
	        sourceEffect: [
	          ["fear", 0.8],
	          ["angry", 0.8],
	          ["depress", 0.8]
	        ]
	      },
	      {
	        name: "\u50B2\u5A07",
	        group: "\u6027\u683C",
	        des: "\u624D\u4E0D\u662F\u4E3A\u4E86\u4F60\u5462\uFF01",
	        order: 0
	      },
	      {
	        name: "\u4E56\u987A",
	        group: "\u6027\u683C",
	        des: "\u54E6\uFF0C\u597D\u7684\u3002",
	        order: 5,
	        sourceEffect: [
	          ["surrend", 1.4],
	          ["resist", 0.6]
	        ]
	      },
	      {
	        name: "\u53DB\u9006",
	        group: "\u6027\u683C",
	        des: "\u6EDA\uFF01",
	        order: -10,
	        sourceEffect: [
	          ["surrend", 0.6],
	          ["resist", 1.5]
	        ]
	      },
	      {
	        name: "\u9AD8\u50B2",
	        group: "\u6027\u683C",
	        des: "\u50CF\u6211\u8FD9\u4E48\u9AD8\u8D35\u7684\u8840\u7EDF\uFF0C\u53EA\u6709\u522B\u4EBA\u914D\u5408\u6211\uFF0C\u51ED\u5565\u8BA9\u6211\u914D\u5408\u522B\u4EBA\uFF1F",
	        order: -5
	      },
	      {
	        name: "\u5584\u5AC9",
	        group: "\u6027\u683C",
	        des: "\u51ED\u4EC0\u4E48\u554A\uFF1F\u4ED6\u54EA\u6709\u5927\u5BB6\u8BF4\u7684\u90A3\u4E48\u597D\uFF0C\u5E94\u8BE5\u770B\u6211\u7684\uFF01",
	        order: 5
	      },
	      {
	        name: "\u6027\u4FDD\u5B88",
	        group: "\u6027\u89C2\u5FF5",
	        des: "\u7E41\u884D\u662F\u795E\u5723\u7684\uFF0C\u4E0D\u8BE5\u4EE5\u4EAB\u4E50\u800C\u4E3A\u4E4B\u3002",
	        order: 0
	      },
	      {
	        name: "\u6027\u5F00\u653E",
	        group: "\u6027\u89C2\u5FF5",
	        des: "\u6027\u5C31\u662F\u5A31\u4E50\u884C\u4E3A\uFF0C\u600E\u4E48\u5F00\u5FC3\u600E\u4E48\u6765\u3002",
	        order: 0
	      },
	      {
	        name: "\u7981\u6B32",
	        group: "\u6027\u89C2\u5FF5",
	        des: "\u795E\u554A\uFF0C\u8BF7\u539F\u8C05\u6211\u7684\u7F6A\u6076\uFF01",
	        order: -2,
	        sourceEffect: [
	          ["lust", 0.2],
	          ["esAll", 1.2]
	        ]
	      },
	      {
	        name: "\u653E\u7EB5",
	        group: "\u6027\u89C2\u5FF5",
	        des: "\u6027\u81EA\u7531\u4ECA\u5929\u5C31\u8981\u5B9E\u73B0\uFF01",
	        order: 2,
	        sourceEffect: [
	          ["lust", 1.8],
	          ["esAll", 0.5]
	        ]
	      },
	      {
	        name: "\u6D01\u7656",
	        group: "\u6027\u89C2\u5FF5",
	        des: "\u810F\u6B7B\u4E86\uFF0C\u522B\u78B0\u6211\uFF01",
	        order: 0,
	        sourceEffect: [
	          ["lust", 0.2],
	          ["resist", 2],
	          ["esAll", 0.9]
	        ]
	      },
	      {
	        name: "\u6027\u763E",
	        group: "\u6027\u89C2\u5FF5",
	        des: "\u5FEB\uFF0C\u6B63\u9762\u4E0A\u6211\uFF01\uFF01",
	        order: 10,
	        sourceEffect: [
	          ["lust", 2.5],
	          ["libido", 3]
	        ]
	      },
	      {
	        name: "\u9AD8\u6D01",
	        group: "\u4EBA\u54C1",
	        des: "\u8FD9\u4E2A\u4EBA\u601D\u60F3\u54C1\u5FB7\u5341\u5206\u9AD8\u5C1A\u3002",
	        order: 0
	      },
	      {
	        name: "\u5FE0\u8BDA",
	        group: "\u4EBA\u54C1",
	        des: "\u7EDD\u5BF9\u4E0D\u4F1A\u4E3B\u52A8\u80CC\u53DB\u4F60\u3002",
	        order: 0
	      },
	      {
	        name: "\u4E24\u9762\u4E09\u5200",
	        group: "\u4EBA\u54C1",
	        des: "\u4EBA\u524D\u4E00\u5957\u4EBA\u540E\u4E00\u5957\u3002",
	        order: 0,
	        sourceEffect: [
	          ["favo", 0.9],
	          ["angry", 1.1]
	        ]
	      },
	      {
	        name: "\u53D8\u6001",
	        group: "\u4EBA\u54C1",
	        des: "\u559C\u597D\u53D8\u6001\u7684\u6027\u884C\u4E3A\u3002",
	        order: 0
	      },
	      {
	        name: "\u9B3C\u755C",
	        group: "\u4EBA\u54C1",
	        des: "\u559C\u597D\u9B3C\u755C\u7684\u6027\u884C\u4E3A\u3002",
	        order: 0
	      },
	      {
	        name: "\u9AD8\u8C03",
	        group: "\u884C\u4E3A",
	        des: "\u8FD8\u6709\u8C01\u4E0D\u77E5\u9053\u6211\uFF1F",
	        order: 2
	      },
	      {
	        name: "\u4F4E\u8C03",
	        group: "\u884C\u4E3A",
	        des: "\u5E94\u8BE5\u6CA1\u4EBA\u77E5\u9053\u6211\u5427\u2026\u2026\uFF1F",
	        order: 0
	      },
	      {
	        name: "\u9AD8\u81EA\u5C0A",
	        group: "\u884C\u4E3A",
	        des: "\u6211\u662F\u6709\u5C0A\u4E25\u7684\u4EBA\uFF0C\u94B1\u4E5F\u4E0D\u80FD\u6536\u4E70\u6211\u3002",
	        order: -10
	      },
	      {
	        name: "\u65E0\u8282\u64CD",
	        group: "\u884C\u4E3A",
	        des: "\u5C0A\u4E25\u53C8\u4E0D\u80FD\u5403\uFF0C\u53EA\u8981\u7ED9\u6211\u94B1\uFF0C\u4EC0\u4E48\u90FD\u80FD\u6EE1\u8DB3\u4F60\u3002",
	        order: 10
	      },
	      {
	        name: "\u8D1E\u6D01",
	        group: "\u884C\u4E3A",
	        des: "\u6027\u884C\u4E3A\u53EA\u80FD\u8DDF\u7ED3\u5A5A\u5BF9\u8C61\u505A\uFF0C\u800C\u4E14\u5FC5\u987B\u5F97\u5A5A\u540E\u3002",
	        order: 0,
	        sourceEffect: [["lust", 0.9]]
	      },
	      {
	        name: "\u653E\u8361",
	        group: "\u884C\u4E3A",
	        des: "\u60F3\u505A\u5C31\u505A\uFF0C\u6CA1\u4EBA\u53EF\u4EE5\u7EA6\u675F\u6211\u3002",
	        order: 5,
	        sourceEffect: [
	          ["lust", 1.5],
	          ["favo", 1.5]
	        ]
	      },
	      {
	        name: "\u604B\u6155",
	        group: "\u9677\u843D",
	        des: "\u559C\u6B22\u4F46\u8BF4\u4E0D\u51FA\u53E3\u3002",
	        order: 10
	      },
	      {
	        name: "\u4F9D\u604B",
	        group: "\u9677\u843D",
	        des: "\u4F60\u4E0D\u5728\u8EAB\u8FB9\u4F1A\u611F\u5230\u5BC2\u5BDE\u3002",
	        order: 20
	      },
	      {
	        name: "\u6DF1\u7231",
	        group: "\u9677\u843D",
	        des: "\u6DF1\u7231\u7740\u4F60\u3002",
	        order: 50
	      },
	      {
	        name: "\u4E09\u4EBA\u884C",
	        group: "\u9677\u843D",
	        des: "\u540C\u65F6\u4E0E\u4F60\u4EEC\u4E24\u4EBA\u4E00\u8D77\u4EA4\u5F80\u3002",
	        order: 30
	      },
	      {
	        name: "\u670D\u4ECE",
	        group: "\u9677\u843D",
	        des: "\u662F\u4F60\u5FE0\u5B9E\u7684\u4E0B\u5C5E\u3002",
	        order: 10
	      },
	      {
	        name: "\u96B6\u5C5E",
	        group: "\u9677\u843D",
	        des: "\u662F\u4F60\u5FE0\u8BDA\u7684\u5974\u4EC6\u3002",
	        order: 20
	      },
	      {
	        name: "\u70D9\u5370",
	        group: "\u9677\u843D",
	        des: "\u653E\u5F03\u81EA\u6211\uFF0C\u5B8C\u5168\u5C5E\u4E8E\u4F60\u3002",
	        order: 50
	      },
	      {
	        name: "\u70AE\u53CB",
	        group: "\u9677\u843D",
	        des: "\u662F\u4F60\u7684\u6DEB\u4E71\u70AE\u53CB\u3002",
	        order: 10
	      },
	      {
	        name: "\u60C5\u6B32",
	        group: "\u9677\u843D",
	        des: "\u5BF9\u4F60\u840C\u751F\u611F\u60C5\u7684\u70AE\u53CB\u3002",
	        order: 20
	      },
	      {
	        name: "\u7231\u6B32",
	        group: "\u9677\u843D",
	        des: "\u5B8C\u5168\u79BB\u4E0D\u5F00\u4F60\u7684\u8EAB\u4F53\u3002",
	        order: 50
	      },
	      {
	        name: "\u6DEB\u4E71",
	        group: "\u9677\u843D",
	        des: "\u5F88\u8F7B\u6613\u7684\u5C31\u80FD\u5F20\u5F00\u53CC\u817F\u3002",
	        order: 10
	      },
	      {
	        name: "\u6DEB\u8361",
	        group: "\u9677\u843D",
	        des: "\u4E0D\u4EC5\u6DEB\u4E71\u8FD8\u653E\u8361\u3002",
	        order: 20
	      },
	      {
	        name: "\u6DEB\u9B54",
	        group: "\u9677\u843D",
	        des: "\u5DF2\u7ECF\u53D8\u6210\u4E86\u4EE5\u6027\u4E3A\u751F\u4EE5\u7CBE\u6DB2\u4E3A\u98DF\u7269\u7684\u6DEB\u9B54\u3002",
	        order: 50
	      }
	    ];
	    let conflict = [
	      ["\u5F3A\u58EE", "\u7EA4\u5F31"],
	      ["\u8010\u75BC", "\u4E0D\u8010\u75BC"],
	      ["M\u503E\u5411", "M\u4F53\u8D28"],
	      ["\u5F3A\u6B32", "\u6DE1\u6F20"],
	      ["\u80C6\u5927", "\u80C6\u5C0F"],
	      ["\u4E50\u89C2", "\u60B2\u89C2"],
	      ["\u4E56\u987A", "\u53DB\u9006", "\u50B2\u5A07"],
	      ["\u6027\u4FDD\u5B88", "\u6027\u5F00\u653E", "\u7981\u6B32", "\u653E\u7EB5", "\u6D01\u7656", "\u6027\u763E"],
	      ["\u53D8\u6001", "\u9AD8\u6D01"],
	      ["\u9B3C\u755C", "\u9AD8\u6D01"],
	      ["\u9AD8\u8C03", "\u4F4E\u8C03"],
	      ["\u9AD8\u81EA\u5C0A", "\u65E0\u8282\u64CD"],
	      ["\u9AD8\u81EA\u5C0A", "\u539A\u8138\u76AE"],
	      ["\u51B2\u52A8", "\u5FCD\u8010"],
	      ["\u8106\u5F31", "\u575A\u97E7"],
	      ["\u8D1E\u6D01", "\u653E\u8361"],
	      ["\u5FE0\u8BDA", "\u5584\u5AC9"]
	    ];
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
	  });
	}
	function getTraitJson() {
	  return __async$1(this, null, function* () {
	    let list = [];
	    let conflict = [];
	    const filesData = yield getJson("./json/traits.json").then((res) => {
	      slog("log", "Get file list from traits.json:", res);
	    });
	    if (filesData) {
	      filesData.forEach(([filename, trait]) => {
	        slog("log", "Get traits from " + filename, trait);
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
	      slog("log", "Get all the list done:", list, conflict);
	    }
	    return { list, conflict };
	  });
	}

	const modules$1 = {
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
	  }
	};
	addModule(modules$1);

	class Items {
	  static newId(group, name, cate) {
	    if (cate) {
	      return `${group}_${cate[0]}.${name[1].replace(/\s/g, "") || name[0]}`;
	    } else {
	      return `${group}_${name[1] || name[0]}`;
	    }
	  }
	  static getByName(group, name) {
	    return Array.from(Db.Items[group]).find((item) => item[1].name[0] === name || item[1].name[1] === name);
	  }
	  static getTypelist(group, cate) {
	    return Array.from(Db[group]).filter((item) => item[1].category === cate);
	  }
	  static get(Itemid) {
	    const itemGroup = Itemid.split("_")[0];
	    return Array.from(Db.Items[itemGroup]).find((item) => item[0] === Itemid);
	  }
	  constructor(name, des = name, group = "items", cate = "") {
	    this.id = Items.newId(group, cate);
	    this.name = name;
	    this.des = des;
	    this.group = group;
	    this.category = cate;
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
	  constructor(cate, name, des, gender2 = "n") {
	    super(name, des, "clothes", cate);
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
	  static new(id, { resultItemId, result, require, rate }) {
	    Db.Items["recipies"].set(id, new Recipies(resultItemId, result, require, rate));
	  }
	  static getByName(itemname) {
	    const itemId = Items.getByName("items", itemname).id;
	    return Array.from(Db.Items["Recipies"]).find((recipie) => recipie.resultItemId === itemId);
	  }
	  static getBySrcName(itemname) {
	    const itemId = Items.getByName("items", itemname).id;
	    return Array.from(Db.Items["Recipies"]).find((recipie) => recipie.require.includes(itemId));
	  }
	  constructor(itemId, result, requires, rate) {
	    this.id = Db.Items["Recipies"].size;
	    this.resultItemId = itemId;
	    this.result = result;
	    this.require = requires;
	    this.rate = rate;
	  }
	}
	class Potion extends Items {
	  constructor(name, des, type) {
	    super(name, des, "items", "potion");
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
	  constructor(name, des) {
	    super(name, des, "accessory", "sextoy");
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
	    const filesdata = yield getJson$1("./json/items.json").then((res) => {
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
	  });
	}
	const modules = {
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
	  }
	};
	addModule(modules);

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
	  critoris: "\u9634\u8482",
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

	class Species {
	  constructor({ type, name, des, gender, talent, buffs, tempture, bodysize, bodygroup, cycle, avatar }) {
	    this.type = type;
	    this.name = name;
	    this.des = des;
	    this.gender = gender;
	    this.talent = talent;
	    this.buffs = buffs;
	    this.bodyscale = bodysize.scale;
	    this.bodyheight = [bodysize.min, bodysize.max];
	    if (cycle)
	      this.cycle = cycle;
	    if (avatar)
	      this.avatar = avatar;
	    if (tempture)
	      this.tempture = tempture;
	    this.initBody(bodygroup);
	  }
	  initBody(body) {
	    this.bodyConfig = initBodyObj(body);
	  }
	  configureBody(gender) {
	    const set = clone(this.bodyConfig.settings);
	    const { genital = {}, privates = {}, organs = {} } = set;
	    if (!isValid(genital) && !isValid(privates) && !isValid(organs)) {
	      slog("warn", "No available organs to configure.");
	      return;
	    }
	    Object.assign({}, genital, privates, organs);
	    delete set.genital;
	    delete set.privates;
	    delete set.organs;
	    let parts2 = {};
	    for (const key in set) {
	      if (!isValid(set[key]) || typeof set[key] !== "object" || Array.isArray(set[key]))
	        continue;
	      parts2 = Object.assign(parts2, set[key]);
	    }
	    return;
	  }
	}
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
	Object.defineProperties(window, {
	  species: { value: Species, writable: false, configurable: false, enumerable: false },
	  initBodyObj: { value: initBodyObj, writable: true, configurable: true, enumerable: true },
	  fixLanArr: { value: fixLanArr },
	  listAllParts: { value: listAllParts }
	});

	slog(
	  "log",
	  "game/main.ts is loaded. The current language is " + (Config == null ? void 0 : Config.lan) + ". State: " + lan("\u987A\u5229\u52A0\u8F7D\u6E38\u620F\u6A21\u7EC4", "Successfully loaded game modules")
	);

})();
