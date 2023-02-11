declare var scEra: typeof window.scEra;
import { Dialogs } from "./main";

export function InitDialogMain() {
	let html = `
   <dialog class='hidden'> you can't see me .</dialog>\n
      \n
   <div id='content' class='content'>
      <div id='contentMsg'>
      </div>\n
   <div id="msg_end" style="height:0px; overflow:hidden"></div>\n
   </div>\n

   <script>\n
   Dialogs.start();\n
   Dialogs.trigger();\n
   </script>\n
   `;

	scEra.newPsg("DialogMain", html);

	$(document).on("dialog:set", function (event, data) {
		console.log(event, data);
		Dialogs.before();
	});
}
