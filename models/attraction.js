'use strict'

var mongoose = require('mongoose');

var attractionSchema = mongoose.Schema({
    name:String,
    description:String,
    location:{ lat: Number, lng: Number },
    history:{
	even: String,
	notes:String,
	email:String,
	date:Date,
    },
    updateId:String,
    approved:Boolean,
});

var Attraction = mongoose.model('Attraction',attractionSchema);
module.exports = Attraction;
