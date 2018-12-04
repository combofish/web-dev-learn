suite('Global Test',function(){
    test('Page has a valid title', function(){
	assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
    });
});
