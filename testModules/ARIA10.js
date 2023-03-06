module.exports = {
    id: ["1.1.1::ARIA10"],
    guidelines:['1.1.1'],
    type: "error",
    tagName: null,
    message: "Using aria-labelledby to provide a text alternative for non-text content",
    level: "A",
    selector: true,
    evaluate: function evaluate(node, options, virtualNode, context) {
        var failEls = [];
        const labelledBy = document.querySelectorAll("[aria-labelledby]");
                        
        labelledBy.forEach( function(el) {
            //first if the el supports alt then its a fail!
            var testNode = document.createElement( el.tagName );
            if( "alt" in testNode ){
                failEls.push( el );
            }    
            else{
                //next test to make sure it exists...
                var label = document.getElementById( el.getAttribute('aria-labelledby') );
                if( !label ){
                    failEls.push( el );
                }
            }
        });
        return failEls;                

    },
    fid: "ARIA10",
}
