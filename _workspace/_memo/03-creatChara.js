const { randomInt } = require("crypto");

Chara.creatRandomChara = function(cname="", gender = "", race = "", kojo=""){
    
    console.log('begincreatRandomChara')
    console.log(V.randomCharaCount)
    V.randomCharaCount +=1;
    var cid = `R${V.randomCharaCount}`;
    gender = gender==''? "female":gender;
    race = race==''? "human":race;
    kojo = kojo==''? "":kojo;
    cname = cname==''? Chara.RandomName(gender):cname;
    console.log(cid,cname,gender,race,kojo)
    var chara = new Chara(cid,cname,gender,race,kojo)
    .initChara("")
    .setBirth(Chara.RandomBirth(race))
    .setTitle("")
    .setJob("")
    .setTraits(Chara.RandomTraits([],gender))
    .setAppearance(Chara.RandomAppearance(gender))
    .setAbility(Chara.RandomAbility())
    .setSexAbl(Chara.RandomSexAbl())
    
    //.setOrgan()
    //.setFame()
    
    chara = Chara.RandomVirginity(chara);
    chara.setExp(Chara.RandomExp(chara));
    
    console.log(chara);
    return chara;

    
};

Chara.RandomName = function(gender,type = ""){
    const namestore = D.RandomName;
    type = type==='' ? draw(['西式','和风']):type;
    console.log(draw(namestore[type][gender]))
    return draw(namestore[type][gender])
};
Chara.RandomBirth = function(race){
    const date = V.date
    if (race == 'human'){
        var Byear = date.year-random(16,25);
        var Bmonth = random(1,12);
        var Bday = random(1,30);
    }
    console.log('finish randombrith')
    return [Byear, Bmonth, Bday];
};
Chara.RandomTraits = function(setTrait = [],gender){
    //生成随机素质
    var traitGroup = {};
    Trait.list('group').forEach(traitType => {
        traitGroup[traitType] = Trait.list(traitType);
    });
    var noConflic = false
    var count = 0 //防止死循环
    while (noConflic == false && count <100){
        var randomTrait = clone(setTrait);
        //体质
        traitGroup['体质'].forEach(trait => {
            if (Math.random()<trait.randrate){randomTrait.push(trait)};
        });
        //SM倾向
        traitGroup['SM倾向'].forEach(trait => {
            if (Math.random()<trait.randrate){randomTrait.push(trait)};
        });
        //名器度
        traitGroup['名器度'].forEach(trait => {
            if (Math.random()<trait.randrate){randomTrait.push(trait)};
        });
        //天赋
        traitGroup['天赋'].forEach(trait => {
            if (Math.random()<trait.randrate){randomTrait.push(trait)};
        });
        //精神
        traitGroup['精神'].forEach(trait => {
            if (Math.random()<trait.randrate){randomTrait.push(trait)};
        });
        //性格
        randomTrait.push(draw(traitGroup['性格']));
        //性观念
        var traintXGN = [];
        do {
            traintXGN = [];
            traitGroup['性观念'].forEach(trait => {
                if (Math.random()<trait.randrate){traintXGN.push(trait)};
            });
        } while (traintXGN.length>1);
        traintXGN.forEach(trait => {
            randomTrait.push(trait);
        });
        //行为
        var traintXW = [];
        do {
            traintXW = [];
            traitGroup['性观念'].forEach(trait => {
                if (Math.random()<trait.randrate){traintXW.push(trait)};
            });
        } while (traintXW.length>1);
        traintXW.forEach(trait => {
            randomTrait.push(trait);
        });
        noConflic = Chara.CheckTraitConflic(randomTrait,gender);
        count += 1;
    }
    if (count >= 100){console.Console('素质存在死解!')};
    console.log('finish randomtrait')
    return randomTrait;
};
Chara.CheckTraitConflic = function(traitList,gender){
    var conflicList =[];
    traitList.forEach(trait => {
        conflicList.push(trait.conflic);
    });
    traitList.forEach(trait => {
        if (conflicList.includes(trait)){
            return false;
        };
    });
    if (['female','male'].includes(gender)){
        D.traitGenderConflic[gender].forEach(trait =>{
            if (traitList.includes(trait)){return false}
        })
    }
    return true;
}
//TODO
Chara.RandomTalent = function(setTalent = []){
    var randomTalent = clone(setTalent);
    console.log('finish randomtalent')
    return randomTalent;
};
Chara.RandomSkill = function(){
    return[];
};
Chara.RandomAppearance = function(gender){
    var eyecolor = draw(D.RandomColor);
    var haircolor = draw(D.RandomColor);
    var hairstyle = draw(D.RandomHairstyle[gender]);
    var skincolor = "健康";
    console.log('finish randomappearance')
    return {eyecolor: eyecolor,
    haircolor: haircolor,
    hairstyle: hairstyle,
    skincolor: skincolor,}
};
Chara.RandomAbility = function(){
    console.log('finish randomability')
    return {};
};
Chara.RandomSexAbl = function(){
    console.log('finish randomsexabl')
    return { refuse: 4 };
};
Chara.RandomOrgan = function(){
    console.log('finish randomorgan')
    return [];
};
Chara.RandomFame = function(){
    console.log('finish fame')
    return [];
};
Chara.RandomExp = function(chara){
    var RandomExp = {};
    if (chara.gender !== 'female'){
        if (chara.virginity["vagina"] !== []){
            RandomExp['V'] = randomInt(1,5);
            RandomExp['V高潮'] = randomInt(0,2);
            RandomExp['高潮'] = RandomExp['V高潮'];
            RandomExp['精液'] = randomInt(0,2);
            RandomExp['性交'] = 1;
        }
    }
    if (chara.gender !== 'male'){
        if (chara.virginity["penis"] !== []){
            RandomExp['C'] = randomInt(1,5);
            RandomExp['C高潮'] = randomInt(0,2);
            RandomExp['高潮'] = RandomExp['C高潮'];
            RandomExp['射精'] = RandomExp['C高潮'];
            RandomExp['插入'] = 1;
            RandomExp['性交'] = 1;
        }
    }
    if (chara.virginity["kiss"] !== []){
        RandomExp['M'] = randomInt(1,5);
        RandomExp['接吻'] = 1;
    }
    if (chara.virginity["Anal"] !== []){
        RandomExp['A'] = randomInt(1,5);
        RandomExp['A高潮'] = randomInt(0,2);
        RandomExp['A高潮'] = RandomExp['A高潮'];
        RandomExp['精液'] = randomInt(0,2);
        RandomExp['肛交'] = 1;
    }
    console.log('finish randomexp')
    return RandomExp;
}
Chara.RandomVirginity = function(chara){
    var loseKissRate = 0.1;
    var loseAnalRate = 0.05;
    var loseHandRate = 0.15;
    var losePenisRate = 0.2;
    var loseVaginaRate = 0.05;
    if (Math.random()<loseKissRate){
        chara.setVirginity("kiss", "不明", "不明", "不明");
    }
    if (Math.random()<loseHandRate){
        chara.setVirginity("handholding", "不明", "不明", "不明");
    }
    if (Math.random()<loseAnalRate){
        chara.setVirginity("anal", "不明", "不明", "不明");
        chara.setVirginity("analsex", "不明", "不明", "不明");
    }
    if (chara.gender !== "female" && Math.random()<losePenisRate) {
        chara.setVirginity("penis", "不明", "不明", "不明");
    }
    if (chara.gender !== "male" && Math.random()<loseVaginaRate) {
        chara.setVirginity("vagina", "不明", "不明", "不明");
        chara.setVirginity("vaginasex", "不明", "不明", "不明");
    }
    console.log('finish virginity')
    return chara
}