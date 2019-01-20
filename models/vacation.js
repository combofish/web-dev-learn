var mongoose = require('mongoose');

var vacationSchema = mongoose.Schema({
    name :String,
    description:String,
    priceInCents:Number,
    tags:[String],
    inSeason:Boolean,
    sku:String,
    notes:String,
    avaliable:Boolean,
});

vacationSchema.methods.getDisplayPrice = function(){
    return '$' + (this.priceInCents / 100).toFixed(2);
};

var Vacation = mongoose.model('Vacation',vacationSchema);
module.exports = Vacation;
