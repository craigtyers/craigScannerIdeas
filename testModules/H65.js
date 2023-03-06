module.exports = {
    id: ["1.1.1::H65"],
    guidelines:['1.1.1'],
    type: "error",
    tagName: "input",
    message: "Using the title attribute to identify form controls when the label element cannot be used",
    level: "A",
    fids: ["H65"],
    selector: true,
    evaluate: function evaluate(node, options, virtualNode, context) {
        let returnElelemts = [];
        document.querySelectorAll('input').forEach((ele)=>{
            // check for an id so we can trace a label
            if(ele.getAttribute('id') != null){
                if(!document.querySelector(`[for="${ele.getAttribute('id')}"]`) && ele.getAttribute('alt')==null){
                    returnElelemts.push(ele);
                }
            }else{
                // check parent tagname is label 
                if(ele.getAttribute('alt')==null && ele.parentElement.tagName!="label"){
                    returnElelemts.push(ele);
                }
            }
        })
        return returnElelemts;

    },
    fid: "H65",
}

/**
 * author: sven andrews
 * Test: finds the inputs and loops them, then finds any with ids and checks for labels and alt tags, if no id then it checkss it has alt or parent is lable
 * Test Suite Status: working
 */