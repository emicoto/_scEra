/**
 * Define macro, passing arguments to function and store them in $args, preserving & restoring previous $args
 */
function DefineMacro(macroName, macroFunction, tags, skipArgs) {
	Macro.add(macroName, {
		isWidget: true,
		tags,
		skipArgs,
		handler() {
			scEra.Perflog.logWidgetStart(macroName);
			try {
				const oldArgs = State.temporary.args;
				State.temporary.args = this.args.slice();
				macroFunction.apply(this, this.args);
				if (typeof oldArgs === "undefined") {
					delete State.temporary.args;
				} else {
					State.temporary.args = oldArgs;
				}
			} finally {
				scEra.Perflog.logWidgetEnd(macroName);
			}
		},
	});
}

/**
 * Define macro, where macroFunction returns text to wikify & print
 */
function DefineMacroS(macroName, macroFunction, tags, skipArgs, maintainContext) {
	DefineMacro(
		macroName,
		function () {
			$(this.output).wiki(macroFunction.apply(maintainContext ? this : null, this.args));
		},
		tags,
		skipArgs
	);
}

/*
 * Similar to <<script>>, but preprocesses the contents, so $variables are accessible.
 * The variable "output" is also exposed (unlike <<run>>, <<set>>)
 *
 * Example:
 * <<twinescript>>
 *     output.textContent = $text
 * <</twinescript>>
 */
Macro.add("twinescript", {
	skipArgs: true,
	tags: null,

	handler() {
		const output = document.createDocumentFragment();

		try {
			Scripting.evalTwineScript(this.payload[0].contents, output);
		} catch (ex) {
			return this.error(`bad evaluation: ${typeof ex === "object" ? ex.message : ex}`);
		}
		// Custom debug view setup.
		if (Config.debug) {
			this.createDebugView();
		}

		if (output.hasChildNodes()) {
			this.output.appendChild(output);
		}
	},
});

/*
 * Usage:
 * <<radiovar VARNAME VALUE [LABEL]>> ONCHANGE <</radiovar>>
 *
 * Will display a radiobutton, optionally labeled, that corresponds
 * to state variable VARNAME having value VALUE.
 *
 * When var value is set to this value, silently execute ONCHANGE
 */
Macro.add("radiovar", {
	tags: null,
	handler: function () {
		if (this.args.length < 2) return this.error("missing <<radiovar>> arguments");
		var varname = this.args[0];
		var value = this.args[1];
		var content = this.payload[0].contents;
		var e = $("<input>")
			.attr({
				name: "radiovar" + Util.slugify(varname),
				id: "radiovar" + Util.slugify(varname) + "-" + Util.slugify(value),
				tabindex: 0,
				type: "radio",
			})
			.prop("checked", State.getVar(varname) == value)
			.addClass("macro-radiovar")
			.on("change.macros", function () {
				if (this.checked) {
					State.setVar(varname, value);
					Wikifier.wikifyEval(content);
				}
			});
		if (this.args[2]) e = $("<label>").append(this.args[2], e);
		e.appendTo(this.output);
	},
});
