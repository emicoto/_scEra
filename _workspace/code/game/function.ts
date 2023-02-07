declare var Config: typeof window.Config;
declare function isValid(props: any): boolean;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;
declare function now(): string;

//根据语言设定返回对应的文本
export function lan(txt, ...txts) {
	let CN, EN;

	//如果是数组，第一个是中文，第二个是英文
	if (Array.isArray(txt)) {
		CN = txt[0];
		EN = txt[1] ? txt[1] : CN;
	}

	//如果是字符串，第一个是中文，第二个是英文
	if (typeof txt === "string") {
		CN = txt;
		EN = txts[0] ? txts[0] : txt;
	}

	if (Config.lan == "EN" && EN) return EN;
	else if (CN) return CN;
	return txt;
}

export function percent(...num) {
	let min = num[0],
		max = num[1];
	if (num.length == 3) {
		min = num[1];
		max = num[2];
	}
	return Math.clamp(Math.trunc((min / max) * 100), 1, 100);
}

export async function getJson(path) {
	const files: any[] = [];

	const response = await fetch(path);
	const filelist = await response.json();

	slog("log", `Loading json files from ${path}:`, filelist);

	const requests = filelist.map(async (file) => {
		return new Promise(async (resolve, reject) => {
			const response = await fetch("./json/" + file);
			const json = await response.json();

			if (!json || !isValid(json)) resolve(`[error] ${now()} | Failed to load json file: ${file}`);

			files.push([file, json]);
			slog("log", `[log] ${now()} | Loaded json file: ${file}:`, json);
			resolve(json);
		});
	});

	slog("log", `Waiting for json files to load...`);

	await Promise.all(requests);

	slog("log", `All json files loaded!`);

	return files;
}

Object.defineProperties(window, {
	percent: { value: percent },
	lan: { value: lan },
	getJson: { value: getJson },
});
