import { converTxt, flow, errorView } from "./utils";

//--------------------------------------------------
// declare zone
//--------------------------------------------------
declare var V: typeof window.V;
declare var T: typeof window.T;
declare var S: typeof window.S;
declare var P: typeof window.P;
declare var scEra: typeof window.scEra;
declare function setPath(obj: any, path: string, value?): any;
declare function slog(type: string, ...args: any[]): void;
declare function now(): string;

//----------------------------------------------------------------------
//
//  Dialogs system
//
//----------------------------------------------------------------------

export interface Dialogs {
	logs: any[];
	title: string;
	len: number;
	next: string;
	exit: string;
	option: any;
}

/**
 * @name Dialogs
 * @description
 * A dialog system for handle dialog flow and selection
 */
export class Dialogs {
	constructor(title, exit: string = S.defaultExit || "MainLoop", next: string = S.defaultNext || "Next Step") {
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

		if (Config.debug) console.log(this.logs);
	}
	/*--------------------------------------------
	 *  init the dialog
	 *--------------------------------------------*/
	init(raw) {
		let config,
			text = [];
		let fr;
		//parse the event text and clean the comment
		raw.forEach((line) => {
			//if the line is a config, then parse it
			if (line[0] === "#") {
				config = JSON.parse(line.replace("#:", "")) || {};
			} else if (line.match(/^\/\*(.+)\*\/$/)) {
				//clean comment
			} else {
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
	//--------------------------------------------------
	//store the event flags
	//--------------------------------------------------
	static msg: Dialogs;
	static config: any = {};
	static history: string[] = [];
	//--------------------------------------------------
	// set the event
	//--------------------------------------------------
	/**
	 * @name Dialogs.set
	 * @description
	 * Set the event
	 * @param {object} obj
	 * @param {string} obj.tp - event type
	 * @param {string} obj.id - type id
	 * @param {string} obj.nm - event name
	 * @param {string} obj.ch - chapter name or branch name
	 * @param {string} obj.exit - exit point, any string, default is "MainLoop"
	 * @example
	 * Dialogs.set({tp:"Chara",id:"Nanaly",nm:"FirstEncounter"})
	 * Dialogs.set({tp:"Story",nm:"Opening",ch:"LoopStart"})
	 * Dialogs.set({tp:"Story",nm:"Opening",ch:"FirstStart",ep:1})
	 */
	static set(obj: any) {
		const { tp, id, nm, ch, exit = S.defaultExit, next = S.defaultNext } = obj;
		if (!tp || !nm) return;

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
			next,
		};

		let title = this.combineTitle(V.event);

		V.event.fullTitle = title;
		if (!Story.has(title)) {
			new Error(`[error] ${now()} | Dialogs.set: the story is not found:` + title);
			return;
		}

		if (Config.debug) console.log("Dialogs.set", V.event, T.dialogBefore);

		//turn on the trigger
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
	//--------------------------------------------------
	// prestart the dialog
	//--------------------------------------------------
	static before(_title?: string) {
		let title = _title || V.event.fullTitle;
		T.dialogBefore = "";

		if (Story.has(title + "::Before")) {
			T.dialogBefore = title + "::Before";
			new Wikifier(null, scEra.getPsg(T.dialogBefore));
		}

		//wait for 100ms then start the dialog
		setTimeout(() => {
			new Wikifier(null, `<<goto 'DialogMain'>>`);
		}, 100);
	}
	//--------------------------------------------------
	// end the dialog
	//--------------------------------------------------
	static end(exit) {
		let title = V.event.fullTitle;
		T.dialogAfter = "";
		if (Story.has(title + "::After")) {
			T.dialogEnd = title + "::After";
			new Wikifier(null, scEra.getPsg(T.dialogAfter));
		}

		//wait for 100ms then end the dialog
		setTimeout(() => {
			new Wikifier(null, `<<goto '${exit}'>>`);
			this.config = {};
			//reset the event
			V.event = {};
			this.msg = null;
		}, 100);
	}
	//--------------------------------------------------
	//
	// init the title then start the dialog
	//
	//--------------------------------------------------
	static start() {
		const e = V.event;
		let title = e.fullTitle;

		if (e.ep) {
			title += `_ep${e.ep}`;
			Dialogs.record("ep", `ep${e.ep}`);
		}

		if (e.sp) {
			title += `:sp${e.sp}`;
			Dialogs.record("sp", `sp${e.sp}`);
		}

		if (Config.debug) console.log("InitScene", title);

		this.msg = new Dialogs(title, e.exit, e.next);
		T.eventTitle = title;

		if (this.config.jump) {
			T.msgId = this.config.jump;
		} else {
			T.msgId = 0;
		}

		this.config = {};

		const log = this.msg.logs[T.msgId];
		if (!log) return "";

		this.wiki(log, T.msgId);
	}

	/**--------------------------------------------------------------------
	 * @name Dialog.wiki
	 * @description
	 * Wikify the dialog and config.
	 * during the wikify process, the dialog will be added to the history automatically.
	 * the next button text will be set automatically.
	 * if the dialog is the last one, then the config will be stored to the msg.
	 * @param {{text:string[],config}} dialog
	 * @param {number} id
	 *---------------------------------------------------------------------*/

	static wiki(dialog: { text: string[]; config: any }, id: number) {
		//warn if the dialog is undefined
		if (!dialog) {
			let msg = `Error on wikify the dialog: the dialog is undefined or null:${this.msg.title},${id}`;

			slog("warn", msg, dialog, this.msg);
			errorView(msg);
			return;
		}

		let config = dialog.config || {};
		let txt = converTxt(dialog.text);

		//add to history
		this.history.push(txt);

		//set the next button text
		const { type = "", code = "" } = config;
		V.event.next = this.nextButton(type);

		//if is the last msg, then store the config for end check
		if (id === this.msg.len - 1) {
			this.config = config;
		}

		//wikify the text
		flow(txt);

		//if has twine code and not history mode, then wikify the code
		if (code && V.mode !== "history") {
			setTimeout(() => {
				new Wikifier(null, code);
			}, 100);
		}
	}

	//--------------------------------------------------
	static nextButton(type) {
		const select = new SelectCase();
		select.else("Next").case("return", "Back").case("jump", "End").case(["endPhase", "endEvent", "end"], "Continue");
		return select.has(type);
	}

	static trigger() {
		//set a onclick event to the div
		$("#contentMsg").on("click", function () {
			Dialogs.next();
		});

		//when MsgEnd trigger, then flow to next chapter
		$("dialog").on("MsgEnd", function () {
			Dialogs.nextScene();
		});

		//trun a trigger
		$("dialog").trigger("start", [T.eventTitle, V.event, this.msg]);
	}

	/*---------------------------------------------------------------
	 *
	 * handle the flow when click on the contents panel or next button
	 *
	 *-------------------------------------------------------------*/
	static next() {
		//if the select is waiting for user input, then return
		if (T.selectwait) {
			return;
		}
		//if after select but not the end of msg, then return wait for the next msg
		if (T.afterselect && T.msgId < this.msg.len - 1) {
			delete T.afterselect;
			return;
		}

		T.msgId++;
		let dialog = this.msg.logs[T.msgId];

		//if is the end of msg, then flow to next chapter
		if (T.msgId < this.msg.len) {
			this.wiki(dialog, T.msgId);
		}
		//if is the end of msg, then turn on a trigger
		else {
			$("dialog").trigger("MsgEnd");
		}
	}
	/*---------------------------------------------------------------
	 *
	 * on the end of msg.
	 *
	 * -------------------------------------------------------------*/
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
	/*---------------------------------------------------------------
	 * return to the last ep
	 * usually used in the end of sp, then back to the last selection
	 * -------------------------------------------------------------*/
	static return(config) {
		const e = V.event;
		const { phase } = config;
		if (phase) T.msgId = phase;

		e.sp = 0;
		e.lastId = V.selectId;
		V.selectId = 0;

		this.start();
	}
	/*---------------------------------------------------------------
	 * jump to the other event
	 * usually used in the end of ep or sp, then jump to the other event
	 * -------------------------------------------------------------*/
	static jump(config) {
		const e = V.event;
		const setList = ["name", "eid", "ch", "ep"];

		//if set a target, then reset the ep and sp
		if (config.target) {
			e.ep = 0;
			e.sp = 0;
		}

		setList.forEach((key) => {
			if (config[key]) e[key] = config[key];
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
	/*---------------------------------------------------------------
	 * end the phase
	 * usually used in the end of ep or sp, then go to next ep or sp
	 * -------------------------------------------------------------*/
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

		//if doesn't set any branch point, then just goto the next ep
		if (!setflag) {
			e.ep++;
		}

		T.msgId = 0;
		e.lastSelect = V.selectId;
		V.selectId = 0;

		if (!config.sp) e.sp = 0;

		this.start();
	}
	//---------------------------------------------------------------
	//  record the dialog to the memory
	//  char is the type of the point, like ep, sp, etc.
	//  point is the point of the dialog, like ep1, sp1, etc.
	//---------------------------------------------------------------
	static record(char, point) {
		const { type, id, ep } = V.event;
		let now = point;

		if (char === "sp" && ep) {
			now = `ep${ep}:` + point;
		}

		let memory = setPath(V, `memory.${type}.${id}`);
		if (!memory || !memory[point]) {
			setPath(V, `memory.${type}.${id}.${point}`, []);
			memory = setPath(V, `memory.${type}.${id}`);
		}
		if (!memory[point].includes(now)) {
			memory[point].push(now);
		}
	}
	//---------------------------------------------------------------
	//
	//  clear the dialog from #contentMsg by step
	//
	//---------------------------------------------------------------
	static clear(step) {
		let msg: string | string[] = $("#contentMsg").html();
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
}

Dialogs.history = [];
Dialogs.config = {};
