//------------------------------------------------------------
//
//  add selection macro
//
//------------------------------------------------------------

Macro.add("selection", {
	tags: ["select"],
	handler: function () {
		const len = this.payload.length;
		let replace = this.payload[0].args.includes("replace");
		let event = this.payload[0].args.includes("event");

		/*--------------------------------------------
		 *  check if there is a selection
		 *--------------------------------------------*/
		if (len === 1) {
			return this.error("no selection specified");
		}

		for (let i = 1; i < len; i++) {
			for (let i = 1; i < len; i++) {
				if (this.payload[i].args.length === 0) {
					return this.error(`no value(s) specified for <<${this.payload[i].name}>> (#${i})`);
				}
				if (this.payload[i].args.length > 4) {
					return this.error("a maxinum of 3 values can be set.");
				}
			}
		}

		/*--------------------------------------------
		 *  create debug view
		 *--------------------------------------------*/

		const debugView = this.debugView;
		if (Config.debug) {
			debugView.modes({
				nonvoid: false,
				hidden: true,
			});
		}

		/*--------------------------------------------
		 *  create selection output
		 *--------------------------------------------*/

		let output = "";
		let jump;

		for (let i = 1; i < len; i++) {
			if (Config.debug) {
				this.createDebugView(this.payload[i].name, this.payload[i].source).modes({ nonvoid: false });
				console.log(this.payload[i]);
			}

			let { args, contents } = this.payload[i];
			let sid = i;

			//check if there a number in args
			let arg = args.join("");
			if (arg.match(/\d+/)) {
				sid = arg.match(/\d+/)[0];
				//remove number from args
				args.delete(sid);
			}

			//check if there a jump in args
			if (args.includes("jump")) {
				jump = true;
				//remove jump from args
				args.delete("jump");
			}

			if (event) {
				/*--------------------------------------------
				 *  on event mode
				 *  add select point to contents
				 *  let event system automatically handle the selection to next dialog
				 *--------------------------------------------*/
				let txt = "";
				if (Story.has(`${T.eventTitle}:s${sid}`) && V.mode !== "history") {
					txt = Story.get(`${T.eventTitle}:s${sid}`).text;
				}
				contents = `<<set $event.lastPhase to ${T.msgId - 1}>>${txt}\n${contents}`;
			}

			/*--------------------------------------------
			 * add common twine script
			 *--------------------------------------------*/
			contents = `<<set $selectId to ${sid}>><<unset _selectwait>><<run Ui.removelink();T.afterselect = true>>${contents}`;
			/*--------------------------------------------
			 *  on jump mode let the event dialog jump to selected branch
			 *--------------------------------------------*/
			if (jump) {
				console.log(args);
				let exit = args[1].match(/ep\d+|sp\d+/g);
				let code = "";
				if (exit) {
					exit.forEach((set) => {
						let id = set.match(/\d+/g)[0];
						let type = set.match(/[a-z]+/g)[0];
						code += `V.event.${type} = ${id};`;
					});
				}

				contents = `<<link "${args[0]}">>${contents}<<run ${code}Ui.removelink(); Dialogs.start();>><</link>>`;
			}
			//--------------------------------------------
			//  on replace mode
			//  switch to linkreplace then when player selected
			//  will replace to the contents
			//--------------------------------------------
			else if (replace) {
				contents = `<<linkreplace "${args[0]}">>${contents}<</linkreplace>>`;
			}
			//--------------------------------------------
			// otherwise just add link
			//--------------------------------------------
			else {
				let exit = "$passage";
				if (args[1]) exit = `"${args[1]}"`;
				if (event) exit = "";

				contents = `<<link "${args[0]}" ${exit}>>${contents}<</link>>`;
			}

			output += `<div class='selection'>${contents}</div>`;
		}
		if (Config.debug) console.log(output);

		jQuery(this.output).wiki(`<<set _selectwait to true>><div id='selectzone'>${output}</div>`);
	},
});

Ui.removelink = function () {
	$("#contentMsg a").remove();
};
DefineMacroS("removelink", Ui.removelink);
