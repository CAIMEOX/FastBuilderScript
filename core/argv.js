let cmdList = ['round','circle','ellipse','ellipsoid','cone','torus','sphere','su','help','let',"stopall"];

class CommandLine{
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

	args = msg.trim().split(" ") || [];
	opts = opts || {};

	let out = {};

	out.main = {
		isCmd:this.isCmd(args),
		toRoot:!!~args.indexOf('sudo') && !!~args.indexOf('su'),
		exitRoot:!!~args.indexOf('sudo') && !!~args.indexOf('exit'),
		isSudo:!!~args.indexOf('sudo') || opts.su,
	};

	let $position = [
		parseInt(hasFlags(args, '$x', '--x')) || opts.position[0],
		parseInt(hasFlags(args, '$y', '--y')) || opts.position[1],
		parseInt(hasFlags(args, '$z', '--z')) || opts.position[2],
	];

	out.header = {
			position:!!~args.indexOf('-p') ? [
				parseInt(args[args.indexOf('-p') + 1]),
				parseInt(args[args.indexOf('-p') + 2]),
				parseInt(args[args.indexOf('-p') + 3])
			] : $position,
			block:this.hasFlags(args, '-b', '--block') || opts.block,
			data:this.hasFlags(args, '-d', '--data') || opts.data,
			method:this.hasFlags(args, '-m', '--method') || opts.method,
			$block:this.hasFlags(args, '-b2', '--block2') || opts.$block,
			$data:this.hasFlags(args, '-d2', '--data2') || opts.$data,
			entity:this.hasFlags(args, '-e', '--entity') || opts.entity
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
		listHelp:(!!~args.indexOf('help') && !!~args.indexOf('-l')) || (!!~args.indexOf('help') && !!~args.indexOf('--list')),
		showhelp:args[0] == 'help' ? args[1] :
		(args[1] == 'h') || (args[1] == 'help' || args[1] == '-h' || args[1] == '--help') ?
		args[0] : false
	}



	out.build = {
		type:this.getType(args),
		direction:this.hasFlags(args, '-f', '--facing') || 'y',
		shape:this.hasFlags(args, '-s', '--shape') || 'hollow',
		radius:parseInt(this.hasFlags(args, '-r', '--radius') || 0),
		accuracy:parseInt(this.hasFlags(args, '-a', '--accuracy') || 50),
		delays:parseInt(this.hasFlags(args, '-t', '--times') || 10),
		width:parseInt(this.hasFlags(args, '-w', '--width') || 0),
		length:parseInt(this.hasFlags(args, '-l', '--length') || 0),
		height:parseInt(this.hasFlags(args, '-h', '--height') || 1),
		entityMod:this.hasFlags(args, '-y', '--entityMod') || false
	};
	for(let i of argz){
		out.build[i[0]]=this.hasFlags(args, i[1], i[2]) || false;
	}

	return out;
}

}

module.exports = CommandLine;
