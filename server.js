#!/bin/env node

var cluster = require('cluster');

function startWork(){
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started', worker.id);
}

if(cluster.isMaster){
    require('os').cpus().forEach(function(){
	startWork();
    });

    cluster.on('disconnect', function(worker){
	console.log('CLUSTER: Worker %d is disconnect from the cluster.', worker.id);
    });

    cluster.on('exit', function(worker, code, singal){
	console.log('CLUSTER: Worker %d died with exit code %d (%s).', worker.id, code, singal);
	startWork();
    });
    
}else {
    require('./index.js')();
}
