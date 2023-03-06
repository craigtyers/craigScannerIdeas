import AbstractTest from '../src/AbstractTest'

class TestF41 extends AbstractTest
{
    public constructor()
    {
        super()
        this.id = [
            '1.1.1::F41',
        ]
        this.guidelines = [
            '1.1.1'
        ]
        this.type = "error"
        this.tagName = "META"
        this.message = "meta redirect with a time limit"
        this.level = "A"
        this.selector = true
        this.fid = "F40"
    }
    
    public override evaluate(node: HTMLElement, options: Record<string, any>): any | boolean
    {
        return document.querySelector(
            'meta[http-equiv="refresh"][content*="url"]'
        )
            ? document.querySelectorAll(
                  'meta[http-equiv="refresh"][content*="url"]'
              )
            : false;
    }
}

export default new TestF41()