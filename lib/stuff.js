'use strict'

module.exports = function(config){
    if(!config) config = {};

    return {
	m1:function(req,res,next){
	    next();
	},
	m2:function(req,res,next){
	    next();
	}
    };
};
