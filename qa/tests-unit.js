var fortune = require('../lib/fortune.js');
var expect = require('chai').expect;

suit('Fortune cookie tests', function(){
    test('getfortune() should return a fortune', function(){
	expect(typeof fortune.getfortune() === 'string');
    });
});
