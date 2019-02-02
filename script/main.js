let dj=require("fs").readdirSync("script");

var exp=[];
for(let i of dj){
	if(require("fs").statSync("script/"+i).isDirectory()){
		exp.push(require("./"+i+"/main"));
	}
}

module.exports=exp;
