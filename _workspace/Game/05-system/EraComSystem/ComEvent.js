if (window.Com) {
	//update the scene
	Com.updateScene = function () {
		const chara = [];
		let html = "";

		//find the local character and generate the link
		if (V.location.chara.length) {
			V.location.chara.forEach((k) => {
				//add the twine code to the link
				let com = `<<set $tc to '${k}'>><<run F.charaEvent('${k}'); Com.resetScene()>>`;

				let t = `<u><<link '${C[k].name}'>>${com}<</link>></u>　`;

				//generate a link to the local character
				if (V.pc !== k) {
					if (V.tc == k) t = `<span style='color:#76FAF4'><${C[k].name}></span>　`;
				} else {
					let name = C[k].name;
					if (V.tc == k)
						name = `< ${C[k].name} >
            `;
					t = `<span style='color:#AAA'>${name}</span>　`;
				}

				chara.push(t);
			});
		}

		html = `<span style='color:#fff000'>${V.player.name || F.you()}</span>　|　　${V.location.name}　|　`;
		if (chara.length && chara.length < 5) html += "" + chara.join("") + "<br>";
		else {
			//if there are too many characters, then make a pre next button
			//to switch between the characters
			if (T.charaListIndex == null || T.charaListIndex == undefined) T.charaListIndex = 0;

			T.charaListIndexStart = Math.clamp(T.charaListIndex, 0, chara.length - 4);
			T.charaListIndexEnd = Math.clamp(T.charaListIndex + 4, 4, chara.length);

			//add the previous button
			if (T.charaListIndexStart > 0)
				html += `<<link '<<'>>><<set $T.charaListIndex to ${
					T.charaListIndexStart - 4
				}>>><<run Com.updateScene()>>><</link>>　`;

			//add the characters
			html += chara.slice(T.charaListIndexStart, T.charaListIndexEnd).join("");

			//add the next button
			if (T.charaListIndexEnd < chara.length)
				html += `<<link '>>'>>><<set $T.charaListIndex to ${T.charaListIndexEnd}>>><<run Com.updateScene()>>><</link>>　`;
			html += "<br>";
		}

		new Wikifier(null, `<<replace #location>>${html}<</replace>>`);
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
