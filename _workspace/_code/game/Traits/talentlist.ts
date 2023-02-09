declare var D: typeof window.D;
declare function getJson(path: string): Promise<any>;
declare function slog(type: "log" | "warn" | "error", ...args: any[]): void;

export async function TalentList() {
	let list = [
		{
			name: ["天才", "Genius"],
			group: "positive",
			des: [
				"天才的智慧无人知晓，他们无论学什么都很快，并且能在短时间内完成复杂的计算。",
				"Genius is a mysterious talent. They can learn anything quickly and can complete complex calculations in a short time.",
			],
			rate: 0.05,
		},
		{
			name: ["快速适应者", "FastAdaptor"],
			group: "positive",
			des: [
				"他们总能很快适应新的环境，自然恢复力也比其他人强。",
				"They can adapt to new environments quickly, and their natural recovery is stronger than others.",
			],
			rate: 0.1,
		},
		{
			name: ["魔因敏感", "MagionSensitive"],
			group: "positive",
			des: [
				"他们有敏感的魔因感应能力，能使出更强力的法式，并拥有更高的魔力储量。",
				"They have sensitive magion sensing ability, which can make stronger magic, and have higher mana capacity.",
			],
			rate: 0.1,
			conflic: ["MagionDull"],
		},
		{
			name: ["魔因迟钝", "MagionDull"],
			group: "negative",
			des: [
				"他们对魔因不敏感，无法使用强力的术式，魔力储量也比其他人少。",
				"They are not sensitive to magion, and cannot use powerful spells. Their mana capacity is also less than others.",
			],
			rate: 0.2,
			conflic: ["MagionSensitive"],
		},
		{
			name: ["雌雄莫辩", "Androgynous"],
			group: "netural",
			des: [
				"他们长得很美丽，无法区分男女。",
				"They are so beautiful that hard to distinguish which gender they are. ",
			],
			rate: 0.1,
		},
		{
			name: ["倾国倾城", "Gorgeous"],
			group: "netural",
			des: [
				"他们有着倾国倾城的容貌，只要看过一眼就无法忘怀。",
				"They have a gorgeous appearance that can't be forgotten after seeing it once.",
			],
			rate: 0.1,
		},
		{
			name: ["快速恢复", "FastRecovery"],
			group: "positive",
			des: [
				"他们各方面的恢复能力都比其他人强，仿佛打不死的小强。",
				"They are more resilient than the others in every way, as if they cannot be beaten.",
			],
			rate: 0.1,
			conflic: ["SlowRecovery"],
		},
		{
			name: ["恢复迟缓", "SlowRecovery"],
			group: "negative",
			des: [
				"他们各方面的恢复能力都比其他人弱，一不小心就会受伤。",
				"They are more vulnerable than the others in every way, and they will be injured if they are not careful.",
			],
			rate: 0.1,
			conflic: ["FastRecovery"],
		},
		{
			name: ["高等精灵", "HighElf"],
			group: "species",
			des: [
				"高等精灵是一种高等的精灵，他们的身体比普通精灵更加强壮，而且他们的魔力也比普通精灵更加强大。",
				"HighElf is a higher elf, their body is stronger than ordinary elves, and their magic is stronger than ordinary elves.",
			],
			rate: 0,
		},
	];
}
