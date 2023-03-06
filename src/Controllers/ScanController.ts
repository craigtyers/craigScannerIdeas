import { Request, Response } from 'express'

import optionObject from '@/Options'
import screenShot from '@/Screenshots'
import logger from '@/Logger'
import directory from '@/Directory'
import siteMapper from "@/SiteMapper"
import tester from "@/TestRunner"
import externalTestRunner from '@/ExternalTestRunner'

//this is the master controller -- this is where we decide what needs to happen in order to meet the request requirements..
// currently these individual funcations are awaited in order.. but they could be all converted to promisses and then have promiseAll catch complition.
class ScanController
{
    public create(request: Request, response: Response): void
    {
        const scanUrl: string = request.body.scan_url;
        const callbackUrl: string = request.body.callback_url;

        try{
            const baseUrl: URL = new URL(String(scanUrl)) 
        }
        catch(err){
            response.status(412)
            response.json({
                error: scanUrl + " does not look like a valid url."
            })
            return
        }

        this.testScan({
            scanUrl,
            callbackUrl,
        }).then(results => {
            response.status(201)
            response.json(results)
        })
    }

    public async testScan(options: Record<string, any>): Promise<Record<string, any>>
    {
        return this.runPuppet(options)
    }

    protected async runPuppet(options: Record<string, any>): Promise<Record<string, any>>
    {
        //finaslise options
        options = await optionObject.build(options)
        //start scan steps
        await logger.log("Ready to Run", options)
        
        //if all you need to do is process the request and see the options it produces pass &optionsonly=1 for an early exit :)  
        if(options.optionsonly === "true" || options.optionsonly ==="1"  || options.optionsonly === true || options.optionsonly === 1){
            console.log(" i dont need to run anything just now... ");
            return options;
        }


        //screenshots -- we could move these to async 
        if( options.screenshots === "true" || options.screenshots === 1 || options.screenshots === true){
            try{
                await logger.log( "Screen Shots Start", options);
                await screenShot.takeShot(options);
                await logger.log( "Screen Shots Finished", options);
            }
            catch( error ){
                await logger.error("Failed to take screenshot" , options , error);
            }
        }
        //sitemap - couldalso be async -- or maybe live somewhere else.
        //this just gets us a list of urls for a given site..
        if( options.mapdepth && ( options.mapsite === "true" || options.mapsite === 1 || options.mapsite === true) ){
            try{
                await logger.log( "Map Site Start", options);
                siteMapper.setOptions(options);
                const map: any = await siteMapper.map(options.url , options.mapdepth);
                directory.fileWrite( options.paths.dir+"/mapLinks.json" , JSON.stringify(map) ,"w+");
                await logger.log( "Map Site Finished", options);
            }
            catch( error ) {
                await logger.error("Failed to create site map", options , error);
            }
        }

        //scan tests//
        try{ 
            await logger.log( "run the tests (async so just queue them) ", options);
            let queued = await tester.prepTests(options);
            tester.runTests(options);
            await logger.log(  "Roughly* : " + queued + " test"+ (queued==1?"":"s")+ " queued (*Async so could still be quing ) ", options);
        }
        catch( error ) {
            await logger.error("Failed to run tests", options , error);
        }


        try{ 
            await logger.log( "run the external tests (async) ", options);
            //let queued = await tester.prepTests( options );
            externalTestRunner.runTests( options );
            await logger.log( "External tests running");
        }
        catch( error ) {
            await logger.error("Failed to run external tests" , options , error );
        }

        return options

        //could still tidy up afterwards though..

        //notes - it may be worth grabbing an MD5 of a page content, so we can tell if it changed (although would need to grab js / css etc too);
    }

    public scanPages(pages: string[]): any
    {
        //pages = ['https://google.com']; //, 'https://apple.com', 'https://microsoft.com'];
        pages.forEach(page => this.runPuppet({
            scanUrl: new URL(page),
        }))
    }
}

export default ScanController