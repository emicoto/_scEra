import { Chara } from "./Characters";

declare function countArray(arr, type): number;
declare var D: typeof window.D;

export const getScar = function (chara: Chara, { times = 1, type, part, count = "never" }: any = {}) {
	const skin = chara.skin;
	for (let i = 0; i < times; i++) {
		skin[part].push([type, count]);
	}
	return "";
};

export const skinCounter = function (chara: Chara, t: number) {
	//对各皮肤图层上各伤痕计数器进行计算。
	const dolayer = function (layer, t) {
		for (let i = 0; i < layer.length; i++) {
			let k = layer[i];
			if (typeof k[1] == "number") {
				k[1] -= t;
				if (k[1] <= 0 && k[0] !== "wound") {
					layer.splice(i, 1);
					i--;
				} else if (k[1] <= 0) {
					k[0] = "scar";
					k[1] = "never";
				}
			}
		}
	};

	//记录结果
	const total = {};

	//统计伤痕, whip鞭痕, scar伤疤, wound创伤, pen笔迹, bruise淤痕, kissmark吻痕
	const collect = (skin) => {
		for (let i in skin) {
			if (i == "total" || i == "detail") continue;

			let layer = skin[i];
			dolayer(layer, t);
			total[i] = {};
			D.scarType.forEach((type) => {
				total[i][type] = countArray(layer, type);
			});
		}
		return total;
	};

	const count = () => {
		const result = {};

		D.scarType.forEach((type) => {
			result[type] = [0, []];
		});

		for (let i in total) {
			for (let k in total[i]) {
				if (total[i][k] > 0) {
					result[k][0] += total[i][k];

					const detail = [i, total[i][k]];
					result[k][1].push(detail);
				}
			}
		}
		return result;
	};

	const skinlayer = chara.skin;
	collect(skinlayer);
	chara.skin.total = count();

	return total;
};
