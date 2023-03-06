module.exports = {
    id: ["1.1.1::ARIA6"],
    guidelines:['1.1.1'],
    type: "notice",
    tagName: null,
    message: "Ensuring that aria-label is used to provide labels for objects",
    level: "A",
    selector: true,
    evaluate: function evaluate(node, options, virtualNode, context) {

        const failedElements = Array.from(document.querySelectorAll('button, input[type=submit], [role], label')).filter(element => {
            return !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby');
        });

        return failedElements.length ? failedElements : false;
    },
    fid: "ARIA6",
}
