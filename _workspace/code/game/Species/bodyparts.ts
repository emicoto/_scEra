//this is a list of all the bodyparts and a translation for them
export const bodyDict = {
	//head group
	head: "头部",
	eyes: "双眼",
	eyeL: "左眼",
	eyeR: "右眼",
	eye: "眼睛",
	ears: "耳朵",
	earL: "左耳",
	earR: "右耳",
	ear: "耳朵",

	face: "面部",
	nose: "鼻子",
	mouth: "嘴巴",
	hairs: "头发",
	hair: "头发",
	brain: "大脑",
	beak: "喙",

	//shoudler group
	neck: "脖子",
	shoulders: "肩部",
	shoulderL: "左肩",
	shoulderR: "右肩",
	shoulder: "肩部",
	arms: "手臂",
	armL: "左臂",
	armR: "右臂",
	arm: "手臂",
	hands: "双手",
	handL: "左手",
	handR: "右手",
	hand: "手",
	wrists: "手腕",
	wristL: "左手腕",
	wristR: "右手腕",
	wrist: "手腕",
	fingers: "手指",
	finger: "手指",

	//torso group
	torso: "胴体",
	body: "身体",
	top: "上身",
	organ: "器官",
	organs: "器官",
	slimebody: "史莱姆身",
	snakebody: "蛇身",
	tailbody: "尾身",
	hoursebody: "马身",

	abdomen: "腹部",
	belly: "肚子",
	back: "背部",
	waist: "腰部",

	//chest group
	chest: "胸腔",
	nipple: "乳头",
	breasts: "胸部",
	breastL: "左胸",
	breastR: "右胸",
	breast: "胸部",

	heart: "心脏",
	hearts: "心脏",
	lung: "肺",
	lungs: "肺部",
	lungL: "左肺",
	lungR: "右肺",

	//organs group
	liver: "肝",
	stomach: "胃",
	intestine: "肠道",
	bladder: "膀胱",
	ovary: "卵巢",
	testicles: "睾丸",
	testicle: "睾丸",
	prostate: "前列腺",
	uetrus: "子宫",
	womb: "子宫",
	fetus: "胎儿",

	//bottom group
	bottom: "下身",
	groin: "腹股沟",
	crotch: "裆部",
	privates: "私处",
	private: "私处",
	genital: "生殖器",
	genitals: "生殖器",
	clitoris: "阴蒂",
	anal: "肛门",
	penis: "阴茎",
	vagina: "阴道",
	anus: "肛门",
	urin: "尿道",
	urinary: "尿道",
	urethral: "尿道口",

	//hips to legs
	hips: "臀部",
	butts: "屁股",
	buttL: "左臀",
	buttR: "右臀",
	thighs: "大腿",
	thighL: "左大腿",
	thighR: "右大腿",
	thigh: "大腿",
	legs: "腿部",
	legL: "左腿",
	legR: "右腿",
	leg: "腿",

	feet: "双脚",
	footL: "左脚",
	footR: "右脚",
	foot: "脚",
	hoofs: "双蹄",
	hoof: "蹄",
	hoofL: "左蹄",
	hoofR: "右蹄",
	ankles: "脚踝",
	ankleL: "左脚踝",
	ankleR: "右脚踝",

	//extra parts
	wings: "翅膀",
	wingL: "左翼",
	wingR: "右翼",
	horns: "角",
	horn: "角",
	hornL: "左角",
	hornR: "右角",

	tails: "尾巴",
	tail: "尾巴",
	tentacles: "触手",

	skin: "皮肤",
	fur: "皮毛",
	furs: "皮毛",
};

//this is the bodygroup use to configure the bodyparts
export const bodyGroup = [
	"organs",
	"bottom",
	"genital",
	"privates",
	"belly",
	"abdomen",
	"chest",
	"waist",
	"back",
	"top",
	"chest",
];

//position dict for configure the bodyparts.
//use to describe the relative position of parts in the group.
export const posDict = {
	s: "side", //两侧
	l: "left", //左侧
	r: "right", //右侧
	f: "front", //前面
	b: "back", //后面
	t: "top", //顶部
	d: "bottom", //底部
	c: "center", //中心
	e: "end", //末端
	i: "inside", //内部
	o: "outside", //外部
	rt: "root", //根部
};

//mouth diameter = bodyheight/40 * (1+mouthsize*0.15) + random(10)
//max mouth size 5

export const Psize = [
	{ l: [40, 60], d: [10, 20] }, //0, micro
	{ l: [60, 90], d: [20, 36] }, //1, tiny
	{ l: [90, 134], d: [30, 48] }, //2, small
	{ l: [130, 152], d: [40, 52] }, //3, normal
	{ l: [150, 170], d: [42, 58] }, //4, big
	{ l: [164, 184], d: [54, 70] }, //5, huge
	{ l: [176, 210], d: [64, 90] }, //6, giant
	{ l: [200, 250], d: [72, 100] }, //7, titantic
	{ l: [250, 400], d: [90, 148] }, //8, dragon
];

//testsize = psize.l/2 + 15 + random(10)

//bodysize to bodyheight
//the values is basic on human standart, other species has their own scale value.
export const bodysize = [
	[1300, 1450], // 0, tiny
	[1450, 1600], // 1, small
	[1600, 1750], // 2, normal
	[1750, 1900], // 3, tall
	[1900, 2050], // 4, huge
	[2050, 2200], // 5, giant
];

//old verison:
//size: 0=tiny 137~147, 1=small 147~164, 2=normal 164~174, 3=tall 174~184, 4=verytall 184~200, 5=huge 200~220, 6=giant 220+
