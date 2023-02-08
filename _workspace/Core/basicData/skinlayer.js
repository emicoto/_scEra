D.covergroupA = {
	//覆盖度。 决定肌肤暴露部位。
	shoulder: ["shoulder"],
	arms: ["arms"],

	chest: ["breast", "back"],
	waist: ["abdomen", "waistback"],
	topB: ["back", "waistback"],

	chestF: ["breast"],
	belly: ["abdomen", "private"],

	crotch: ["genital", "anus"],

	thighs: ["thighs"],
	legs: ["thighs", "feet"],
	butts: ["butts"],
};

D.covergroupB = {
	fullhead: ["face", "neck"],
	fullbody: Object.keys(D.covergroupA).concat(["face", "neck"]),

	torso: ["chest", "waist", "genital", "butts"],

	top: ["shoulder", "chest", "waist", "arms"],
	bottom: ["crotch", "butts", "thighs"],

	topF: ["chestF", "belly"],
	hips: ["private", "butts"],
};

D.coverlistA = Object.keys(D.covergroupA);
D.coverlistB = Object.keys(D.covergroupB);
