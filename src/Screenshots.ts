//module to take and save screen shots for of a web page..
//maintains its own page and browoser so no need to await any other requests, or have other requests await this..
import optionsObject from '@/Options'
import logger from '@/Logger'
import puppeteer from 'puppeteer'

//we may need to agree on what view ports we want and these may bneed to move to options...
//(so that they are selec table per scan and available to all modules...)

class Screenshots
{
    public async takeShot (options: any)
    {
        options = await optionsObject.build(options);
        if( options.url && options.paths && options.paths.images ){
            //we are good to take images... 
            await logger.log( "Prep Browser for screenshots ", options);
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await logger.log( "Navigate to Page for screenshots ", options);
            await page.goto( options.url.href );
            await logger.log( "Page Ready ", options);

            let viewport = options.viewport;
            
            if( viewport.width && viewport.height ){
                await logger.log( "Take shot at "+JSON.stringify(viewport) , options);
                await page.setViewport(viewport);
                let filePath  = options.paths.images +'/'+viewport.width+'_'+viewport.height+'.png';
                await page.screenshot( {
                    path: filePath,
                    fullPage : true
                });
                await logger.log( "Completed shot for "+JSON.stringify(viewport) , options);
            }
        
            await logger.log( "Dispose of screenshot browser ", options);
            await page.close();
            await browser.close();
        }
    }
}

const SINGLETON = new Screenshots()
export default SINGLETON