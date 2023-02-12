# SugarCube + Era edition

This is a cross-platform game development tool based on the sugarcube.

这是一个基于sugarcube所改进而来的跨平台游戏开发工具。


This version allows you to adapt the steam API and has mod manager, mod API, local file loading, A full process cycle management, multip language support and more.

这个版本允许你适配steam API，并且拥有mod管理器，mod API，本地文件加载，一个完整的运行周期管理，多语言支持等功能。


And it allows you to separate scripts from text files and use certain functions to perform various pre-processing of your scripts, text before sugarcube starts.

并且允许你分离脚本与文本文件，在sugarcube启动前就能使用某些功能对你的脚本、文本进行各种预处理。


## ProcessEvent

The following process events have been added：

以下是新增的global进程事件：


sugarcube:ready  -- when sugarcube startup

Era:start  -- after Era system start in sugarcube module

scEra:ready -- when the era system and sugarcube both is ready

scEra:apply -- after the main modules applied

module:applied -- when a modules applied successfully, will throw a modules name for linkage other modules apply function.

modules:init -- after all modules finish its initialization. let the game know its time to start next step( init mapsdata, character, player, etc.

modules:loaded -- after all modules loaded. let the game know it's ready to start, then start finish all initialization.


Dialogs.set -- global event. on a dialog event to be set

:initstory    -- afert Story.init() let era system know all the csv, tables, xml data is finish initialization.

:storyinit    -- before wikify :: StoryInit.

:initCharacter  -- when a character finish init its data, will throw a chara data for modify

:initCreature -- when a creature finish init its data, will throw a creature data for modify.


### local事件/local evnt:

$(#dialog).trigger('start')  -- local event. on a dialog event had start

## File loader

add functional passage tags: csv, xml, table

添加功能性passage标签：csv、xml、table

you can use twee as csv/table/xml file, then when sugarcube loading all passage, will convert them to a obj or array store at scEra.csv/scEra.table/scEra.xml.

你可以使用twee作为csv/table/xml文件，然后当sugarcube加载所有段落时，会将它们转换为obj或数组存储在scEra.csv/scEra.table/scEra.xml。

those obj you can use scEra.csv.get('passage title') to get the data.

这些obj你可以使用scEra.csv.get('passage title')来获取数据。

also you can use Era.loadCSV, Era.parseXML, Era.parseTable those method  to load any local file data.

你也可以使用Era.loadCSV, Era.parseXML, Era.parseTable这些方法来加载任何本地文件数据。

those function can let you manage game data in easier way.

这些函数可以让你以更简单的方式管理游戏数据。


## Passage Editor
scEra.newPsg(passageTitle, htmltext)  -- dymanic add new passage to story

scEra.setPsg(passageTitle, htmltext)  -- dymanic set exist passage to story. the html arg will replace all html text of the given passage.

scEra.patchPsg(passageTitle, htmltext) -- dymanic patch html text to the last line of exist passage .

## Dialog System
A flow/bubble style dialog system.

## Species and Creatures/Character
this sysem can allow you customize species/creatures/characters, and allow the game automatically generate values, let you make random chara/creatures in easy way.

also includes management function for manage those species/creatures/character

## Game Map system
a tile/board style map system. includes random generate feature and autopath feature.

## Kojo system
Kojo, means character event and speak out.

this system help you manage chara event and chara feature, like equips preset, schedules, custom action, etc.

also includes auto check the text is still working or not. if has not text output, then kojo system will skip the event or speak out.
