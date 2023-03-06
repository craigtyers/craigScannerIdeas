// Sitemapper loads a url, finds all the links on the page, records and follows them
// the following can happen recursivley to the specified depth, 
// generating a list of all the pages that arte linked from the source page with in (depth) clicks
// currenlty sequential -- can be made to be asyncronaous
import puppeteer from 'puppeteer'
import logger from '@/Logger'


class SiteMapper
{
    public options: Record<string, any> = {};

    public setOptions(options: Record<string, any>): void
    {
        this.options = options;
    }

    public async map(url: URL, depth: number = 0): Promise<any>
    {
        //perhaps BEFORE we start crawling links, we should just check for a /sitemap.xml file and potentially just use that instead ! ;) 

        //TODO add in a pre run check for sitemap.xml 

        //get all the links on the page. 
        //start adding internal ones them to a sitemap 
        //if depth > 1 then get  (recursovley) the pages in the 1st depth and do the same again... 
        return this.mapperMapSite(url, depth)
    }

    public async getLinks(href: string): Promise<any>
    {
        return this.mapperGetLinks(href)
    }

    protected async mapperGetLinks(href: string, internalOnly: boolean = false): Promise<any>
    {
    
        //optionaly - we could make this function accept an array of hrefs, and open one page for each then load them all in parallel
        // this would make each 'depth' quicker - but more resource intensive...
    
        //TODO : we may need to find an approch to identify subdomains as still internal - such that we use TLD as the match 
        // this may have to be configurable per request... 
    
        // also we need to ignore # and trailing /s so that we can get actual unique urls...
    
        if( internalOnly == undefined){
            internalOnly = true;
        }
        //open a browser to href, 
        //get all the links
        // if it is internal add it..
        //otherwise dont.. 
        const url: URL = new URL(href);
        const base: string = url.host;
    
        await logger.log( "Prep Browser for getLinks ", this.options);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await logger.log( "Navigate to Page for getLinks ", this.options);
        await page.goto( href );
        await logger.log( "Page Ready ", this.options);
    
        const pageUrls = await page.evaluate(() => {
            const urlArray = Array.from(document.links).map((link) => link.href);
            const uniqueUrlArray = [...new Set(urlArray)];
            return uniqueUrlArray;
          });
        await logger.log( "Dispose of getLinks browser ", this.options);
        await page.close();
        await browser.close();
        const links: string[] = [];
        await logger.log( "Check Links ", this.options);
    
        
    
    
        for( var i = 0; i< pageUrls.length; i++ ){
            var urlObj = new URL( pageUrls[i] );
            if( !internalOnly || (internalOnly && urlObj.host == base ) ){
                links.push(urlObj.href);
            }
            else{
                //currently if we are finding links that we are not interested in we are loggin them for debug..
                //console.log( " not adding ", urlObj.href );
            }
        }
        await logger.log( "Got Page Links from "+href, this.options);
        return links;
    }
    
    protected async mapperMapSite(url: URL, toDepth: number, currentDepth: number = -1, currentMap: Record<string, any> = {}): Promise<any>
    {
        if( toDepth == undefined ){ toDepth = 0 }
        if( currentDepth < 0){ currentDepth = 0;}
        if( currentMap == undefined ){ currentMap = { 'pages' : [] , 'visited' : [] } }
    
        //console.log( currentDepth , toDepth );
    
        let thisLev = currentDepth + "_deep";
        let lastLev = currentDepth-1 + "_deep";
    
        if( ("href" in url) ){
            if( !(thisLev in currentMap) ){
                currentMap[thisLev] = [];
            }
    
            //we are ok to map from here...
           if( !currentMap.pages.includes( url.href) ){
               currentMap.pages.push( url.href );
           }
    
            //if lastLev is a thing , then i need to loop them and get all of thier links... 
            //otherwise i need to user url and get all of its links.. 
    
            // We may wish to add / and # removal such that we dont end up with copies where /#this /#that etc...
            // We may also wish to cope better with sub domains (including www) 
            // finally we may wish to force http or https in.. 
            if( !( lastLev in currentMap) ){
                //use url.. 
                if( !currentMap.visited.includes(url.href) ){
                    currentMap[thisLev] = currentMap[thisLev].concat( await this.mapperGetLinks( url.href ) ); 
                    currentMap.visited.push(url.href);
                }
            }
            else{
                for(var i =0; i<currentMap[lastLev].length ; i++){
                    var href = currentMap[lastLev][i];
                    //if i have already mapped - dont map again! 
                    if( !currentMap.visited.includes(href) ){
                        currentMap[thisLev] = currentMap[thisLev].concat( await this.mapperGetLinks( href ) );
                        currentMap.visited.push(href);
                    }
                }
            }
            //now put all of those links into page..
            for( var j = 0; j< currentMap[thisLev].length; j++ ){
                if( !currentMap.pages.includes( currentMap[thisLev][j] ) ){
                    currentMap.pages.push( currentMap[thisLev][j] );
                }
            }
    
        }
        const nextDepth: number = currentDepth+1;
        return (toDepth > nextDepth ?this.mapperMapSite(url, toDepth, nextDepth, currentMap): currentMap);
    }
}

const SINGLETON = new SiteMapper()
export default SINGLETON