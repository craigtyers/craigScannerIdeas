//logger for the modules which use options... 
//builds a log file, 
//potentilally can have additianal function eg log to elsewhere 
// log errors
// email(via a difernt module!)  a full log when an error occurs etc.
import optionsObject from "./Options"
import dir from "./Directory"

import { LOGGER } from 'arch-node-core'

class Logger
{
    public async log(action: any, options: any = {}): Promise<any>
    {
        LOGGER.info(action, options , "log.txt");
    }

    public async error(action: any, options: any = {}, error: any): Promise<any>
    {
        LOGGER.error(action +" ["+ error +"] ", options , "errorlog.txt");
    }

    // protected async logger(action: any, options: any = {}, filename: string): Promise<any>
    // {
    //     options = await optionsObject.build(options);
    //         if( options.paths && options.paths.logs && options.startTime ){
    //             let ts = ( ( Date.now() - options.startTime ) /1000 ).toFixed(2) ;
    //             let content = ts + " " + action +" \n";
    //             await dir.fileWrite(options.paths.logs + "/" + filename, content);
    //         }
    // }
}

const SINGLETON = new Logger()
export default SINGLETON