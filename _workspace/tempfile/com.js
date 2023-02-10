class Com {
	//新建指令
	static new(id, obj) {
		comdata[id] = new Com(obj);
		return comdata[id];
	}
	//获取指令设置
	static set(id, time) {
		if (time) {
			return comdata[id].Time(time);
		} else {
			return comdata[id];
		}
	}
	//初始化指令列表
	static init() {
		const list = F.makeList("ComList");
		list.forEach((obj) => {
			Com.new(obj.id, obj);
		});
		console.log(comdata);
	}
	//构建指令
	constructor({ id, name, tags = [], type, time = 5 }) {
		this.id = id;
		this.name = name;
		this.tag = [type];

		if (tags.length) this.tag = this.tag.concat(tags);

		//过滤器
		this.filter = () => {
			return true;
		};
		//条件
		this.cond = () => {
			return true;
		};
		//效果
		this.source = () => {};

		//默认经历时间
		this.time = time;

		//配合值需求
		this.order = () => {
			return 0;
		};
	}
	Check(callback) {
		this.cond = callback;
		return this;
	}
	Filter(callback) {
		this.filter = callback;
		return this;
	}
	Effect(callback) {
		this.source = callback;
		return this;
	}
	Tags(arr) {
		this.tag = arr;
		return this;
	}
	Time(t) {
		this.time = t;
		return this;
	}
	//添加标签
	addTag(arg, ...args) {
		this.tag.push(arg);
		if (args) {
			this.tag = this.tag.concat(args);
		}
		return this;
	}
	ComOrder(callback) {
		this.order = callback;
		//录入reason同时返回order值
		return this;
	}
	//动态设置指令名
	Name(callback) {
		this.name = callback;
		return this;
	}
	//即使配合度不足也可能强行执行。
	ForceAble() {
		this.forceAble = true;
		return this;
	}
}
