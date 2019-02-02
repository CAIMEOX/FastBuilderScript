const color = require('./colortables');
const get_pixels = require('get-pixels');
const Algorithms = require('../../core/algorithms');

var ss=null;

function getMin(arr){
  let min = arr[0];
  for(var i = 1; i < arr.length; i++) {
  let cur = arr[i];
  cur < min ? min = cur : null
}
return min;
}

function get_color(r, g, b) {
    List = [];
    for (let a = 0; a < color.length; a++) {
        r1 = r - color[a].color[0];
        g1 = g - color[a].color[1];
        b1 = b - color[a].color[2];
        List.push(Math.sqrt((r1 * r1) + (g1 * g1) + (b1 * b1)));
    }
    return [color[List.indexOf(getMin(List))].name,color[List.indexOf(getMin(List))].data];
}

function dopaint(args,player,msg){
    let {main, header, build, collect, server} = args;
    let {position, block, data, method, $block, $data, entity} = header;
    let delays = build.delays;

method = method == 'normal' ? 'replace':[method,$block,$data].join(' ');

    if(main.isCmd){
      ss.showhelp(args.server);

      let {map, foo} = Algorithms.Builder(header,build) || {};

        ss.sendText(now() + 'Loading pixels painting module..','§e');

      ss.sendText(now() + 'Please wait patiently!');

            Paint(build.path, position[0], position[1], position[2]);
}
}

function main(session){
	ss=session;
	ss.subscribe("paint",dopaint);
	ss.registerArgs("path","-z","--path");
	ss.registerHelp("paint","paint -z <path:String>");
	console.log("PaintingGenerator script loaded.");
}

function Paint(path, x, y, z){
	if(!path){
    ss.showhelp({
      showhelp:"paint",
      error:true
    });
    return;
  }
    ss.sendText(now() + 'PaintingGenerator: Loaded.','§e');
    let BuildList = [];
    get_pixels(path, (err, pixels) => {
      ss.sendText(now() + 'PaintingGenerator: Start loading image from the path.','§e');
      if(err){
        ss.sendText('PaintingGenerator: ' + err, '§e');
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

      draw(BuildList, pixels.shape[0], pixels.shape[1], parseInt(x), parseInt(y), parseInt(z));
    });
  }

function draw(map, w, h, x, y, z){
    ss.sendText(now() + 'PaintingGenerator: Start drawing','§e');
    ss.sendText(now() + 'PaintingGenerator: Time need: ' + (map.length / 100) + 's.','§e');
    let max = w + x;
    let min = x;
    let t = 0;
    let that = ss;
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
	      ss.sendText(now() + 'PaintingGenerator: Done.','§e');
        clearInterval($i);
      }
    }, 10);
  }

function now(){
  let date = new Date();
  return ['[',date.toTimeString().slice(0, 8),']'].join('');
}


module.exports=main;
