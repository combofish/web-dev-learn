'use strict'


var tours = [ { id:0, name: 'hello',price: 99.99},
	      { id:1, name: "combo", price : 100.09},
	    ];


module.exports = function(app){

    app.get('/',function(req,res){
	//res.type('text/plain');
	//res.send('Home Page!');
	res.render('home');
	res.cookie('monster', 'non');
    });
    app.get('/api/tours', function(req,res){
	res.json(tours);
    });

};
