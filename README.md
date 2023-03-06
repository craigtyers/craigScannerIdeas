Set up..
========

Pull  the git repo and away..

Pre-requisits 
-------------

node V7.6 or newer..

    node --version
    v16.15.0


then you want to init and require pupeteer 

    npm init
    npm i puppeteer


Running : 
---------
Currently just run the index.js file -- this is just a sandbox for now..

    node src/server.js
    

or to have it monitored so you dont have to restart after every update..

    nodemon   

Output
------

Expect a folder structure to be created under the Output Directory
(Out put should be a folder at project root level.)

    Output
        <DOMAIN>
            <PAGE>
                <DATESTAMP>
                    images
                        <width>_<height>.png
                    logs
                        log.txt
                    options.json

Making a request
----------------
generally you will beable to request a scan (with various options) via your browser at localhost:3000
(but this is definable when running your own instanse should you wish to change it)

Requests take a `POST` at `/api/v1/scan` with th efollowing body:
```json
{
    "scan_url": "https://example.com",
    "callback_url": "https://awesome-scan-logger-or-queue.com/api/v1/scan-result"
}
```
Scan Url is the base url to scan from, defaults to https://google.com.
Callback Url is url to report scan results to, scan results are reported periodically as issue and scan payloads.
Notes : Currently http:// or https:// are required for this to work -- this is an area we could look to wrap in some more sofisticated methods to prevent issues down the line.


During Development
------------------
If your only intention is to check which options a request would set, then add

    &optionsonly=1
to your request and the execution will stop right after setting up all the options .





Site mapping
------------

To have the tool build a sitemap by crawling links you can pass :

    &mapsite=<true/false||1/0>
    &mapdepth=<integer>(optional)
depth is how many layers down to follow links, default is 1 which means it will just map the pages linked on the first page, and then the links from those pages.
(a mapdepth=2 would cause a navigation to all sub-linked pages and so on...)
The output from a map site request could take a reasonable amount of time to complete (a few minutes depending on depth) and will generate an output file named sitemap which will feature the pages we visiterd and all the unique links found. (json format) 

ScreenShots
-----------
By default, screenshots are set to true, this means if you do not specify anything then the scan will prodice screenshots of the site for the various viewports defined. (These are currently hard coded, however longterem it would be better to move these to an option also.)

    &screenshots=<true/false||1/0>

Additianally if you would like the system to maintaina screen shot of all the pages it used ( see batching for details of how pages are used) 
you can set  

    &shotperpage=<somevalue>

By default this is set to true, setting to 1 or true will keep it true , setting it to anything else will turn it off and may save you time.
(for example if we know a particular site is not going to change its apperence in any way for each visit then we can be confident in just the global screen shot) 


Specify Tests
-------------
By default, any test that has been found in the tests folder and is importable as a test module will be ran. you can change this behaviour with two parameters.

    &tests=<[FIDs,],[Guideline Ids, ], [Level]>
    &excludetests=<[FIDs,],[Guideline Ids, ], [Level]>

Both these params will accept a comma seperated list of any combination of Fail id, Guildeline Id and Level.
So for example to scan for only Guildeline 1.1.1 fail H62 and to exclued AAA and guildeline 1.2.3 you could pass 

    &tests=1.1.1,H62&excludetests=AAA,1.2.3

(this is not likley to be a thing you WANT to do, but it demonstraites the potential things you can do!)


Batching (sync or sequential tests)
-----------------------------------

    &batchsize=<int>
    &perpage=<int>
    &refreshevery=<int>

Allow us to specify how many tests to run in parrallel in a test batch..

batchsize defines how many individual tests can be sent to a single browser instance
If we are able to support multiple browsers then a lower number could increase the speed by running more tests in parallel

perpage defines how many test to run sequentially on a single page withing a browser
Again a lower number may allow for more async tests to run in parallel in multiple browser pages

and refreshevery defines how many sequential tests to run on a single page before requiring a refrsh call to happen
-a higher number allows for faster through put, but a low number may offer better protection against our tests poluting the DOM


Specify Viewport
----------------

By default the viewport will revert to desktop, the height and width for which are defined in the config/config.js file.
However a request can inclue a value for screensize which can ve either a colon seperated pair of numbers [width]:[height] or the name of a viewport found in the config file ( desktop/mobile etc) 

    &screensize=600:800
    
    --or--

    &screensize=mobile





Discovery Of tests
------------------
I have addapted (only slightly) the current specification of tests, to wrap them in individual modules by adding module.exports={ ... }
This allows us to keep them in a single folder (testModules) and could quite easily be a git repo that is pipeline enabled.
An Example of a test in this new (only VERY SLIGHTLY different) format might be :

    module.exports ={
        fid:"testDivNodes",
        selector: false,
        level: 'A',
        tagName: 'div',
        guidelines: ['FAKES'],
        evaluate: function(node, options, virtualNode, context) {
            //this example is of a selctor false and  tagname set to DIV
            //it should only run on div elements...
            //this means it should be ran on every div node in the doc, and return true or false each time..
            return ( node.className.includes("module-content") );
        }
    }

I have wrapped in module.exports, and added the guidelines field. (to allow for running all tests for a single guideline more easily)


TODO
====

There is still a long list of potential improvemnents here!

* Wrap every single step in try catches and log the out put
* have folders garbage collected on completion -- (or at least cleaned / minified)
* Consider adding page level MD5 logging such that we dont keep re-scanning identical pages ? 
* Consider adding some local browser cache esque solution so that we can make a request of the external site only when we need to. 
* Continue to keep the actual scanner etherial - any cacheing solution should be external to the scanner.
* add actual reporting of results to an endpoint elsewhere -- possibly via a callback URL - ~~possibly as a stand alone module.(module 'resultReporter' added)~~
* Allow for more permanant logging (the logging module does a fine job writing a transcript of a test - but could be extended to write to other locations or diferent media (eg slack) - it could also be extended to include ERROR logging as opposed to just process logging. )
* The file 'browser.js' exists as, i had intended to extend puppeter and make it a thing of our own, possibly allowing for caching and resharing of a page at scan time etc :but have not looked into quite yet.
* ~~the scan currently just scans at native browser view port, adding viewports as scan options is a taskto be done, as is making the scanner scan at those view ports, and identifiying those in the results also.~~
* the export list of problamatic nodes for each test needs to be processed to gain position path etc - this can also be a module of its own (see resultsReporter.js) . and could potentially include individual fail image generation too ? 
* TEST we will clearly need to stability and accuracy test this .
* Combine with the current offering - IT is my intention that we pick the best bits out of the two and also add any new ideas we may have in order to get a clean, well structured, robust code base.
* Convert to TS 
* Containerize ? 
* Site mapper currenlty does not follow subdomains - treating them as external links, that can be fixed...
* Site mapper is currently sequential - could be parrallel...could be a promiseAll type arrangament ;) 
* Site mapper could first check for sitemap.xml and avoid all the trouble of crawling ;) 
* Mark tests as beta / in dev and also inclusion via URL ( excluded by default) (ticket id  ? ) 
* Add an 'exists' check - a simple look up test with 200 code for checking if a domain is valid.? ( maybe this lives in a diferent toolset? )
* chnage the field in test that is currently labeled type to a diferent name - suggest  'severity'  (or we could go all in on the check and fix apprach right now... done NEED To like )
* Add the ability to run axe / wave to this system ( potentially via an external call) 
* ~~For running individual tests we currently have a batching system, with each batch in a new browser, and each test in a new page. - we can make all of this configuable and settable in the call stack so that each 'run' can use its own system. (maybe each test sequentially on a single page : maybe with refresh between maybe each X tests per page etc etc - this way we can fine tune perfomance)~~
* We could add refreshAfter or refreshBefore as fields on our tests and have the test runner use these... ? 
* likewise we could add a requiresscreenshot or similar option to force creation of per issue images... 
