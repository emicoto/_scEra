export type clothcategory =
	| "head"
	| "neck"
	| "facial"
	| "earing"
	| "hands"
	| "coat"
	| "upper"
	| "bottom"
	| "innerUp"
	| "innerBt"
	| "legging"
	| "shoes"
	| "onepiece"
	| "suits"
	| "none";

export type wearlayers =
	| "hat"
	| "neck"
	| "face"
	| "ears"
	| "cover"
	| "outfitUp"
	| "outfitBt"
	| "innerUp"
	| "innerBt"
	| "hands"
	| "shoes"
	| "chest"
	| "bottom";

export type shop =
	| "general" //常规商店，线上线下都有
	| "event" //只在活动中出售
	| "adluts" //只在成人商店中出售
	| "unique" //不会在商店中出售，只能从特定渠道入手
	| "drop" //掉落
	| "school" //校园商店
	| "brands" //专门店
	| "craft"; //定制、手工制作

export type clothlineup = "all" | "spring" | "summer" | "autumn" | "winter" | "special"; //特殊节日限定

export type clothtags =
	| "expose" //接近全裸
	| "transparent" //透明布料
	| "skirt" //裙子，可掀开
	| "highheel" //高跟，影响行动

	//功能性
	| "swinming" //泳装，可无视一定的暴露度
	| "raincoat" //雨衣，防淋湿
	| "dive" //潜水装
	| "waterproof" //防水布料，不会湿透。
	| "armor" //防护服，防御力提升

	//有些特殊效果与数值加成
	| "stage" //舞台装，进行表演时有加分，但在其他有要求的场合会扣分
	| "COSPLAY" //COSPLAY服装，戏服，进行表演时有加分，但在其他场合会扣分
	| "business" //商务装，在商业场合有积极效果
	| "sexy" //情趣服，增加诱惑成功率，直接穿出门会有负面效果。
	| "sports" //运动时有微弱加成效果
	| "fashion" //潮流时尚，好感获得人气获得有轻微加成
	| "magical" //魔力，有特殊效果

	//无特殊效果，但在场景描述会有变化，或者行动限制
	| "combat" //战斗服
	| "pajamas" //睡衣
	| "daily" //日常
	| "formal" //正装，允许出入高级场合
	| "school" //校服，如果不穿校服就去学校，会影响校内评价
	| "altas" //供仪制服，影响事件发生率，周围人的看法
	| "shine" // 闪耀，会发光
	| "servant" //仆从装，某些工作有微弱加成|
	| "special"; //特殊，指 圣(性)具(玩具)一类

export type coverparts =
	| "shoulders"
	| "arms"
	| "chest"
	| "waist"
	| "topB"
	| "chestF"
	| "belly"
	| "crotch"
	| "thighs"
	| "legs"
	| "butts"
	| "fullhead"
	| "fullbody"
	| "torso"
	| "top"
	| "bottom"
	| "topF"
	| "hips";

export type diff = 0 | 1 | 2 | 3;
