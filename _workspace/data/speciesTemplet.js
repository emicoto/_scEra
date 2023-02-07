const speciesTemplet = {
	type: "character",

	name: ["人类", "Human"],
	des: [
		"人类是一种智慧的生物，他们的智慧使他们能够在世界上生存下来。",
		"Human is a wise creature, their wisdom allows them to survive on the world.",
	],

	gender: ["male", "female"],
	maxAge: 100,

	talent: [
		{
			name: "FastAdaption",
			rate: 0.2,
			des: ["人类的智慧使他们能够快速适应环境。", "Human's wisdom allows them to adapt to the environment quickly."],
		},
	],

	buffs: {
		health: 1.1,
		stamina: 1.1,
		strength: 1.1,
		agility: 1.1,
		intelligence: 1.1,
		wisdom: 1.1,
		charisma: 1.1,
	},

	//the scale is the scale of the body. the min and max is the height of the body. unit is cm.
	bodysize: {
		scale: 1,
		min: 130,
		max: 200,
	},

	//tempture is the comfortable tempture of the species. unit is ℃.
	tempture: {
		min: 14,
		max: 28,
		best: 23,
		body: 37,
	},

	bodygroup: {
		//the defaultBodyType is the default body type of the species. it can be "natural" or "artificial" or 'fliud' or 'slime'.
		defaultBodyType: "natural",

		//the pos is the position relative to the group. only side has left and right.
		parts: {
			head: { name: "head", group: "head", pos: "top", count: 1 },
			eyes: { name: "eye", group: "face", pos: "front", count: 2, side: ["right", "left"] },
			ears: { name: "ear", group: "head", pos: "side", count: 2, side: ["right", "left"] },
			nose: { name: "nose", group: "face", pos: "center", count: 1 },
			mouth: { name: "mouth", group: "face", pos: "bottom", count: 1 },

			neck: { name: "neck", group: "torso", pos: "top", count: 1 },

			shoulders: { name: "shoulder", group: "shoulders", pos: "side", count: 2, side: ["right", "left"] },
			arms: { name: "arm", group: "shoulder", pos: "side", count: 2, side: ["right", "left"] },
			hands: { name: "hand", group: "shoulder", pos: "side", count: 2, side: ["right", "left"] },

			breasts: { name: "breasts", group: "chest", pos: "front", count: 1 },

			heart: { name: "heart", group: "chest", pos: "inside", count: 1 },
			lungs: { name: "lungs", group: "chest", pos: "inside", count: 1 },
			stomach: { name: "stomach", group: "belly", pos: "inside", count: 1 },
			liver: { name: "liver", group: "belly", pos: "inside", count: 1 },
			kidneys: { name: "kidneys", group: "belly", pos: "inside", count: 1 },
			intestines: { name: "intestines", group: "belly", pos: "inside", count: 1 },
			bladder: { name: "bladder", group: "belly", pos: "inside", count: 1 },

			butts: { name: "buttock", group: "buttom", pos: "back", count: 2, side: ["right", "left"] },
			thighs: { name: "thigh", group: "legs", pos: "root", count: 2, side: ["right", "left"] },
			legs: { name: "leg", group: "legs", pos: "", count: 2, side: ["right", "left"] },
			feet: { name: "foot", group: "legs", pos: "end", count: 2, side: ["right", "left"] },

			uterus: { name: "uterus", group: "belly", pos: "inside", count: 1 },
			vagina: { name: "vagina", group: "crotch", pos: "inside", count: 1 },
			clitoris: { name: "clitoris", group: "crotch", pos: "inside", count: 1 },
			penis: { name: "penis", group: "crotch", pos: "front", count: 1 },
			testicles: { name: "testicles", group: "crotch", pos: "root", count: 1 },
			anus: { name: "anal", group: "butts", pos: "inside", count: 1 },
			prostate: { name: "prostate", group: "butts", pos: "inisde", count: 1 },
		},
	},
	//menstruation or heats
	cycle: {
		type: "menst",
		circleDays: [3, 5],
		rng: [0, 3],
		pregDays: 300,
		pregType: "babies",
		ovulateNum: 1,
		frng: [0, 2],
		wombslot: 3,
	},

	avatar: {
		headtype: ["pointy", "round", "square"],
		bodytype: ["human"],
		eartype: ["human"],
		skincolor: ["pale", "white", "health", "black", "chocolate", "copper", "sunset"],
		defaulthaircolor: "brown",
		defaulteyecolor: "green",
	},
};
