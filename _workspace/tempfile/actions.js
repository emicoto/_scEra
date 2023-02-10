class Action {
	static data;
	static kojo;
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
			//if is number, convert to number
			if (!value) continue;

			if (typeof value === "string" && !isNaN(Number(value))) {
				value = Number(value);
			}
			//if has |, split and convert to array
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
