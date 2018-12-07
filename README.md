# FastBuilder
![](https://coding.net/u/CAIMEO/p/FastBuilder/git/raw/master/images/FastBuilder.jpg)
FastBuilder can help you building fast in MinecraftPE.
## What is FastBuilder?
It's a NodeJS WebSocket Script,Everyone who is in your game can connet to the server which is using it, but you have to follow next steps.
## What can FastBuilder do?
Make any complex buildings in less time!
## How FastBuilder do?
Use the WebSocket script to catch clients' chat data, and output the commands by processing the data from clients.
## Why use WebSocketServer but not any Game ModPE or JS?
### WebsocketServer
　　  Support any devices.

　　  Compatible with any MinecraftBE with 0.16+ versions.

　　  Algorithms keeps upgrading!

　　  No any Ads.

　　  Useable in most servers and Minecraft Realms!
### ModPE
　　  Only Android devices, need Third-Party Apps.

　　  Many functions is no longer avaliable.

　　  Always for free but many Ads.

　　  Limited by MinecraftBE versions.

　　  Not compatible with servers or Minecraft Realms.
## How to launch FastBuilder?
This is a NodeJS script, you just need a PC,VPS, or even an Android phone（actually we haven't found any ways to run NodeJS on iOS, please tell us if you know, thanks).
#### For Android:
First, install Termux from `https://termux.com`

Then open Termux,check update:

<code>apt update && apt upgrade</code>

Next,install NodeJS:

<code>apt install nodejs</code>

Use npm to install FastBuilder:

<code>npm install fastbuilder -g</code>

Finally, launch FastBuilder:

<code>FastBuilder</code>

Type command `/connect [ip]:8080` in game.
#### For Windows:
First,download and install NodeJS from `nodejs.org`.

Then use npm to install FastBuilder:

`npm install FastBuilder -g`

Finally, launch FastBuilder:

`FastBuilder`

Type command `/connect [ip]:8080` in game.

### How to use FastBuilder?

FastBuilder is a console program.FastBuilder's commands are sending by chat,don't use it as a game command.

You need to get builder position before you start building.

`get pos`

Or set builder position

`set pos [x] [y] [z]`

You can also change variables.

E.g.
```
let x 100
let y 100
let z 100
let Millis 50
```
Variables that allow change.
```
@x Position x
@y Position y
@z Position z
@Millis Build delay
@block Default block
@method Default build method
@data Block data
@om Console information output mod
@oc Console information output color
```
#### Structures generate commands.

Round:

`round [x/y/z] [radius:int] [height:int]`

Circle:

`circle [x/y/z] [radius:int] [height:int]`

Sphere:

`sphere [solid/framework/hollow] [radius:int]`

Ligature:

`ligature [position:x y z] [position2:x y z]`