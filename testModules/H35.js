module.exports = {
    id: ["1.1.1::H35"],
    guidelines:['1.1.1'],
    type: "error",
    tagName: null,
    message: "Providing text alternatives on applet elements",
    level: "A",
    fids: ["H35"],
    selector: true,
    evaluate: function evaluate(node, options, virtualNode, context) {
        // return !(node.getAttribute('alt'));
        var returnElements = [];
        document.querySelectorAll('applet').forEach((ele)=>{
            if(!(ele.getAttribute('alt'))){ 
                returnElements.push(ele);
            }
        })
        return returnElements;
    },
    beta:true,
    alpha: true,
    
    fid: "H35",
}

/**
 * author: sven andrews
 * Test: checks for the alt tag on an applet
 * Test Suite Status: working
 */