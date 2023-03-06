abstract class AbstractTest
{ 
    public id: string[] = []
    public guidelines: string[] = [
        '1.1.1'
    ]
    public type: string = "error"
    public tagName: string = "META"
    public message: string = "meta redirect with a time limit"
    public level: string = "A"
    public selector: boolean = true
    public fid: string = "F40"

    public constructor()
    {
        // Override and set properties.
    }
    
    public abstract evaluate(node: HTMLElement, options: Record<string, any>): any | boolean
}

export default AbstractTest