const CommandLine = new (require('./argv'))();
const Algorithms = require('./algorithms');
let helps = require('./profile').helps;
const scripts=require("../script/main");
const ScriptApi=require("./scriptapi");

let $default = {};
let $history = {
  players:[],
  locate:[],
  position:[]
};

let methods=[];
let argz=[];

class BuildSession {
  static createAndBind (session){
    let r = new BuildSession();
    r.session = session;
	  r.stopall=false;
    r.init();
    return r;
  }

  init(){
    this.sendText('FastBuilder connected!');
    this.session.subscribe('PlayerMessage', onPlayerMessage.bind(this));
    $default = {
      position:[0,0,0],
      block:'iron_block',
      data:0,
      method:'normal',
      su:false,
      $block:'air',
      $data:0,
      entity:'ender_crystal'
    }
	let scrtapi=new ScriptApi(this);
	for(let i of scripts){
		if(i[0]==undefined||i[1]==undefined||typeof(i[1])!="string"||i[2]==undefined||i[2].push==undefined){
			console.log("We found a invalid script,Skipping...");
			continue;
		}
		console.log("Loading script: %s,Version: %d.%d.%d",i[1],i[2][0],i[2][1],i[2][2]);
		i[0](scrtapi);
	}
  }

  onChatMessage (msg, player, files){
    let x = CommandLine.read(msg, $default,methods,argz);
	if(x.error){
		this.sendText("Unable to read your command line:"+x.error,"§4");
		return;
	}
    if(x.server.close){
      this.sendText('FastBuilder disconnecting...');
      this.session.sendCommand('closewebsocket');
      return;
    }else if(x.server.screenfetch){
      this.sendText('screenfetch' +
      '\n§bMinecraftVersion: §a' + files.Build +
      '\n§bUser: §a' + player +
      '\n§bLanguage: §a' + files.locale +
      '\n§bUserGamemode: §a' + files.PlayerGameMode +
      '\n§bBiome: §a' + files.Biome +
      '\n§bOS: §a' + (files.Plat != '' ? files.Plat : files.ClientId));
	    return;
      }else if(x.server.stopall){
	      this.stopall=true;
	      return;
      }
    this.doit(x, player, msg);
  }

  sendText (text, opts){
    opts = opts ||'§b';
    this.session.sendCommand(['say',opts+'§\"'+text+'§\"'].join(' '));
    console.log('SendText: ' + text);
  }

  showhelp(args){
    if(args.helpMessage){
      let $help = '';
      for (let i in helps){
        $help += i + ' ';
      }
      this.sendText($help);
      this.sendText('For more helps , type \'help -l\'.');
      return true;
    }else if(args.listHelp){
      for(let i in helps){
        this.sendText(helps[i]);
      }
      return true;
    }else if(args.showhelp){
        this.sendText(helps[args.showhelp],args.error ? '§4' : '§b');
        return true;
    }else{
      return false;
    }
  }

	$scrdo(m,a,b,c,d,e){
		if(m == 0){
			methods.push([a,b]);
			return;
		}else if(m == 1){
			argz.push([a,b,c,d,e]);
			return;
		}else if(m == 2){
			helps[a]=b;
		}else{
			throw new Error("Invalid call");
		}
	}

	findScript(args,player,msg,method){
		for(let i of methods){
			if(i[0]==method){
				i[1](args,player,msg);
			}
		}
	}

  doit(args, player, msg){
    console.log(args);
    let {main, header, build, collect} = args;
    let {position, block, data, method, $block, $data, entity} = header;
    let delays = build.delays;

    method = method == 'normal' ? 'replace':[method,$block,$data].join(' ');

    if(main.toRoot){
      $default.su = true;
    }
    else if(main.exitRoot){
      $default.su = false;
    }

    if(main.isCmd){

      this.sendText(($default.su ? 'root' : player) + '@FastBuilder: ' + msg);
      if(this.showhelp(args.server))return;

      let {map, foo} = Algorithms.Builder(header,build) || {};

      if(!map){
        return;
      }

      else if(map.length === 0){
        this.sendText(now() + 'Input error.You can type \'' + build.type + ' help\' to get help');
        return;
      }

      else if((map.length * delays) / 1000 >= 240 && !root){
        this.sendText(now() + 'Permission denied: Time takes more than 4 minutes.Are you root?');
        return;
      }

      if(build.entityMod){
        this.sendText(now() + 'Time need: ' + ((map.length * delays * build.height) / 1000) + 's.');
      }
      else{
        this.sendText(now() + 'Time need: ' + ((map.length * delays) / 1000) + 's.')
      }

      this.sendText(now() + 'Please wait patiently!');

        switch (foo) {
          case 'setTile':
            this.setTile(header.su, map, block, data, method, delays);
            break;

          case 'setLongTile':
            this.setLongTile(header.su, map, build.height, build.direction, block, data, method, delays);
            break;

          case 'setEntity':
            this.setEntity(header.su, map, entity, delays);
            break;

          case 'setLongEntity':
            this.setLongEntity(header.su, map, build.height, entity, delays);
            break;

          default:
		        this.findScript(args,player,msg,foo);
            break;
        }
    }

    if(collect.writeData){
      $default = header;
      this.sendText(now() + 'Data wrote!');
    }

    if(collect.get){
    this.getValue(collect.get);
    }

    else if(collect.locate){
      this.getValue('locate',collect.locate);
    }
  }

  getValue(type, other){
    if(type == 'pos' || type == 'position'){
      this.session.sendCommand(['testforblock','~','~','~','air'].join(' '),(body) => {
        let pos = [body.position.x,body.position.y,body.position.z];
        $default.position = pos;
        $history.position.push(pos);
        this.sendText('Position get: ' + $default.position.join(' '));
      });
    }

    else if(type == 'player' || type == 'players'){
      this.session.sendCommand('listd',(body) => {
        let $players = body.players;
        $history.players.push(toArray($players));

        console.log($history.players[$history.players.length - 1]);
        let $p = '';
        for(let i = 0 ; i < $history.players[$history.players.length - 1].length ; i++){
          $p = [$p,i,'.',$history.players[$history.players.length - 1][i],'; '].join('');
        }

        this.sendText(now() + 'Online players: ' + $p);
      });
    }

    else if(type == 'locate'){
      this.session.sendCommand(['locate',other].join(' '),(body) => {
        if(!body.destination){
          this.sendText('Feature not found!');
          return;
        }
        else{
          let $locate = [body.destination.x,body.destination.y,body.destination.z];
          $history.locate.push($locate);
          this.sendText('Feature found: ' + $locate.join(' '));
          this.session.sendCommand('tp '+ $locate.join(' '));
        }
      });
    }
  }

  setTile(root, list, block, data, mod, delays){
	this.stopall=false
    let t = 0;
    let that = this;
    let interval = setInterval(() => {
	    if(that.stopall==true){
		    that.stopall=false;
		    that.sendText(now()+"Structure generate has been stopped!");
		    clearInterval(interval);
		    return;
	    }
      that.session.sendCommand([
        'fill',
        list[t][0],list[t][1],list[t][2],
        list[t][0],list[t][1],list[t][2],
        block,
        data,
        mod
      ].join(' '));
      t++;
      if(t == list.length){
        that.sendText(now() + 'Structure has been generated!');
        clearInterval(interval);
      }
    }, delays);
  }

  setLongTile(root, list, len, direction, block, data, mod, delays){
	this.stopall=false;
    let t = 0;
    let dx = direction == 'x' ? len : 0;
    let dy = direction == 'y' ? len : 0;
    let dz = direction == 'z' ? len : 0;
    let that = this;
    let interval = setInterval(function() {
	   if(that.stopall==true){
		   that.stopall=false;
		   that.sendText(now()+"Structure generate has been stopped!");
		   clearInterval(interval);
		   return;
	   }
      that.session.sendCommand([
        'fill',
        list[t][0],list[t][1],list[t][2],
        list[t][0] + dx,list[t][1] + dy,list[t][2] + dz,
        block,
        data,
        mod
      ].join(' '));
      t++;
      if(t == list.length){
        that.sendText(now() + 'Structure has been generated!');
        clearInterval(interval);
      }
    }, delays);
  }

  fillTile(root, list, block, data, mod, delays){
	this.stopall=false;
    let that = this;
    let t = 0;
    let interval = setInterval(function () {
	if(that.stopall==true){
		that.stopall=false;
		that.sendText(now()+"Structure generate has been stopped!");
		clearInterval(interval);
		return;
	}
      that.session.sendCommand([
        'fill',
        list[t][0], list[t][1], list[t][2],
        list[t][3], list[t][4], list[t][5],
        block,
        data,
        mod
      ].join(' '));
      t++;
      if(t == list.length){
        that.sendText(now() + 'Structure has been generated!');
        clearInterval(interval);
      }
    }, delays);
  }

  setEntity(root, list, entity, delays){
	this.stopall=false;
    let t = 0;
    let that = this;
    let interval = setInterval(() => {
	    if(that.stopall){
		    that.stopall=false;
		    that.sendText(now()+"Generate stopped");
		    clearInterval(interval);
		    return;
	    }
      that.session.sendCommand([
        'summon',
        entity,
        list[t].join(' ')
      ].join(' '));
      t++;
      if(t == list.length){
        that.sendText(now() + 'Entity structure has been generated!');
        clearInterval(interval);
      }
    }, delays);
  }

  setLongEntity(root, list, len, direction, entity, delays){
    let t = 0;
    let that = this;
    let dx = direction == 'x' ? len : 1;
    let dy = direction == 'y' ? len : 1;
    let dz = direction == 'z' ? len : 1;
    let $List = [];
    for(let s in list){
      for(let i = 0 ; i < dx ; i ++){
        for(let j = 0 ; j < dy ; j ++){
          for(let k = 0 ; k < dz ; k ++){
            $List.push([list[s] + i -1,list[s] + j -1,list[s] + k -1]);
          }
        }
      }
    };
	this.stopall=false;
    let interval = setInterval(() => {
	    if(that.stopall){
		    that.stopall=false;
		    that.sendText(now()+"Generate stopped");
		    clearInterval(interval);
		    return;
	    }
      that.session.sendCommand([
        'summon',
        entity,
        $List[t].join(' ')
      ].join(' '));
      t++;
      if(t == $List.length){
        that.sendText(now() + 'Entity structure has been generated!');
        clearInterval(interval);
      }
    }, delays);
  }
}

function onPlayerMessage(body){
  let properties = body.properties;
  if (properties.MessageType != 'chat') return;
  this.onChatMessage(properties.Message, properties.Sender, properties);
}

function toArray(str){
  if(!!str.split(',')){
    return [str];
  }
  return str.split(',');
}

function now(){
  let date = new Date();
  return ['[',date.toTimeString().slice(0, 8),']'].join('');
}

function getMin(arr){
  let min = arr[0]
  for(let i = 1; i < arr.length; i++) {
  let cur = arr[i];
  cur < min ? min = cur : null
}
return min;
}

function get_color(r, g, b, a) {
  if(a == 0){
    return [
      'air',0
    ]
  }
    List = [];
    for (let a = 0; a < color.length; a++) {
        r1 = r - color[a].color[0];
        g1 = g - color[a].color[1];
        b1 = b - color[a].color[2];
        List.push(Math.sqrt((r1 * r1) + (g1 * g1) + (b1 * b1)));
    }
    return [color[List.indexOf(getMin(List))].name,color[List.indexOf(getMin(List))].data];
}


module.exports = BuildSession;
