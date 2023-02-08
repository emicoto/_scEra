import "./function";
import { lan } from "./function";

import "./Maps";
import "./Traits";
import "./Items";
import "./Species";

declare global {
	interface Window {
		loadOrder; //加载顺序
		settings; //设置
		data; //数据
		database; //数据库
		utils; //工具
		documentGenerator; //文档生成器
		modules; //模块
		Config; //配置
		UIControl; //UI控制
		conditions; //条件
		fixers; //修复器
		language; //语言
		initializations; //初始化
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
		scEra;
		worldMap;
		S; //setup data
		jQuery;
	}

	interface String {
		has: Function;
	}
	interface Array<T> {
		has: Function;
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
