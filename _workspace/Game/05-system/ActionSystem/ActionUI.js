const selectedActionBtn = function (name) {
	return `<div class='actions selectAct'>[ ${name} ]</div>`;
};

const getBtnStyle = function (id, part, state) {
	const data = Action.data[id];
	const able = Action.able(id, part, 1);
	const order = Action.order(id, part, 1);
	let style = "gray";
	if (able || groupmatch(data.type, "目录", "交流", "固有", "常规")) {
		const select = new SelectCase();
		select
			.case("succeed", "gold")
			.case("luck succeed", "orange")
			.case("force succeed", "blue")
			.case("failed", "red")
			.else("");
		style = select.has(order);
	}
	return style;
};

const createActionBtn = function (currentSelect, actionData, layer) {
	const { id, alterName, type, onReady } = actionData;
	//如果有自定义名称，就用自定义名称。
	let name = actionData.name;
	if (alterName) name = alterName();
	let option = Action.SelectableParts(id);

	//如果是当前选中的，就清除链接并加上选中标记。
	if ((currentSelect == id && Cond.hasSelectableParts(option)) || (type == "目录" && T.actionTypeFilter == id)) {
		return selectedActionBtn(name);
	}

	const inputType = Action.getInputType(id);
	const ready = onReady ? `<<run Action.data['${id}'].onReady() >>` : "";
	const style = getBtnStyle(id);
	const link = layer == 1 ? "link" : "button";

	return `<div class='actions ${style}'><<${link} '${name}'>><<run Action.onInput('${id}', '${inputType}')>>${ready}<</${link}>></div>`;
};

const createOptionBtn = function (actionId, option, selectType) {
	//console.log(actionId, option, selectType);

	let name = D.bodyDict[option];
	if (selectType == "actor") {
		name = `用${name}`;
	}

	//如果是当前选中的，就清除链接并加上选中标记。
	if (selectType == "actor" && T.select.actPart == option) {
		return selectedActionBtn(name);
	}

	const inputType = selectType == "actor" ? "partsOption-actor" : "partsOption-target";
	const style = getBtnStyle(actionId, option);

	return `<div class='actions ${style}'><<button '${name}'>><<run Action.onInput('${actionId}', '${inputType}', '${option}')>><</button>></div>`;
};

const createSystemLinks = function (data) {
	let { name, setting, event, id, alterName } = data;
	if (alterName) name = alterName();
	if (setting) setting = `'${setting}'`;
	else setting = "";

	//console.log(name, option);

	return `<div class='actions'><<link '[ ${name} ]' ${setting}>>${
		event ? `<<run Action.data['${id}'].event(); Action.redraw();>>` : ""
	}<</link>></div>`;
};

//创建目录
const createMenu = function (typelist, outputArray, currentSelect, layer) {
	typelist.forEach((type) => {
		//获取当前类型的所有指令
		const actions = Action.typeFilter(type);
		//遍历指令
		actions.forEach((data) => {
			const { id } = data;
			if (data.filter() && Action.globalFilter(id)) {
				if (id == "Interaction") {
					outputArray[0] = createActionBtn(currentSelect, data, layer);
				} else if (id == "Touch") {
					outputArray[1] = createActionBtn(currentSelect, data, layer);
				} else {
					outputArray.push(createActionBtn(currentSelect, data, layer));
				}
			}
		});
		//
	});
};

Action.hide = function () {
	const label = "actionMenu_";

	$(`#${label + 1}`).addClass("hidden");
	$(`#${label + 2}`).addClass("hidden");
	$(`#${label + 3}`).addClass("hidden");
	$("#actionOption").addClass("hidden");

	Ui.replace(label + 1, " ");
	Ui.replace(label + 2, " ");
	Ui.replace(label + 3, " ");
	Ui.replace("actionOption", " ");
};

Action.show = function () {
	const label = "actionMenu_";

	$(`#${label + 1}`).removeClass("hidden");
	$(`#${label + 2}`).removeClass("hidden");
	$(`#${label + 3}`).removeClass("hidden");
	$("#actionOption").removeClass("hidden");
};

Action.shownext = function (hide) {
	let html = hide ? "" : `<<link 'Next'>><<run Action.next()>><</link>>`;
	new Wikifier("#next", `<<replace #next>>${html}<</replace>>`);
};

Action.updateMenu = function () {
	//获取当前动作数据。
	const selectId = T.select.id;
	const actionData = Action.data[selectId];

	//指令排序
	const layer1 = ["交流", "常规", "目录"];
	const layer2 = ["逆位", "接触", "道具", "触手", "魔法", "战斗", "命令"];
	const options = ["体位", "其他"];
	const systems = Action.typeFilter("system");

	//可选部位
	const actorOption = Action.SelectableParts(selectId, 1);
	const targetOption = Action.SelectableParts(selectId, 2);
	//const otherOptions = actionData.options ? actionData.options : [];

	//目录一览
	const mainActionMenu = ["", ""];
	const subActionMenu = [];
	const optionMenu = [];
	const partsMenu = [];
	const systemMenu = [];

	//创建目录
	createMenu(layer1, mainActionMenu, selectId, 1);
	createMenu(layer2, subActionMenu, selectId, 2);
	createMenu(options, optionMenu, selectId, 3);

	//系统目录
	systems.forEach((data) => {
		if (data.filter()) {
			systemMenu.push(createSystemLinks(data));
		}
	});

	//可选部位
	if (actorOption?.length > 1 && !Cond.justHands(actorOption)) {
		actorOption.forEach((part) => {
			partsMenu.push(createOptionBtn(selectId, part, "actor"));
		});
	}

	if (targetOption?.length > 1 && !Cond.justHands(targetOption)) {
		targetOption.forEach((part) => {
			partsMenu.push(createOptionBtn(selectId, part, "target"));
		});
	}

	let html = "";

	if (mainActionMenu.length) {
		html += mainActionMenu.join("");
	}

	if (systemMenu.length) {
		html += `<div class='actions'> | </div> ${systemMenu.join("")}`;
	}

	//console.log(selectId, partsMenu);

	Ui.replace("actionMenu_1", html);

	Ui.showhtml("actionMenu_2", subActionMenu);
	Ui.showhtml("actionOption", optionMenu);
	Ui.showhtml("actionMenu_3", partsMenu);
};

const createKeepingLinks = function (cid, actId, part) {
	const data = Action.data[actId];
	const { name } = data;

	const html = `<div class='actions keep'><<link '[ ${name} ]'>><<run Action.unset('${cid}', '${part}')>><</link>></div>`;
	return html;
};

//检测并显示持续中的动作状态。点击对应动作可以取消。
Action.onGoing = function () {
	const charalist = V.location.chara;
	const charaHtml = [];

	charalist.forEach((cid) => {
		const html = [
			`<div class='namelabel'><span style='color:#${Kojo.get(cid, "color")}'>${C[cid].name}</span>  ：</div>`,
		];
		for (let part in Using[cid]) {
			const info = Using[cid][part];
			if (info.act) {
				html.push(createKeepingLinks(cid, info.act, part));
			}
		}
		if (html.length > 1) {
			charaHtml.push(html.join(""));
		}
	});

	Ui.showhtml("keeping", charaHtml);
};

//刷新界面和对象
Action.redraw = function () {
	V.target = C[tc];
	V.player = C[pc];

	Ui.delink();
	Action.updateScene();
	Action.show();
	Action.updateMenu();
	Action.shownext(1);
	Action.onGoing();
	//Ui.sidebar()

	Ui.replace("showtime", "<<showtime>><<showmoney>>");
	return "";
};
