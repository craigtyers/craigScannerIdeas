module.exports = {
    id: ["1.1.1::F40"],
    guidelines:['1.1.1'],
    type: "error",
    tagName: "META",
    message: "meta redirect with a time limit",
    level: "A",
    selector: true,
    evaluate: function evaluate(node, options, virtualNode, context) {
        return document.querySelector(
            'meta[http-equiv="refresh"][content*="url"]'
        )
            ? document.querySelectorAll(
                  'meta[http-equiv="refresh"][content*="url"]'
              )
            : false;
    },
    fid: "F40",
}