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

				contents = `<<set $event.sp to${sid}>><<set V.event.phase to 0>>${txt}\n${contents}`;

				V.event.lastPhase = V.event.phase - 1;
			}

			/*--------------------------------------------
			 * add common twine script
			 *--------------------------------------------*/
			contents = `<<set $seletId to ${sid}>><<unset _selectwait>><<removelink>>${contents}`;

			/*--------------------------------------------
			 *  on replace mode
			 *  switch to linkreplace then when player selected
			 *  will replace to the contents
			 *--------------------------------------------*/
			if (replace) {
				contents = `<<linkreplace "${args[0]}">>${contents}<</linkreplace>>`;
			} else {
				let exit = args[1] ? `"${args[1]}"` : "$passage";
				contents = `<<link "${args[0]}" ${exit}>>${contents}<</link>>`;
			}

			output += `<div class='selection'>${contents}</div>`;
		}
		if (Config.debug) console.log(output);

		jQuery(this.output).wiki(`<<set _selectwait to true>><div id='selectzone>${ouput}</div>`);
	},
});

Ui.removelink = function () {
	$("#selectzone").remove();
};
DefineMacroS("removelink", Ui.removelink);
