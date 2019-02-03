

let session;
class ScriptApi{
	constructor(ss){
		session=ss;
	}

	subscribe(method,cb){
		session.$scrdo(0,method,cb);
	}

	registerArgs(name,longopt,shortopt){
		session.$scrdo(1,name,longopt,shortopt);
	}

	registerHelp(name,help){
		session.$scrdo(2,name,help);
	}

	now(){
		let date = new Date();
		return ['[',date.toTimeString().slice(0, 8),']'].join('');
	}

	sendText(text,opts){
		return session.sendText(text,opts);
	}

	sendCommand(cmd,cb){
		session.session.sendCommand(cmd,cb);
	}

	showhelp(help,opts){
		session.showhelp(help,opts);
	}

	get stopall(){
		return session.stopall;
	}

	set stopall(val){
		session.stopall=val;
	}
}

module.exports=ScriptApi;
