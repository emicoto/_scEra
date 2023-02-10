if (window.Com) {
	//-------------------------------------------------------------------
	//
	//  Command Init
	//
	//-------------------------------------------------------------------
	//添加macro com
	Macro.add("com", {
		tags: null,
		handler: function () {
			let { contents, args } = this.payload[0];

			if (args.length === 0) {
				return this.error("no command text specified");
			}

			if (!T.comcount) T.comcount = 1;
			else T.comcount++;

			let comId = args[2];

			let output = `<div id='com_${T.comcount}' class='command'>
        <<button '${args[0]}'>>
        <<set $selectCom to '${comId}'>><<set $passtime to ${args[1]}>>
        ${contents}
        <</button>>
        </div>`;

			if (Config.debug) console.log(output);

			jQuery(this.output).wiki(output);
		},
	});

	//-------------------------------------------------------------------
	//
	//  Command UI
	//
	//-------------------------------------------------------------------

	Com.showFilters = function () {
		const general = clone(S.ComFilterGeneral);
		const train = clone(S.ComFilterTrain);
		const end = "<<=Com.initList()>><</link>>";
		const generalink = [];
		const trainlink = [];

		general.forEach((k) => {
			generalink.push(`<<link '${k}'>><<set $currentFilter to '${k}'>>${end}`);
		});

		train.forEach((k) => {
			trainlink.push(`<<link '${k}'>><<set $currentFilter to '${k}'>>${end}`);
		});

		return `<<link '全部'>><<set $currentFilter to 'all'>>${end} ｜ ${generalink.join(
			""
		)}<<if $mode is 'train'>>${trainlink.join("")}<</if>>`;
	};

	//生成指令列表
	Com.listUp = function () {
		const command = [];

		Object.values(Com.data).forEach((com) => {
			const { id, time } = com;
			let name = "";

			if (typeof com.name === "function") name = com.name();
			else name = com.name;

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
		} // 数量过多时启动分页显示。
	};

	Com.shownext = function () {
		let html = `<<link 'Next'>><<run Com.next()>><</link>>`;
		new Wikifier("#commandzone", `<<replace #commandzone transition>>${html}<</replace>>`);
	};

	Com.hide = function () {
		new Wikifier(null, `<<replace #commandmenu>> <</replace>>`);
		new Wikifier(null, "<<replace #commandzone>> <</replace>>");
	};

	//无论指令成功与否，都会在最后执行的处理
	Com.reset = function () {
		//更新事件状态
		T.comPhase = "reset";

		// 检测在场角色的事件
		V.location.chara.forEach((cid) => {
			F.charaEvent(cid);
		});

		//缓存指令
		V.lastCom = V.selectCom;

		//清除临时flag和缓存信息
		delete T.comCancel;
		delete T.onselect;
		delete T.comAble;
		delete T.orderGoal;
		delete T.force;

		delete S.msg;

		T.msgId = 0;
		T.comorder = 0;
		T.reason = "";
		T.order = "";
		V.selectCom = 0;

		//刷新画面
		Com.resetScene();
	};

	//--------------------------------------------------------------
	//
	//  Command Process
	//
	//--------------------------------------------------------------

	Com.updateMenu = function () {
		//set your system menu at the list
		//the first value is the condition of the menu
		//the second value is the name of the menu
		//the third value is the passage title where the menu will link to
		//the fourth value is the extra twine code what you want to add
		const list = [[true, "System", "SystemOption", ""]];

		//generate the menu
		let menu = [];
		list.forEach((a) => {
			if (a[0]) menu.push(`<<link '[ ${a[1]} ]' '${a[2]}'>>${a[3]}<</link>>`);
		});

		const html = `<span class='filter'>Filter: ${Com.showFilters()}</span>　｜　${menu.join("")}`;

		new Wikifier(null, `<<replace #commandmenu>>${html}<</replace>>`);
	};

	//reset the scene
	Com.resetScene = function () {
		V.target = C[tc];
		V.player = C[pc];
		Com.updateScene();
		Com.initList();
		Com.updateMenu();
		return "";
	};
	DefineMacroS("resetScene", Com.resetScene);

	//update the scene
	Com.updateScene = function () {
		const chara = [];
		let html = "";
		let change = "";

		// if can switch player chara
		//change = F.switchChara();

		//find the local character and generate the link
		if (V.location.chara.length) {
			V.location.chara.forEach((k) => {
				//add the twine code to the link
				let com = `<<set $tc to '${k}'>><<run F.charaEvent('${k}'); Com.resetScene()>>`;

				let t = `<u><<link '${C[k].name}'>>${com}<</link>></u>　`;

				//generate a link to the local character
				if (pc !== k) {
					if (tc == k) t = `<span style='color:#76FAF4'><${C[k].name}></span>　`;
				} else {
					let name = C[k].name;
					if (tc == k)
						name = `< ${C[k].name} >
            `;
					t = `<span style='color:#AAA'>${name}</span>　`;
				}

				chara.push(t);
			});
		}

		html = `<span style='color:#fff000'>${V.player.name}</span> ${change}　|　　${V.location.name}　|　`;
		if (chara.length) html += "" + chara.join("") + "<br>";

		new Wikifier(null, `<<replace #location>>${html}<</replace>>`);
	};

	//--------------------------------------------------------------
	//
	// the main process function
	//
	//--------------------------------------------------------------

	//next
	Com.next = function () {
		//用于刷新content_message区域的文本。
		//update the text in <div id='content_message'></div>
		if (T.msgId < S.msg.length && S.msg[T.msgId].has("<<selection", "<<linkreplace") && !T.selectwait) {
			S.msg[T.msgId] += "<<unset _selectwait>><<set _onselect to 1>>";
			T.selectwait = 1;
		}

		if (T.comPhase == "before" && T.msgId >= S.msg.length && !T.onselect && !T.selectwait) {
			Com.Event(V.selectCom, 1);
		} else {
			if (T.msgId < S.msg.length && !T.onselect) {
				P.flow(S.msg[T.msgId]);
				T.msgId++;
			}
		}
	};

	//check the condition of the command
	Com.Check = function (id) {
		const com = Com.data[id];

		T.comorder = 0;
		T.reason = "";
		T.order = "";
		T.orderGoal = Com.globalOrder(id) + com.order();
		T.comAble = Com.globalCond(id) && com.cond();
		T.msgId = 0;
		console.log(T.comAble);

		//如果对方无反抗之力，目标值强行变零。
		//if (Cond.isUncons(tc) || !Cond.canMove(tc)) T.orderGoal = 0;

		T.comPhase = "before";
		let txt = "";

		let t, c;

		//角色每次执行COM时的个人检测。
		//如果口上侧要进行阻止某个指令进行，也会在这里打断。
		if (Story.has(`Kojo_${tc}_Com`)) {
			new Wikifier("#hidden", Story.get(`Kojo_${tc}_Com`).text);
		}

		//指令执行时暂时去掉指令栏
		Com.hide();
		Com.shownext();

		if (V.system.showOrder && T.order) {
			P.msg(`配合度检测：${T.order}＝${T.comorder}/${T.orderGoal}<br><<dashline>>`);
		}

		//执行before事件。这些都是纯文本。只能有选项相关操作。
		//先执行通用的 before事件。基本用在场景变化中。
		P.msg(
			`${
				Story.get("Command::Before").text
			}<<run Com.next()>><<if _noMsg>><<unset _noMsg>><<else>><<dashline>><</if>>`
		);

		//指令专属的before事件
		let type = "Com",
			dif = "Before";
		if (Kojo.has(pc, { type, id, dif, check: 1 })) {
			txt = Kojo.put(pc, { type, id, dif });
			P.msg(txt);
			c = 1;
		}

		//执行口上侧Before事件。
		if (Kojo.has(tc, { type, id, dif })) {
			txt = Kojo.put(tc, { type, id, dif });
			P.msg(txt);
			c = 1;
		}

		//检测是否存在com.before(), 存在就在这里执行。
		if (com?.before) com.before();

		if (!Story.has(`Com_${id}`)) {
			P.flow("缺乏事件文本", 30, 1);
			Com.resetScene();
		}
		//存在待执行文本就直接出现Next按钮。
		else if (c) {
			Com.shownext();
			Com.next();
		} else {
			Com.Event(id);
		}
	};

	//执行事件
	Com.Event = function (id, next) {
		const com = comdata[id];
		const resetHtml = `<<run Com.reset()>>`;
		let txt = "",
			type = "Com";
		S.msg = [];
		T.msgId = 0;
		T.comPhase = "event";

		//总之先清除多余链接
		$("#contentMsg a").remove();

		if (T.comCancel) {
			P.msg(resetHtml);
		}

		/*else if (com.name == "移动") {
			//移动直接跳转到移动界面
			P.msg(Story.get(`Com_G0`).text);
		}*/

		//确认主控有能力执行
		else if (T.comAble) {
			//确认对象愿意配合执行
			if (
				T.orderGoal === 0 ||
				V.system.debug ||
				(T.orderGoal > 0 && T.comorder >= T.orderGoal) ||
				(com?.forceAble && T.comorder + S.ignoreOrder >= T.orderGoal)
			) {
				T.passtime = com.time;

				if (T.comorder < T.orderGoal && !V.system.debug) {
					S.msg.push(
						`配合度不足：${T.order}＝${T.comorder}/${T.orderGoal}<br>${
							com?.forceAble ? "<<run Com.next()>>" : ""
						}<br>`
					);

					if (Kojo.has(pc, { type, id, dif: "Force", check: 1 })) {
						txt = Kojo.put(pc, { type, id, dif: "Force" });
					}
					if (txt.includes("Kojo.put") === false && Kojo.has(tc, { type, id, dif: "Force" })) {
						txt += Kojo.put(tc, { type, id, dif: "Force" });
					}

					T.force = true;
				} else {
					txt = Kojo.put(pc, { type, id });

					if (txt.includes("Kojo.put") === false && Kojo.has(tc, { type, id })) {
						txt += Kojo.put(tc, { type, id });
					}
				}

				if (txt.includes("Kojo.put")) txt = F.convertKojo(txt);

				P.msg(txt);

				P.msg(`<<run comdata['${id}'].source(); F.passtime(T.passtime); Com.After()>>`, 1);

				//确认After事件。如果有就添加到 Msg中。
				if (Kojo.has(pc, { type, id, dif: "After", check: 1 })) {
					txt = `<br><<set _comPhase to 'after'>>` + Kojo.put(pc, { type, id, dif: "After" });
					if (txt.includes("Kojo.put")) txt = F.convertKojo(txt);
					P.msg(txt);
				}

				if (txt.includes("Kojo.put") === false && Kojo.has(tc, { type, id, dif: "After" })) {
					P.msg(Kojo.put(tc, { type, id, dif: "After" }));
				}

				//最后加ComEnd()
				P.msg("<<run Com.endEvent()>>", 1);
			} else {
				P.msg(`配合度不足：${T.order}＝${T.comorder}/${T.orderGoal}<br><<run F.passtime(1); >>`);
				P.msg(resetHtml, 1);
			}
		}
		//取消执行
		else {
			if (Kojo.has(pc, { type, id, dif: "Cancel", check: 1 })) {
				txt = Kojo.put(pc, { type, id, dif: "Cancel" });
				P.msg(txt);
			} else
				P.msg(
					`》条件不足无法执行指令：${typeof com.name === "function" ? com.name() : com.name}<br>原因：${
						T.reason
					}<br>`
				);

			P.msg("<<run F.passtime(1)>>", 1);
			P.msg(resetHtml, 1);
		}

		Com.shownext();
		Com.next();
	};

	//高潮、射精、刻印获得、素质变动事件的处理
	//数据处理已经打包扔 timeprocess中了。
	Com.After = function () {
		let text = "";
		return text;
	};

	//事件结束时的处理
	Com.endEvent = function () {
		T.comPhase = "end";
		const resetHtml = `<<run Com.reset()>>`;

		let text = "";

		P.msg(resetHtml);
		Com.next();
	};

	Com.updateMovement = function () {
		const local = V.location;

		//after every movement, the scene will be initialized.
		//get the movement information and character information according to the current scene.

		//if the scene is not initialized, initialize the scene.

		let txt = "";

		const title = `Msg_Spots_${local.mapId.replace(".", "_")}`;
		if (Story.has(title)) {
			txt += Story.get(title).text;
		} else {
			txt += `<<you>> are in ${local.printname}.`;
		}

		//basic on the schedule of the character, the character will be shown in the scene.
		F.summonChara();

		setTimeout(() => {
			P.flow(txt, 30, 1);
		}, 100);

		return "";
	};
}
