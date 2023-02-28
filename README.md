# SugarCube + Era edition

This is a cross-platform game development tool based on the sugarcube.

这是一个基于 sugarcube 所改进而来的跨平台游戏开发工具。

This version allows you to adapt the steam API and has mod manager, mod API, local file loading, A full process cycle management, multip language support and more.

这个版本允许你适配 steam API，并且拥有 mod 管理器，mod API，本地文件加载，一个完整的运行周期管理，多语言支持等功能。

And it allows you to separate scripts from text files and use certain functions to perform various pre-processing of your scripts, text before sugarcube starts.

并且允许你分离脚本与文本文件，在 sugarcube 启动前就能使用某些功能对你的脚本、文本进行各种预处理。

## How to Start
Go to nw.js and download an sdk package and extract it to your hard drive.

Download the master package here, unzip and overwrite the nw files.

Use visual studio code to open the root directory where scEra is located.

Open the game folder under workspace's folder and then open gamestart.twee

Start writing your game.


到nw.js下载一个sdk包，解压到你的硬盘中。

下载这里的master包，解压并覆盖nw的文件。

使用visual studio code打开scEra所在的根目录。

打开workspace的文件夹下的game文件夹，找到gamestart.twee

开始编写你的游戏。


All functions have detailed notes and js documents. Please check the notes at the ts file in _code for details.

所有的function都有详细的备注与文档。详细请看_code中的ts文件。

## ProcessEvent

The following process events have been added：

以下是新增的 global 进程事件：

sugarcube:ready -- when sugarcube startup

Era:start -- after Era system start in sugarcube module

scEra:ready -- when the era system and sugarcube both is ready

scEra:apply -- after the main modules applied

module:applied -- when a modules applied successfully, will throw a modules name for linkage other modules apply function.

modules:init -- after all modules finish its initialization. let the game know its time to start next step( init mapsdata, character, player, etc.

modules:loaded -- after all modules loaded. let the game know it's ready to start, then start finish all initialization.

Dialogs.set -- global event. on a dialog event to be set

:initstory -- afert Story.init() let era system know all the csv, tables, xml data is finish initialization.

:storyinit -- before wikify :: StoryInit.

:initCharacter -- when a character finish init its data, will throw a chara data for modify

:initCreature -- when a creature finish init its data, will throw a creature data for modify.

### local 事件/local evnt:

$(#dialog).trigger('start') -- local event. on a dialog event had start

## File loader

add functional passage tags: csv, xml, table

添加功能性 passage 标签：csv、xml、table

you can use twee as csv/table/xml file, then when sugarcube loading all passage, will convert them to a obj or array store at scEra.csv/scEra.table/scEra.xml.

你可以使用 twee 作为 csv/table/xml 文件，然后当 sugarcube 加载所有段落时，会将它们转换为 obj 或数组存储在 scEra.csv/scEra.table/scEra.xml。

those obj you can use scEra.csv.get('passage title') to get the data.

这些 obj 你可以使用 scEra.csv.get('passage title')来获取数据。

also you can use Era.loadCSV, Era.parseXML, Era.parseTable those method to load any local file data.

你也可以使用 Era.loadCSV, Era.parseXML, Era.parseTable 这些方法来加载任何本地文件数据。

those function can let you manage game data in easier way.

这些函数可以让你以更简单的方式管理游戏数据。

## Passage Editor

scEra.newPsg(passageTitle, htmltext) -- dymanic add new passage to story

scEra.setPsg(passageTitle, htmltext) -- dymanic set exist passage to story. the html arg will replace all html text of the given passage.

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

## eraCommand System

an era-like text command system.

you can setup the command by csv, then use command to interact to characters or location.

with this system you can make any game like era or text based simulations game.

## Action system

an action type text command system.

this system is more advance and can go much further than eraCommand system.

Players can interact with the placement at lacations, or characters through more detailed manipulation. It also ensures that the operations are not too cumbersome and that many detailed operations can be performed with just one or two clicks.

ths action system allow you build a any game like dol/titis/era.
even much further, like: add combat command, bind keyboard, bind image to become image interaction game, etc.
