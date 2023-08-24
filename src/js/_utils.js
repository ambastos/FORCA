function random(inicial,final) {
    
    if ($.isArray(inicial))
	return _random(inicial)

    var result
    for (var i=0; i <= 100; i++) {
       result = Math.random()*100
	 
       if (result >=inicial && result <= (final+0.99))		  
	  return parseInt(result)
    }

    return -1   	    
}

function _random(array) {
    var result = random(0,array.length-1)
    return array[result]
}