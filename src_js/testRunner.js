//testrunner.js should know about OUR tests and know how to run them  (any runner for externally provided tests will be seperate)
// additionally this is only our JS based tests - if we have pyton or c# or any other test provisioning then we will run those somewhere else..
// these may be several in parrallel (possibly configurable) 
// potentially in one Browser with many pages...
// additional configuration will include which tests to run, or which to omit.
// would be great if this was able to read directly from a tests (git) folder...
// 

const rawTestPath = "./testModules";
const dir = require('./directory');
const logger = require('./logger');
const puppeteer = require('puppeteer');
const reporter = require('./resultReporter');
let testsToRun = [];

module.exports = {

    prepTests:async function(options){
        testsToRun = await getRunableTests( options.tests , options.excludetests );
        return this.countTests();
    },

    runTests: async function( options , prepareTestsFirst ){
        //use teh options var to determine which tests to run/omit 
        //omit and run by EITHER fid OR guideline id .... ?
        if( prepareTestsFirst === true ){
            testsToRun = await getRunableTests( options.tests , options.excludetests );
        }

        //and also how many to attempt concurrently 
        // run them and compile the results.
        //N.B. the results could be fired off individually if needed...
        

        //we could also batch these up...  
        //testsync is an integer value for how many pages we can open at once in a single browser 
        // if each call to test clump opened one browser and x pages then ran each test on each page then closed all the pages then closed the browser...
        // we would be onto a winner  maybe ? 

        let chunkSize = options.batchsize;
        if( chunkSize<1 ){
            chunkSize = 1;
        }
        let counter = 1;
        let maxChuncks = Math.ceil( testsToRun.length / chunkSize );

       

        for (let i = 0; i < testsToRun.length; i += chunkSize) {
            const chunk = testsToRun.slice(i, i + chunkSize);
           //test in chunks...
            await testChunk( chunk , options , "Chunk : " + counter + " of "+maxChuncks  );
            counter++;
        }

       
    },

    countTests:function(){ return testsToRun.length; }

}


async function getRunableTests( include, exclude){
    
    let runable = [];
    //try to load the tests from the tests folder.. 
    let knownTests = await dir.readJsPathsInDir( rawTestPath )
    
    //test to see if it is required for this run..
    knownTests.forEach( test=>{
        if(
            (   //if its included by wither * (all tests) , or by FID, or by leve l( a,aa,aaa) or by guildeline ids
                include=="*"  
                || ( test.fid && include.includes( test.fid ) )
                || ( test.level && include.includes( test.level ) )
                || ( test.guidelines && findOne( include , test.guidelines ) )
            ) 
            &&
            !(
                //and if its NOT EXCLUDED in any similar way...
                ( test.fid && exclude.includes( test.fid ) )
                || ( test.level && exclude.includes( test.level ) )
                || ( test.guidelines && findOne( exclude , test.guidelines ) )
            )
        ){
            //add it..
            if( typeof( test.evaluate )=='function' && test.fid ){
                //console.log( "adding", test.fid  ); 
                runable.push( test ) ;
            }
        } 
    });
    return runable;
}

function findOne(haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
}

async function testChunk( tests , options , chunkCount  ){
    //open a browser and implenet a page then runa test for each of the tests...


    logger.log("Open tests Browser for "+chunkCount, options);
    const browser = await puppeteer.launch();
    logger.log("tests Browser ready for  "+chunkCount , options);
   
    
    logger.log("Testing "+chunkCount+" Start" , options);
    let chunkTests =[];
    let perPageTests = [];

    let perpage = options.perpage;
    if( perpage<1 ){
        perpage = 1;
    }
    let pagecounter =0 
    //iterate through the tests adding each group of tests to a per page batch and sending for async processing...
    let alltestsCount = 0;
    tests.forEach( async function(test) { 

        if( perPageTests.length <= pagecounter || perPageTests.length==0){
            perPageTests.push([]);
            
        }
        perPageTests[pagecounter].push(test);
        alltestsCount++
        //if the current run is full - or we run out of tests - we need to chunk it.. 
        if( perPageTests[pagecounter].length >= perpage || alltestsCount == tests.length ){
            logger.log("Adding "+perpage+"( "+ perPageTests[pagecounter].length +" ) ["+pagecounter+"] tests to be tested..", options);
            chunkTests.push( new Promise( (resolve, reject) =>{  resolve( loadAndTest( browser , options , perPageTests[pagecounter] ) ); }) );
            pagecounter++;
        }
    });

    await Promise.all( chunkTests ).then(
        (values)=>{
            //we may not need to do anything here if we have been reporting as we go... 
            //we just allow for the next chunk of tests to run...
            values.forEach( function(data){
                if(data.results && data.theTests){
                    console.log(" Results " );
                    console.log( data.results );
                    // console.log( " for ");
                    // console.log( data.theTests );                    
                }
            });   
        }
    );

    logger.log("Close tests Browser "+chunkCount , options);
    browser.close();
    logger.log("Closed tests Browser  "+chunkCount , options);

}

async function loadAndTest( browser , options , tests ){

    let fids = [];
    let fidsStr = "";
    for ( var i =0; i<tests.length; i++ ){
        fids.push( tests[i].fid );
        fidsStr+="#"+tests[i].fid;
    }
    

    logger.log("Getpage for " +fidsStr , options);
    let page =  await browser.newPage();
    await page.setViewport( options.viewport );
    logger.log("load url for " +fidsStr , options);
    await page.goto( options.url.href , { waitUntil: 'networkidle0' });
    logger.log("page loaded for " + fidsStr , options);
    //how often should i refresh ? 
    let refreshevery = options.refreshevery;
    if( refreshevery<1 ){
        refreshevery = 1;
    }
    let results = {};
    //run the tests sequentially ..
    for ( var i =0; i<tests.length; i++ ){
        results[tests[i].fid] = await runATest( page , tests[i] , options )


        if( i>0 && i%refreshevery == 0){
            logger.log("Refresh page for "+fidsStr+  "  ( "+i+" % "+refreshevery+" = "+(i%refreshevery),  options);
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            logger.log("Page refreshed for "+fidsStr+  "  ( "+i+" % "+refreshevery+" = "+(i%refreshevery),  options);
        }
    }
   // we COULD save a screenshot for this page before we dipose of it..
   let filePath  = options.paths.images +'/'+options.viewport.width+'_'+options.viewport.height+'__'+fidsStr+'.png';
   
   
   //this could be made optional too.. 
   logger.log("Screen shot page for " + fidsStr , options);
   await page.screenshot( {
        path: filePath,
        fullPage : true
    });
    logger.log("Screen shot complete for " + fidsStr , options);

    logger.log("Close page for " + fidsStr , options);
    await page.close();
    logger.log("Closed page for " + fidsStr , options);

    //if we have been recording as we go then this is not needed...

    
    return { theTests : tests , results : results };
}


async function runATest( page , test , options){
    //use the test options to deturmine WHAT to run..

    logger.log("Start Testing  " + test.fid , options);

    let results = [];
    let tested = false;
    if( test.selector && test.selector === true){
        console.log( "Self selector ");
        //this means we can just call the function - it will handle look up of elements iteslf yes ? 
        results = await page.evaluate( test.evaluate ) ;    
        if( results === false ){
            results = [];
        }   
        //so this one should return us a collection of elements which fail the technique.
        tested = true;
    }

    if( !tested ){
        //then we need to get all nodes || or all nodes with tag name...
        //exposing the function does not see, to work.
        // await page.exposeFunction("wcagtest", (node, options, virtualNode, context) => test.evaluate(node, options, virtualNode, context) );
        // //aliasing the function does not seem to work..        
        // let tester = function(somenode){ return window.wcagtest(somenode); }

        let nodeselect = test.tagName??"*:not(style):not(link):not(script)";
        let nodes = await page.$$(nodeselect);
        for(var n =0; n<nodes.length; n++){
           if(  await page.evaluate( test.evaluate, nodes[n] ) ){
               //we failed.... 
                results.push( nodes[n] );
           }
        }
       
        tested = true;
    }

    if( results.length>0){
        //here we can report our results!!! 
        reporter.reportIssues(  test,  results  , options ) ;   
    }

    logger.log("Completed Testing  " + test.fid , options);
    return results;
}