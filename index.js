#!/bin/env node
'esversion: 6'
'use strict'

const http = require('http'),
      vhost = require('vhost'),
      express = require('express'),
      connect = require('connect'),
      fortune = require('./lib/fortune.js'),
      credentials = require('./credentials.js'),
      fs = require('fs'),
      routes = require('./routes.js'),
      rest = require('connect-rest'),
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

// app.use(function(req, res, next){
//     console.log('processing request for "' + req.url+'"...');
//     next();
// });

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


var admin = express.Router();
app.use(vhost('admin.*',admin));

admin.get('/',function(req,res){
    //res.type('text/plain');
    //res.send('Home Page!');
    res.render('home');
    res.cookie('monster', 'non');
});
admin.get('/api/tours', function(req,res){
    res.json(tours);
});

routes(app);

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

var formidable = require('formidable');

app.get('/contest/vacation-photo',function(req,res){
    var now = new Date();
    res.render('contest/vacation-photo',{
	year: now.getFullYear(),
	month: now.getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
	if (err) return res.redirect(303,'/error');
	console.log('received fields');
	console.log(fields);
	console.log('received files');
	console.log(files);
	//	res.redirect(303,'/thank-you');
	res.json({success:"ok"});
    });
});

app.post('/process',function(req,res){
    if(req.xhr || req.accepts('json', 'html') === 'json'){
	res.send({success: true });
    } else {
	res.redirect(303,'/thank-you');
    }
});

app.get('/newsletter',function(req,res){
    res.render('newsletter',{csrf:'CSRF token goes here.'});
});

app.post('/pro',function(req,res){
    console.log(req.query.form,'/n',req.body._csrf,'/n',req.body.name);
    //    res.redirect(303,'/thank-you');
    res.json({success:"ok"});
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

var Attraction = require('./models/attraction.js');

// new Attraction({
//     location:{
// 	lat:45.526,
// 	lng:9232.34,
//     },
//     name:'The Xi Lake',
//     description:"In China, built in 1892,six six. love peace",
//     email:'129sjdl@139.com',
//     approved:true,
// }).save();

// app.get('/api/attractions',function(req,res){
//     Attraction.find({approved:true}, function(err,attractions){
// 	if(err) return res.send(500, 'Error occured: database error.');
// 	res.json(attractions.map(function(a){
// 	    return {
// 		name:a.name,
// 		id:a.id,
// 		description:a.description,
// 		location:a.location,
// 	    }
// 	}));
//     });
// });

app.get('/api/attraction',function(req,res){
    res.render('attraction')
});

// app.post('/api/attraction', function(req,res){
//     var a = new Attraction({
// 	name:req.body.name,
// 	description:req.body.description,
// 	location:{ lat: req.body.lat, lng: req.body.lng },
// 	history:{ event:'created',
// 		  email: req.body.email,
// 		  date: new Date(),
// 		},
// 	approved: false,
//     });
//     a.save(function(err,a){
// 	if(err) return res.send(500,'Error occured: database error.');
// 	res.json({ id: a.id});
//     })
// });

// app.get('/api/attraction/:id',function(req,res){

//     Attraction.findById(req.params.id,function(err,a){
// 	if(err) return res.send(500,'Error occured, database error.');
// 	res.json({
// 	    name:a.name,
// 	    id:a.id,
// 	    description:a.description,
// 	    location:a.location,
// 	});
//     });
// })

var apiOpts = {
    context : '/api',
};

//app.use(rest.create(apiOpts))

// rest.get('/attractions',function(req,context,cb){
//     Attraction.find({approved:true}, function(err,attractions){
// 	if(err) return cb({ error: 'Error occured: database error.' });
// 	cb(null,attractions.map(function(a){
// 	    return {
// 		name:a.name,
// 		id:a.id,
// 		description:a.description,
// 		location:a.location,
// 	    }
// 	}));
//     });
// });

 
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
