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
	  },
	  Init: ["initWorldMap"]
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
	      return res;
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
	  },
	  Init: ["Traitlist"]
	};
	addModule(modules$1);

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
	    const filesdata = yield getJson("./json/items.json").then((res) => {
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
	  },
	  Init: ["loadItems"]
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
	function RandomSpeciesName(species) {
	  return lan(draw(D.randomCharaNamePool));
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
	    if (trait)
	      this.initTrait(trait);
	    return this;
	  }
	  initProduce(config) {
	    this.produce = config.type;
	    if (config.amountPerDay || config.amountPerSize) {
	      this.amount = { cur: 0 };
	    }
	    if (config.amountPerDay) {
	      this.amount.day = config.amountPerDay;
	    }
	    if (config.amountPerSize) {
	      this.amount.max = config.amountPerSize * (this.sizeLv || 1);
	    }
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
	  initPenis() {
	    const size = D.Psize[this.sizeLv];
	    const d = random(size.d[0], size.d[1]) + random(8);
	    const l = random(size.l[0], size.l[1]) + random(8);
	    if (!this.size[0])
	      this.size[0] = d;
	    if (!this.size[1])
	      this.size[1] = l;
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
	          body[key].initPenis();
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
	      let adj = { bodysize: random(5), breasts: { sizeLv: this.gender === "male" ? 0 : random(10) } };
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
	    this.midname = obj.midname || "";
	    this.surname = obj.surname || "";
	    this.nickname = obj.nickname || "";
	    this.callname = obj.callname || "";
	    this.fullname = Chara.combineName(this);
	    this.title = obj.title || "";
	    this.class = obj.class || "common";
	    this.guildRank = obj.guildRank || 0;
	    this.birthday = obj.birthday || [S.startyear - 20, 1, 1];
	    this.mood = 50;
	    this.intro = obj.intro || [lan("\u89D2\u8272\u7B80\u4ECB", "CharaIntro"), lan("\u89D2\u8272\u7B80\u4ECB", "CharaIntro")];
	    this.position = obj.position || "any";
	    this.mark = {};
	    this.exp = {};
	    this.expUp = {};
	    this.pregnancy = {};
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
	    if (obj.skill) {
	      this.skill.push(...obj.skill);
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
	    this.skin = {};
	    D.skinlayer.forEach((key) => {
	      this.skin[key] = [];
	    });
	    if (this.gender == "male")
	      delete this.skin.vagina;
	    if (this.gender == "female")
	      delete this.skin.penis;
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
	    if (this.gender == "female") {
	      delete this.daily.cum;
	    }
	    if (this.gender == "male") {
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

	const module = {
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
	    Fix: {
	      LanArr: fixLanArr,
	      BodyRatio,
	      BodySizeCalc,
	      HeadSize
	    },
	    Init: {
	      InitSpecies,
	      initBodyObj
	    }
	  },
	  config: {
	    globaldata: true
	  },
	  Init: ["InitSpecies"]
	};
	addModule(module);

	slog(
	  "log",
	  "game/main.ts is loaded. The current language is " + (Config == null ? void 0 : Config.lan) + ". State: " + lan$1("\u987A\u5229\u52A0\u8F7D\u6E38\u620F\u6A21\u7EC4", "Successfully loaded game modules")
	);

})();
