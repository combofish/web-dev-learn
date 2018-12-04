var Browser = require('zombie'),
    assert = require('assert').assert;

var brower;
suite("Cross-page Tests", function(){
    setup(function(){
	brower = new Browser();
    });

    test('request a group rate quote from the hood river tour page should populate the referrer field.' , function(done){
	var referrer = 'http://localhost:3000/tours/hood-river';
	brower.visit(referrer, function(){
	    brower.clicklink('.requestGroupRate',function(){
		assert(brower.field('referrer').value === referrer);
		done();
	    });
	});
    });

    test('request a group rate from the oregon coast tour page should populate the referrer field', function(done){
	var referrer = 'http://localhost:3000/tours/oregon-coast';
	brower.visit(referrer,function(){
	    brower.clicklink('.requestGroupRate', function(){
		assert(brower.field('referrer').value === referrer);
		done();
	    });
	});
    });

    
    test('request a group rate from the oregon coast tour page should populate the referrer field', function(done){
	var referrer = 'http://localhost:3000/tours/request-group-rate';
	brower.visit(referrer,function(){
	    assert(brower.field('referrer').value === '');
	    done();
	});
    });

});
