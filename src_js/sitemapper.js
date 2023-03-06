// Sitemapper loads a url, finds all the links on the page, records and follows them
// the following can happen recursivley to the specified depth, 
// generating a list of all the pages that arte linked from the source page with in (depth) clicks
// currenlty sequential -- can be made to be asyncronaous


const puppeteer = require('puppeteer');
const logger = require('./logger');


var options;

module.exports = {
    setOptions : function(opt){
        options = opt;
    },
    map : async function( url , depth = 0 ){
        //perhaps BEFORE we start crawling links, we should just check for a /sitemap.xml file and potentially just use that instead ! ;) 

        //TODO add in a pre run check for sitemap.xml 


        if( depth == undefined ) { depth = 0; }
        //get all the links on the page. 
        //start adding internal ones them to a sitemap 
        //if depth > 1 then get  (recursovley) the pages in the 1st depth and do the same again... 
        return mapperMapSite( url, depth );
    },
    getLinks : async function( href ){
        return mapperGetLinks( href );
    }
}

async function mapperGetLinks( href , internalOnly ){

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
    url = new URL(href);
    base = url.host;

    await logger.log( "Prep Browser for getLinks ", options);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await logger.log( "Navigate to Page for getLinks ", options);
    await page.goto( href );
    await logger.log( "Page Ready ", options);

    const pageUrls = await page.evaluate(() => {
        const urlArray = Array.from(document.links).map((link) => link.href);
        const uniqueUrlArray = [...new Set(urlArray)];
        return uniqueUrlArray;
      });
    await logger.log( "Dispose of getLinks browser ", options);
    await page.close();
    await browser.close();
    links = [];
    await logger.log( "Check Links ", options);

    


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
    await logger.log( "Got Page Links from "+href, options);
    return links;
}

async function mapperMapSite( url , toDepth, currentDepth , currentMap ){



    
    if( toDepth == undefined ){ toDepth = 0; }
    if( currentDepth == undefined ){ currentDepth = 0; }
    if( currentMap == undefined ){ currentMap = { 'pages' : [] , 'visited' : [] }; }

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
                currentMap[thisLev] = currentMap[thisLev].concat( await mapperGetLinks( url.href ) ); 
                currentMap.visited.push(url.href);
            }
        }
        else{
            for(var i =0; i<currentMap[lastLev].length ; i++){
                var href = currentMap[lastLev][i];
                //if i have already mapped - dont map again! 
                if( !currentMap.visited.includes(href) ){
                    currentMap[thisLev] = currentMap[thisLev].concat( await mapperGetLinks( href ) );
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
    nextDepth = currentDepth+1;
    return (
        toDepth>nextDepth
        ?mapperMapSite( url , toDepth , nextDepth , currentMap) 
        :currentMap
        );
}