//the resulty reporter will find the call back url from the options and recieve an array of issues..
// it will formaty the issues for submission to the callback url, then make the callback.
// placing thios into its own module means we could potentially completeley replace the test runner or format (internnaly) of issues and only need change one place.
// additionally it means that if the externally expected issue format changes we only need to update this module.

import logger from '@/Logger'

class ResultReporter
{
    public async reportIssues(test: any, nodes:any, options: any): Promise<any>
    {
        //we may want to itterate the issues reporting each one individually...
        //may also wish to call exteranl functions for converting the issues into correct formats... 
        this.sendIssues( test , nodes , options );
    }

    protected async sendIssues(test: any, nodes:any, options: any): Promise<any>
    {
        //for now lets just LOG it...but eventually it will make the call to a remote system...
        logger.log("ISSUES SHOULD BE SENT TO CALLBACK URL! test" + test.fid + "( " + test.type + ") node count " + nodes.length  , options );  
    }
}

const SINGLETON = new ResultReporter()
export default SINGLETON