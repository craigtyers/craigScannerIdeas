// a simple function to take a set of options and expand them with defalt values where omitted.
// the  options file describes all the data that will be needed to run a scan of a site.
// and aditionally can help in understanding where issues may have occured in failed scans. 
// ( as we can clearly see the request which has been made) 
import CONFIG from "@/Config"
import dir from "./Directory"

class Options
{
    public url: URL
    public startTime: number = Date.now()
    public startDateTime: number = Date.now()
    public name: string
    public paths: Record<string, string> = {}
    public screenshots: boolean = true
    public mapsite: boolean = false
    public mapdepth: number = 0
    public tests: string[] = ['*']
    public excludetests: string[] = []
    public batchsize: number
    public testsPerPage: number
    public refreshevery: number
    public shotperpage: boolean

    public viewport: any = {}
    public screensize: string

    public constructor(initialOptions: Record<string, any> = {})
    {
        if(true) return // TODO Skipped while in singleton
        this.url = new URL(initialOptions.scan_url ?? 'https://google.com');
        // TODO Read in initialOptions and config default fallbacks
    
        if(!initialOptions.name ) {
            let cleanUrl = this.url.host.replace(/[^a-zA-Z0-9-_ ]/g, '_');
            this.name = cleanUrl + "_" + this.startTime;
        }

        if(!initialOptions.paths) {
            this.paths = dir.build(this);  
        }
        

        if(this.mapsite) {
            if (!this.mapdepth) {
                this.mapdepth = 1;
            }
        }

        if (initialOptions.screensize && !initialOptions.viewport) {
            let foundByName = (initialOptions.screensize in initialOptions.viewports)
            if (foundByName) {
                this.viewport = CONFIG.viewports[initialOptions.screensize];
            } else {
                const split = initialOptions.screensize.split(":");
                console.log(split);
                if (split.length == 2) {
                    var w = parseInt(split[0])
                    var h = parseInt(split[1])
                    if(
                        Number.isInteger( w )  && Number.isInteger( h ) 
                        && w>0 && h>0
                    ){
                        this.viewport = { width: w, height :h }
                    }
                }
            }
        }
        if(initialOptions.screensize && !initialOptions.viewport ){
            // ???
        }
        if (!initialOptions.viewport) {
            this.viewport = CONFIG.viewports.desktop;
        }
        
        dir.fileWrite(this.paths.dir + "/options.json", JSON.stringify(this), "w+")
    }

    public async build(options: Record<string, any> = {}): Promise<Record<string, any>>
    {
        let changed = false; 

        if( options == undefined){
            options = {};
            changed = true;
        }
    
        if(!options.startTime) {
            options.startTime = Date.now();
            changed = true;
        }

        if(!options.startDateTime) {
            options.startDateTime = new Date(options.startTime);
            changed = true;
        }
        
        // let timeStr = options.startDateTime.getFullYear() 
        //             + "_" +options.startDateTime.getMonth()
        //             + "_" +options.startDateTime.getDate()
        //             +"_"+options.startDateTime.getHours()
        //             +"-"+options.startDateTime.getMinutes()
        //             +"-"+options.startDateTime.getSeconds()

        //if i dont have a url (why not!) lets derfault to a known likely to be available domain...
        if( !options.url) {
            options.url = new URL('https://google.com');
            changed = true;
        }

        if( typeof(options.url)!= typeof(new URL('https://google.com')) ) {
            options.url = new URL( options.url );
            changed = true;
        }
    
        if( !options.name ) {
            let cleanUrl = options.url.host.replace(/[^a-zA-Z0-9-_ ]/g, '_');
            options.name = cleanUrl+"_"+options.startTime;
            changed = true;
        }


        if( !options.paths ) {
            options.paths = dir.build(options);        
            changed = true;    
        }

        if( !('screenshots' in options) ) {
            options.screenshots = true ;
            changed = true;
        }



        if( !('mapsite' in options) ) {
            options.mapsite = false ;
            changed = true;
        }

        if( options.mapsite =="true" || options.mapsite ==1 || options.mapsite === true) {
            if(!options.mapdepth){
                options.mapdepth = 1;
                changed = true;
            }
        }

        //tests/guidelines/levels that we want to run / omit 
        if( !options.tests ) {
            //all the tests please!
            options.tests = "*";
            changed = true;
        }

        if( typeof( options.tests) === 'string' && options.tests !="*" ) {
            options.tests = options.tests.toUpperCase().split(",");
            changed = true;
        }

        if( !options.excludetests ) {
            options.excludetests=[];
            changed = true;
        }

        if( typeof( options.excludetests) === 'string' ) {
            options.excludetests = options.excludetests.toUpperCase().split(",");
            changed = true;
        }
        

        if( ! options.batchsize ) {
            options.batchsize = CONFIG.testDefaults.batchSize;
            changed = true;
        }

        if( ! options.perpage ) {
            options.perpage = CONFIG.testDefaults.testsPerPage;
            changed = true;
        }

        if( ! options.refreshevery ) {
            options.refreshevery = CONFIG.testDefaults.refreshEveryXTests;
            changed = true;
        }

        if( 'shotperpage' in options ) {
             if( !( options.shotperpage===true || options.shotperpage===false) ){
                options.shotperpage = (  options.shotperpage===1 || options.shotperpage==='1' ||options.shotperpage==='true' );
                changed = true;
            }
        }

        if( !( 'shotperpage' in options ) ) {
            options.shotperpage = CONFIG.testDefaults.shotperpage;
            changed = true;
        }



        //view port ... 
        if('screensize' in options && !options.viewport ){
            //did i pass one i can look up or a number number pair... ?
            let foundByName = ( options.screensize in config.viewports);
            if( foundByName ){
                options.viewport = CONFIG.viewports[ options.screensize ];
                changed = true;
            }

            if(!foundByName){
                var split = options.screensize.split(":");
                console.log( split );
                if( split.length==2){
                    var w = parseInt(split[0]);
                    var h = parseInt( split[1]);

                    if(
                        Number.isInteger( w )  && Number.isInteger( h ) 
                        && w>0 && h>0
                    ){
                        options.viewport = { width: w, height :h };
                        changed = true;
                    }
                }
            }
            
        }

        if( !options.viewport ){
            //default to desktop... 
            options.viewport = CONFIG.viewports.desktop;
            changed = true;
        }
        
        //paths are made we can write our options file out!
        if( changed ) {
            dir.fileWrite(options.paths.dir+"/options.json", JSON.stringify(options), "w+");
        }

        return options;
    }
}

const SINGLETON = new Options({}) // TODO Swap to Options instance.
export default SINGLETON