// this module will need tio understand ( from sime config somewhere) what other external tests are available, 
// and also how to call and retrieve the results from those tests..
// it can then be called as part of running a complete test and will await / async report its results..

import logger from "./Logger"

class ExternalTestRunner
{
    public async runTests(options: any = {})
    {
        //use config and options to run any extenal tests we may want to 
        //e.g. if we had a seperate system that ran AXE - we could call that from here...
        //and then once it returned its results we would process those to a format we understands and reporte them..
        logger.log( " Run any external tests ", options);

        //go on then !
        logger.log( "External tests complete" , options);
    }
}

const SINGLETON = new ExternalTestRunner()
export default SINGLETON