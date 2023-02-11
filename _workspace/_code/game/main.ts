import "./function";
import { lan } from "./function";

import "./Maps";
import "./Traits";
import "./Items";
import "./Species";
import "./Action";
import "./Command";
import "./Dialog";
import "./Kojo";

declare global {
	interface Window {
		Config; //配置
		worldMap;
		jQuery;
		scEra;

		D; // data;
		Db; // database;
		F; // utils;
		L; // language;
		M; // modules;
		P; // documentGenerator;
		Cond; // conditions;
		Fix; // fixers;
		Init; // initializations;
		Ui; // UIControl;
		S; //setup data
		T; //temporarily variables
		V; //variables
		C;
		pc;
		tc;
		player;
		target;
		Using;
		SugarCube;
	}

	interface String {
		has: Function;
	}
	interface Array<T> {
		has: Function;
	}

	interface game {
		debug: boolean;
	}
}
declare var Config: typeof window.Config;
declare function slog(type: string, msg: string): void;

slog(
	"log",
	"game/main.ts is loaded. The current language is " +
		Config?.lan +
		". State: " +
		lan("顺利加载游戏模组", "Successfully loaded game modules")
);
