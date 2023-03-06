module.exports = { 
    id: ["3.3.2::H44"],
    type: "error",
    guidelines:['1.1.1'],
    tagName: null,
    message: "Using label elements to associate text labels with form controls",
    level: "A",
    selector: true,
    evaluate: function evaluate(node, options, virtualNode, context) {
        let returnElelemts = [];
        document.querySelectorAll('INPUT, SELECT, TEXTAREA').forEach((ele) => {
            if (ele.nodeName == "INPUT" && ele.type == "hidden"){
                return;
            }
            // check if input type radio or checkbox => label after
            if ((ele.nodeName == "INPUT" && ['checkbox', 'radio'].indexOf(ele.getAttribute('type')) > -1)) {
                if (ele.nextElementSibling && (ele.nextElementSibling.nodeName != "LABEL"
                    || (ele.nextElementSibling.nodeName == "LABEL" && ele.getAttribute('id') != ele.nextElementSibling.getAttribute('for'))
                    || (ele.nextElementSibling.nodeName == "LABEL" && window.getComputedStyle(ele).display != "none" && window.getComputedStyle(ele.nextElementSibling).display == "none"))) {
                    returnElelemts.push(ele);
                }
            } else {
                // check if textarea or select or input type text, file or password => label before
                if (ele.previousElementSibling && (ele.previousElementSibling.nodeName != "LABEL"
                    || (ele.previousElementSibling.nodeName == "LABEL" && ele.getAttribute('id') != ele.previousElementSibling.getAttribute('for'))
                    || (ele.previousElementSibling.nodeName == "LABEL" && window.getComputedStyle(ele).display != "none" && window.getComputedStyle(ele.previousElementSibling).display == "none")) ){
                    returnElelemts.push(ele);
                }
            }

        });
        return returnElelemts;
    },
    fid: "H44",
}
