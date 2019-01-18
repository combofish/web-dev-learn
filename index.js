#!/bin/env node
'esversion: 6'
'use strict'

const http = require('http'),
      vhost = require('vhost'),
      express = require('express'),
      connect = require('connect'),
      fortune = require('./lib/fortune.js'),
      credentials = require('./credentials.js'),
      stuff = require('./lib/stuff.js')({options:'my choice'});
//    getIp = require("./lib/get-ip.js"); 

const app = express();

var handlebars = require('express3-handlebars')
    .create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine',"handlebars");
app.set('port',process.env.PORT || 3000);

////app.use(connect.basicAuth)();
//app.use(require('response-time')());

//app.use(require('morgan')());

//app.use(require('method-override')());
app.use(require('errorhandler')());
//app.use(require('express-session')());
//app.use(require('csurf')());
//app.use(require('static-favicon')('./public/favicon.ico'));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('body-parser')());
//app.use(require('express-session')());
app.use(express.static(__dirname + '/public'));
//app.use(connect.compress);//gzip
//console.log(express.static());

app.use(function(req,res,next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

app.use(function(req,res,next){
    var cluster  =require('cluster');
    if(cluster.isWork) console.log('Worker %d reveived request. ',cluster.worker.id);
    next();
});

app.use(function(req, res, next){
    console.log('processing request for "' + req.url+'"...');
    next();
});

app.use(stuff.m1);
app.use(stuff.m2);

// app.use(function(req,res,next){
//     console.log('Ip :' + getIp.getClientIP(req) + '\n');
//     next();
// })

switch(app.get('env')){
case 'development':
    app.use(require('morgan')('dev'));
    break;
case 'production':
    app.use(require('express-logger')({
	path:__dirname + '/log/requests.log'
    }));
    break;
}

var tours = [ { id:0, name: 'hello',price: 99.99},
	      { id:1, name: "combo", price : 100.09}
	    ];

app.get('/',function(req,res){
    //res.type('text/plain');
    //res.send('Home Page!');
    res.render('home');
    res.cookie('monster', 'non');
});
app.get('/api/tours', function(req,res){
    res.json(tours);
});
app.get('/about',function(req,res){
    // res.type('text/plain');
    // res.send('About ');
    // var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about',{fortune: fortune.getFortune,
			pageTestScript:'/qa/tests-about.js'});
});
app.get('/headers', function(req,res){
    res.set('Content-type','text/plain');
    var s='';
    for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});
app.get('/tours/hood-river', function(req,res){
    res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function(req,res){
    res.render('tours/request-group-rate');
});



var Vacation = require('./models/vacation.js');

var mongoose = require('mongoose'),
    opts = {
	server:{
	    socketOptions:{keepAlive:1}
	}
    };

//const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test');
const con = mongoose.connection;
con.on('error', console.error.bind(console, '连接数据库失败'));

console.log('connect success');

app.get('/vacations',function(req,res){
    Vacation.find({avaliable:true},function(err,vacations){
	var context = {
	    vacations:vacations.map(function(vacation){
		return {
		    name:vacation.name,
		    description:vacation.description,
		    inSeason:vacation.inSeason,
		    sku:vacation.sku,
		    price:vacation.getDisplayPrice(),
		}})
	};
	res.render('vacations',context);
    });
});

var VacationInSeasonListener = require('./models/vacationInSeasonListener.js');

app.get('/notify-me-when-in-season',function(req,res){
    res.render('notify-me-when-in-season',{ sku:req.query.sku });
});
app.post('/notify-me-when-in-season',function(req,res){
    VacationInSeasonListener.update(
	{ email: req.body.email },
	{ $push: { skus: req.body.sku } },
	{ upsert: true },
	function(err){
	    if(err){
		console.error(err.stack);
		req.body.flash = {
		    type: 'danger',
		    intro: 'Ooops!',
		    message:'There was an error processing your request.',
		};
		return res.redirect(303,'vacations');
	    };
	    req.body.flash = {
		type: 'success',
		intro: 'Thank you!',
		message: 'You will be notified when this vacation is in season.',
	    };
	    return res.redirect(303,'/vacations');
	}
    );
});

app.use(function(req,res){
    // res.type('text/plain');
    res.status(404);
    // res.send('404-not found');
    res.render('404');
});

app.use(function(err,req,res,next){
    console.log(err.stack);
    // res.type('text/plain');	
    res.status(500);
    // res.send('500-Server.errors');
    res.render('500');
});

// app.listen(app.get('port'),function(){
//     console.log("Express started in " + app.get('env') + ". \nexpress is on http://localhost" + app.get('port'));
// });

// http.createServer(app).listen(app.get('port'),function(){
//     console.log("Express started in " + app.get('env') + ". \nexpress is on http://localhost" + app.get('port'));
// });

function startServer(){
    http.createServer(app).listen(app.get('port'),function(){
	console.log("Express started in " + app.get('env') + ". \nexpress is on http://localhost:" + app.get('port'));
    });
}

if(require.main === module){
    startServer();
}else {
    module.exports = startServer;
}
