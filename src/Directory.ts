//build all the folders for a runner
//utility function to write content to a file
import fs from 'fs'
import pathHelper from 'path'
import { Console } from 'console';

import CONFIG from '@/Config';

import optionsObject from '@/Options'

class Directory
{
    public build(options: any = {}): any
    {
        if( options.url && options.startTime ){

            let baseDir = CONFIG.outputDir + "/" + options.url.hostname;
            let pageDir = baseDir + "/rootPage";
            
            if( options.url.pathname!="" && options.url.pathname!="/"){
                pageDir = baseDir+"/"+options.url.pathname;
            }

            let instanceDir = pageDir + "/" + options.startTime;
            
            if (!fs.existsSync(CONFIG.outputDir)){
                fs.mkdirSync(CONFIG.outputDir);
            }
            if (!fs.existsSync(baseDir)){
                fs.mkdirSync(baseDir);
            }
            if (!fs.existsSync(pageDir)){
                fs.mkdirSync(pageDir);
            }
            if (!fs.existsSync(instanceDir)){
                fs.mkdirSync(instanceDir);
            }

            let imageDir = instanceDir + "/images";
            if (!fs.existsSync(imageDir)){
                fs.mkdirSync(imageDir);
            }
            let logsDir = instanceDir + "/logs";
            if (!fs.existsSync(logsDir)){
                fs.mkdirSync(logsDir);
            }

            return {
                'baseDir' : baseDir,
                'pageDir': pageDir,
                'dir' : instanceDir,
                'images' : imageDir,
                'logs' : logsDir
            };
        }
    }

    public async fileWrite(path: string, content: any , writeflag: string = "a+", supressLog: boolean = false): Promise<any>
    {
        if( !(supressLog ===true) ){
            console.log(" WRITE TO " + path +" ( flag "+writeflag+") -->"  , content );
        }
        try{
            await fs.writeFile(path, content, {
                flag: writeflag
            }, err => {})
        }
        catch (err) {
            console.log( err );
        }
    }

    public async readJsPathsInDir(path: string, allfiles: any[] = []): Promise<any>
    {
        const ext: string[] = [".js"];
        var files = fs.readdirSync(path);
        for (var i in files){
            var name = path + '/' + files[i];
            //console.log( "looking at : " , name );
            if (fs.statSync(name).isDirectory()){
                await this.readJsPathsInDir(name,  allfiles);
            } 
            else {
                let fileExt = pathHelper.extname( name );
               
               // console.log( " file type is ", fileExt );
                if( ext.includes(fileExt) ){
                    let fileName = pathHelper.basename( name ,'.js' );
                    try{
                        //when we want to require these we need the additional . at the start and the .js removing from the end 
                        //this may need some more thought to make sure its robust -- however assuming the folder structure remains in tact we should be fine.
                        //N.B the value of the file in testModules is NOT the same as in the tests git repo -- they are converted to modules and have a guidelines field added.. 
                        let x = require( '.' + path+'/'+ fileName );
                        allfiles.push( x );
                    }
                    catch( err ){
                        //not a thing we can open ...
                        console.log( " could not open ", path+'/'+ fileName );
                    }
                                        
                }
            }
        }
        return allfiles;
    }
}

const SINGLETON = new Directory()
export default SINGLETON