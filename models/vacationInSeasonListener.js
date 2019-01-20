const mongoose = require('mongoose');

var vacationInSeasonListenerSchema = mongoose.Schema({
    email:String,
    skus:[String],
});
var VacationInSeasonListener = mongoose.model('Vacationinseasonlistener',vacationInSeasonListenerSchema);

module.exports = VacationInSeasonListener;
