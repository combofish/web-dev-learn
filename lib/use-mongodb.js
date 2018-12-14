#!/bin/env node

var mongoClient = require('mongodb').MongoClient,
    url = "mongodb://127.0.0.1:27017/test",
    myobj = [{name:"combo"},{name:"taobo"},{name:"aliyun"},{name:"wangyi"}];

mongoClient.connect(url,function(err,db){
    if (err) throw err;
    console.log("数据库已经连接!");
    var dbase = db.db("test").collection('site');
    dbase.insertOne({name:"taobao",url:"www.taobao.com"},function(err,res){
	if (err) throw err;
	console.log("insert success!");
    });
    dbase.insertMany(myobj,function(err,res){
	if (err) throw err;
	console.log("insert number: " + res.insertedCount);
    });
    db.close();
});

