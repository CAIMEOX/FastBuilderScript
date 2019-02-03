const arg=require("./arg");

let cmdList = ['round','circle','ellipse','ellipsoid','cone','torus','sphere','su','help','let',"stopall"];

class CommandLine{
constructor(){}

toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

hasFlags(argv, input, alias){
	if(!!~argv.indexOf(input)){
		return argv[argv.indexOf(input) + 1];
	}else if(!!~argv.indexOf(alias)){
		return argv[argv.indexOf(alias) + 1];
	}else {
		return false;
	}
}

isCmd(args) {
	if(args == undefined)return false;
	
	for(let key in cmdList){
		if(!!~args.indexOf(cmdList[key])){
			return true;
		}
	}
	return false;
}

getType(args){
	for (let i in args){
		if(this.isCmd(args[i])){
			return args[i]
		}
	}
}


read(msg, opts,mts,argz){
	for(let i of mts){
		cmdList.push(i[0]);
	}

	let args = msg.trim().split(" ") || [];
	opts = opts || {};

	let out = {};

	out.main = {
		isCmd:this.isCmd(args),
		toRoot:!!~args.indexOf('sudo') && !!~args.indexOf('su'),
		exitRoot:!!~args.indexOf('sudo') && !!~args.indexOf('exit'),
		isSudo:!!~args.indexOf('sudo') || opts.su,
	};

	let $flags={
		"--x":Number,
		"--y":Number,
		"--z":Number,
		"-p":[Number],
		"-b":String,
		"--block":"-b",
		"-d":Number,
		"--data":"-d",
		"-m":String,
		"--method":"-m",
		"-2":String,
		"-3":Number,
		"-e":String,
		"--block2":"-2",
		"--data2":"-3",
		"--entity":"-e",
		"--list":Boolean,
		"--help":Boolean,
		"-h":"--help",
		"-l":"--list",
		"-f":String,
		"-s":String,
		"--shape":"-s",
		"--facing":"-f",
		"-r":Number,
		"--radius":"-r",
		"-a":Number,
		"--accuracy":"-a",
		"-t":Number,
		"--times":"-t",
		"-w":Number,
		"--width":"-w",
		"--length":Number,
		"--height":Number,
		"-y":Boolean,
		"--entityMod":"-y"
	};

	for(let i of argz){
		$flags[i[1]]=i[3];
		$flags[i[2]]=i[1];
	}

	try{let garg=arg($flags,{argv:args.slice(1)});}catch(err){out.error=err;return out;}

	let $position=[
		garg["--x"]||opts.position[0],
		garg["--y"]||opts.position[1],
		garg["--z"]||opts.position[2]
	];

	out.header={
		position:(garg["-p"]==undefined||garg["-p"][2]==undefined)?$position : [garg["-p"][0],garg["-p"][1],garg["-p"][2]],
		block:garg["-b"]||opts.block,
		data:garg["-d"]||opts.data,
		method:garg["-m"]||opts.method,
		$block:garg["-b2"]||opts.$block,
		$data:garg["-d2"]||opts.$data,
		entity:garg["-e"]||opts.entity
	};

	out.collect = {
		get:!!~args.indexOf('get') ? args[args.indexOf('get') + 1] : false,
		locate:!!~args.indexOf('locate') ? args[args.indexOf('locate') + 1] : false,
		writeData:!!~args.indexOf('let') || !!~args.indexOf('var')
	}

	out.server = {
		close:!!~args.indexOf('closewebsocket'),
		screenfetch:!!~args.indexOf('screenfetch'),
		stopall:!!~args.indexOf("stopall"),
		helpMessage:(!!~args.indexOf('help') && args.length == 1),
		listHelp:(!!~args.indexOf('help') && garg["--list"]),
		showhelp:args[0] == 'help' ? args[1] :
		garg["--help"] ?
		args[0] : false
	}

	out.build = {
		type:this.getType(args),
		direction:garg["-f"] || 'y',
		shape:garg["-s"] || 'hollow',
		radius:garg["-r"] || 0,
		accuracy:garg["-a"] || 50,
		delays:garg["-t"] || 10,
		width:garg["-w"] || 0,
		length:garg["--length"] || 0,
		height:garg["--height"] || 1,
		entityMod:garg["-y"] || false
	};

	for(let i of argz){
		out.build[i[0]]=garg[i[1]]||i[4];
	}
	

	return out;
}

}

module.exports = CommandLine;
