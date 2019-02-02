let dj=require("fs").readdirSync(".");

var exp=[];
for(let i of dj){
	if(require("fs").statSync(i).isDirectory()){
		exp.push(require("./"+i+"/main"));
	}
}

module.exports=exp;
