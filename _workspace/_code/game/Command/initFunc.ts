import { Com } from "./com";
declare var scEra: typeof window.scEra;
declare var T: typeof window.T;
declare function DefineMacros(name: string, func: Function): void;

export function InitComList() {
	const table: any = scEra.table.get("ComList") as any;

	for (let key of Object.keys(table)) {
		let list = table[key];
		list.forEach((obj) => {
			Com.new(key, obj);
		});
	}
	console.log(Com.data);
}

export function InitComSystem() {
	const html = `
<div id='hidden' class='hidden'>you can't see me.</div>
<div id='location'></div>
<br>
<div id='content' class='content' onClick='if(S.msg)Com.next();'>
    <div id='contentMsg'>
    </div>
<div id="msg_end" style="height:0px; overflow:hidden"></div>
</div>

<div id='commandmenu'>

</div>
<br>
<div id='commandzone'>

</div>
<div id='next'>
</div>

<script>
Com.updateMovement();
Com.updateScene();
Com.updateMenu();
Com.listUp();
</script>
`;
	scEra.newPsg("MainLoop", html);

	const html2 = `<<if !$selectCom>>
<<set $selectCom = ''>>
<</if>>`;

	scEra.newPsg("MainLoop:Before", html2);
	addMacro();
	DefineMacros("resetScene", Com.resetScene);
}

function addMacro() {
	scEra.macro.add("com", {
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
        <<set _inputCom to '${comId}'>><<set $passtime to ${args[1]}>>
        ${contents}
        <</button>>
        </div>`;

			if (Config.debug) console.log(output);

			jQuery(this.output).wiki(output);
		},
	});
}
