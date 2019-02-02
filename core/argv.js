let cmdList = ['round','circle','ellipse','ellipsoid','cone','torus','sphere','su','help','let'];


function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function hasFlags(argv, input, alias){
	if(!!~argv.indexOf(input)){
		return argv[argv.indexOf(input) + 1];
	}else if(!!~argv.indexOf(alias)){
		return argv[argv.indexOf(alias) + 1];
	}else {
		return false;
	}
}

function isCmd(args) {
	if(args == undefined)return false;
	
	for(let key in cmdList){
		if(!!~args.indexOf(cmdList[key])){
			return true;
		}
	}
	return false;
}

function getType(args){
	for (let i in args){
		if(isCmd(args[i])){
			return args[i]
		}
	}
}


function read(msg, opts,mts){
	for(let i of mts){
		cmdList.push(i[0]);
	}

	args = msg.trim().split(" ") || [];
	opts = opts || {};

	let out = {};

	out.main = {
		isCmd:isCmd(args),
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
			block:hasFlags(args, '-b', '--block') || opts.block,
			data:hasFlags(args, '-d', '--data') || opts.data,
			method:hasFlags(args, '-m', '--method') || opts.method,
			$block:hasFlags(args, '-b2', '--block2') || opts.$block,
			$data:hasFlags(args, '-d2', '--data2') || opts.$data,
			entity:hasFlags(args, '-e', '--entity') || opts.entity
	};

	out.collect = {
		get:!!~args.indexOf('get') ? args[args.indexOf('get') + 1] : false,
		locate:!!~args.indexOf('locate') ? args[args.indexOf('locate') + 1] : false,
		writeData:!!~args.indexOf('let') || !!~args.indexOf('var')
	}

	out.server = {
		close:!!~args.indexOf('closewebsocket'),
		screenfetch:!!~args.indexOf('screenfetch'),
		helpMessage:(!!~args.indexOf('help') && args.length == 1),
		listHelp:(!!~args.indexOf('help') && !!~args.indexOf('-l')) || (!!~args.indexOf('help') && !!~args.indexOf('--list')),
		showhelp:args[0] == 'help' ? args[1] :
		(args[1] == 'h') || (args[1] == 'help' || args[1] == '-h' || args[1] == '--help') ?
		args[0] : false
	}



	out.build = {
		type:getType(args),
		direction:hasFlags(args, '-f', '--facing') || 'y',
		shape:hasFlags(args, '-s', '--shape') || 'hollow',
		radius:parseInt(hasFlags(args, '-r', '--radius') || 0),
		accuracy:parseInt(hasFlags(args, '-a', '--accuracy') || 50),
		delays:parseInt(hasFlags(args, '-t', '--times') || 10),
		width:parseInt(hasFlags(args, '-w', '--width') || 0),
		length:parseInt(hasFlags(args, '-l', '--length') || 0),
		height:parseInt(hasFlags(args, '-h', '--height') || 1),
		entityMod:hasFlags(args, '-y', '--entityMod') || false,
		path:hasFlags(args, '-z', '--path') || false
	};
	for(let i of mts){
		out.build[i[2]]=hasFlags(args, i[3], i[4]) || false;
	}

	return out;
}

module.exports = read;
