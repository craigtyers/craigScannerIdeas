module.exports = {
    id: ["1.1.1::F38"],
    guidelines:['1.1.1'],
    type: "error",
    tagName: null,
    message: "Failure of Success Criterion 1.1.1 due to not marking up decorative images in HTML in a way that allows assistive technology to ignore them",
    level: "A",
    selector: true,
    evaluate: function evaluate(node, options, virtualNode, context) {

        const failedElements = Array.from(document.querySelectorAll('img, svg')).filter(element => {
            // Assuming images with a title attribute are not decorative and making an exception for the presentation role.
            return !element.getAttribute('alt') && !element.getAttribute('title') && element.getAttribute('role') !== 'presentation';
        });

        return failedElements.length ? failedElements : false;
    },
    fid: "F38",
}
