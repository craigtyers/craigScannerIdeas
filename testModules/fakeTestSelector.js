module.exports ={
    fid:"testSelector",
    selector: true,
    tagName:null,
    level : 'A',
    guidelines : ['FAKES'],
    evaluate: function(node, options, virtualNode, context) {
        //this example is of a selector true type  
        //it should handle its own element lookup and retuen a list of failing nodes. 
        //for my example - i am just going to get and dvi with a class of module-content
        //(theres at leas one on the apple site!)

        var elements = document.querySelectorAll("div.module-content");
        return elements;

    }
}