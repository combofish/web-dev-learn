
var fortunes = ["hello." ,
		"welcome you.",
		"Do you fear what you don't know.",
		"You will have a pleasent surprise.",
		"Whenever possible, keep it simple."
	       ];

exports.getFortune = function(){
    return fortunes[Math.floor(Math.random() * fortunes.length)];
};
