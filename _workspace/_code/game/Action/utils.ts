import { Dict } from "../types";
import { Action } from "./Action";

declare function groupmatch(value, ...args): boolean;
declare function download(filename, text, type): void;
declare var D: typeof window.D;

Action.makeGroup = "";
Action.makeTemplate = function (data: Action, mode: string) {
	const { name, template, targetPart, actPart, type } = data;

	let isCounter = mode.includes("counter");
	let isKojo = mode.includes("kojo");

	let groupTitle = `:: Action_${type}_Options[script]\n`;
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
		``,
	].join("\n");

	if (groupmatch(mode, "kojo", "msg") || isKojo) txt = "";

	const converttemplate = (template, ...args) => {
		if (!args[0]) args[0] = "{0}";
		if (!args[1]) args[1] = "{1}";

		const charaA = isCounter ? "<<target>>" : "<<you>>";
		const charaB = isCounter ? "<<you>>" : "<<target>>";
		const replace2 = isCounter ? args[1] : args[0];
		const replace3 = isCounter ? args[0] : args[1];

		return template
			.replace(/\{0}/g, charaA)
			.replace(/\{1}/g, charaB)
			.replace(/\{2}/g, replace2)
			.replace(/\{3}/g, replace3);
	};

	const ctx = (use, parts, reverse) => {
		if (!template) {
			return "";
		}
		return parts
			.map((tar) => {
				const m2 = reverse ? D.bodyDict[use] : D.bodyDict[tar];
				const m3 = reverse ? D.bodyDict[tar] : use ? D.bodyDict[use] : "{actPart}";

				return `<<case '${tar}'>>\n${isKojo ? "/* " : ""}${converttemplate(template, m2, m3)}<br>${
					isKojo ? " */" : ""
				}\n`;
			})
			.join("");
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
		txt = `:: Action_${data.id}_Options[script]\n` + txt;
	}

	const head = `${title}\n/* ${name} */\n`;
	const makeTxt = function (part, use, parts, reverse?) {
		const main = `<<switch T.${part ? "actPart" : "selectPart"}>>\n${ctx(use, parts, reverse)}<</switch>>\n\n\n`;

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
				txt += `${head}<<you>>在${name}。<br>\n\n\n`;
			}
	}

	return txt;
};

Action.output = function (mode, type) {
	//如果存在具体id，直接返回指定id的模板。
	if (mode.has("id")) {
		mode.replace("-id", "");
		const data = Action.data[type];
		return Action.makeTemplate(data, mode);
	}
	const txt = Object.values(Action.data)
		.filter(
			(action) =>
				(mode == "kojo" && !groupmatch(action.type, "General", "Menu", "Other", "System")) ||
				(type && action.type == type) ||
				(!type && action.type !== "System")
		)
		.map((data) => Action.makeTemplate(data, mode))
		.join("");

	download(txt, "Actiontemplate" + (type ? `_${type}` : ""), "twee");
};
