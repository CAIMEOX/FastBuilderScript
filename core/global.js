let subscribed=[];

class global{
	get subscribed(){
		return subscribed;
	}

	set subscribed(val){
		subscribed.push(val);
	}
}