//logger for the modules which use options... 
//builds a log file, 
//potentilally can have additianal function eg log to elsewhere 
// log errors
// email(via a difernt module!)  a full log when an error occurs etc..
const optionsObject = require('./options');
const dir = require("./directory");

module.exports = {

    log:async function( action , options ){
        logger(action, options , "log.txt");
    },

    error: async function( action , options , error ) {
        logger(action +" ["+ error +"] ", options , "errorlog.txt");
    }
}

async function logger( action, options , filename ){
    options = await optionsObject.build(options);
        if( options.paths && options.paths.logs && options.startTime ){
            let ts = ( ( Date.now() - options.startTime ) /1000 ).toFixed(2) ;
            let content = ts + " " + action +" \n";
            await dir.fileWrite( options.paths.logs+"/"+filename , content );
        }
}