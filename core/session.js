const readMessage = require('./argv');
const Algorithms = require('./algorithms');
const helps = require('./profile').helps;
//const color = require('../script/colortables');
//const get_pixels = require('get-pixels');

let $default = {};
let $history = {
  players:[],
  locate:[],
  position:[]
};

var methods=[];

class BuildSession {
  static createAndBind (session){
    let r = new BuildSession();
    r.session = session;
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
  }

  onChatMessage (msg, player, files){
    let x = readMessage(msg, $header());
    if(x.server.close){
      this.sendText('FastBuilder disconnecting...');
      this.session.sendCommand('closewebsocket');
    }else if(x.server.screenfetch){
      this.sendText('screenfetch' +
      '\n§bMinecraftVersion: §a' + files.Build +
      '\n§bUser: §a' + player +
      '\n§bLanguage: §a' + files.locale +
      '\n§bUserGamemode: §a' + files.PlayerGameMode +
      '\n§bBiome: §a' + files.Biome +
      '\n§bOS: §a' + (files.Plat != '' ? files.Plat : files.ClientId));
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
	    if(args.error){
		     this.sendText(helps[args.showhelp],'§4');
      }else{
        this.sendText(helps[args.showhelp]);
      }
      return true;
    }else{
      return false;
    }
  }

	subscribe(method,cb){
		methods.push([method,cb]);
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
    let {main, header, build, collect, server} = args;
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
      this.showhelp(args.server);

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

      /*if(foo == 'paint'){
        this.sendText(now() + 'Loading pixels painting module..','§e');
      }*/

      else if(build.entityMod){
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

          case 'paint':
            this.Paint(build.path, position[0], position[1], position[2]);
            break;

          default:
		        this.findScript(args,player,msg,foo);//throw new Error('Unknown function.');
            break;
        }
    }

    if(collect.writeData){
      $header(true, header);
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
    let that = this;

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
        $history.players.push($players);

        console.log($players)
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

  Paint(path, x, y, z){
	if(!path){
    this.showhelp({
      showhelp:"paint",
      error:true
    });
    return;
  }
    this.sendText(now() + 'PaintingGenerator: Loaded.','§e');
    let BuildList = [];
    get_pixels(path, (err, pixels) => {
      this.sendText(now() + 'PaintingGenerator: Start loading image from the path.','§e');
      if(err){
        this.sendText('PaintingGenerator: ' + err, '§e');
        return;
      }

      let arr = pixels.data;
      let All = [];
      let $d = [];

      for (let i = 0 ; i < arr.length; i++){
        $d.push(arr[i]);
        if(i != 0 && (i + 1) % 4 == 0){
          All.push($d);
          $d = [];
        }
      }

      for(let i = 0 ; i < All.length ; i ++){
        BuildList.push(get_color(All[i][0], All[i][1], All[i][2], All[i][3]));
      }

      this.draw(BuildList, pixels.shape[0], pixels.shape[1], parseInt(x), parseInt(y), parseInt(z));
    });
  }

  draw(map, w, h, x, y, z){
    this.sendText(now() + 'PaintingGenerator: Start drawing','§e');
    this.sendText(now() + 'PaintingGenerator: Time need: ' + (map.length / 100) + 's.','§e');
    let max = w + x;
    let min = x;
    let t = 0;
    let that = this
    let $i = setInterval( () => {
      if(x == max){
        z = z + 1;
        x = min;
      }

      that.session.sendCommand([
        'setblock',
        x = x + 1,
        y,
        z,
        map[t][0],
        map[t][1]
      ].join(' '));

      t++;
      if(t == map.length){
	      this.sendText(now() + 'PaintingGenerator: Done.','§e');
        clearInterval($i);
      }
    }, 10);
  }

  setTile(root, list, block, data, mod, delays){
    let t = 0;
    let that = this;
    let interval = setInterval(() => {
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
    let t = 0;
    let dx = direction == 'x' ? len : 0;
    let dy = direction == 'y' ? len : 0;
    let dz = direction == 'z' ? len : 0;
    let that = this;
    let interval = setInterval(function() {
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
    let that = this;
    let t = 0;
    let interval = setInterval(function () {
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
    let t = 0;
    let that = this;
    let interval = setInterval(() => {
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
    let interval = setInterval(() => {
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

function $header(r,opts){
  if(r){
    $default.position = opts.position;
    $default.block = opts.block;
    $default.data = opts.data;
    $default.method = opts.method;
    $default.su = opts.su;
  }
  console.log($default);
  return $default;
}

function onPlayerMessage(body){
  let properties = body.properties;
  if (properties.MessageType != 'chat') return;
  this.onChatMessage(properties.Message, properties.Sender, properties);
}

function toArray(str){
  return arr = str.split(',');
}

function now(){
  let date = new Date();
  return ['[',date.toTimeString().slice(0, 8),']'].join('');
}

function getMin(arr){
  let min = arr[0]
  for(var i = 1; i < arr.length; i++) {
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
