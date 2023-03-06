module.exports ={
    fid:"testDivNodes",
    selector: false,
    level: 'A',
    tagName: 'div',
    guidelines: ['FAKES'],
    evaluate: function(node, options, virtualNode, context) {
        //this example is of a selctor false and  tagname set to DIV
        //it should only run on div elements...
        //this means it should be ran on every div node in the doc, and return true or false each time..
        return ( node.className.includes("module-content") );
    }
}