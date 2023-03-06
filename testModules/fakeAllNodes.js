module.exports ={
    fid:"testAllNodes",
    selector: false,
    level: 'A',
    guidelines: ['FAKES'],
    evaluate: function(node, options, virtualNode, context) {
        //this example is of a selctor false and null tagname 
        //this means it should be ran on every node in the doc, and return true or false each time..
        return ( node.tagName =="DIV" && node.className.includes("module-content") );

    }
}