Thoughts for better versions...


1 set up a tests class (abstract) 
have it have selector ( nullable ) 
and refreesh before etc.. ( all the fields that we will need to be able to fully define how that particular test is run )

have a defined function analyse (or test or evealuate what evere naming is best)  which accepts maybe a page from puppeteer and runs the test~
* It could be that these are discoverable at run time as in my previous example such that they exist as config but get converted / loaded into test objects - but SOME of them will be better defined as actual concreete classes.


2 set up a result class
{ fid , procedurr_id? node , bounds fail info , see 7 below as we could have a result be a combo of FID/ ProcId  page url and an HtmlNode object}
Running a test should return an arry of these
and should allow for unmiformality (ie the results from any tests will beable to be merged into all the other results to produce a set of page results)

3 using the above we can set up eg AXE as a 'test'
we run it in the same way and allow its results to get formatted how we want them

4 allow for continuous return (so i can report results as i have them )
5 allow for finished update to let the world know i am done
-> 4 and 5 should be able to run themselves and be told where to report to ( pass in a callback) such that the whole thing can be ephemeral

6 provide tighter control over the pupeteer instence (tabs / refresh / etc optimise to run tests easier with correct results)
7 consider carfully the images.. is it better to snap 1 large one or multiple little ones ? ( i thknk the latter ) -> do we need to handle this in an entierly diferent process?
-> to this end - we may want to define an HtmlNode class (with a factory) that allows each node that is identified as having an issue to be represented in this class, and have its screen shot taken, then if that same node is id'd latter for a diff rule, we already have the object (and the screen shot) 


8 Each custom test should be an isstence of the test class - in some cases that will be overkill but at least its uniform
-> we could create a concrete base test object to extend the abstract test object and then have tests inherit it where appropriate but we should allow for direct abstract extention too

9 LOGGING
-> this whole system need to be abkle to log everything.
  even if this is just to a day file which gets deleted every week - we need to know when things happen oddly why and what tirggered 

10 Error resistence - this needs try catch exception handling every where - we need to be able to return some value regardless of any issues we may face.

11 Pre role ... we may want to perform some reasonable tests before we start to make sure that our tests CAN run - such as testing for 200 status (not 404 , or 301/2 etc) 

12 We need to be able to specifiy which tests to run, by guideline id, fail id, procedure id ? and by level (a/aa/aaa) and also by creator ( recite / axe /css etc) 

13 the queue - should be fire and forget , it should send a page job to a scanner  with a callback and the scanner should do all the rest. 
this means the scanner MAY need to trigger other 3rd party tools ( such as a python endpoint for images or whatever else we can imagine ) at which point the scanner will be responsible for also awaiting that out put and dealing with errors from it -- does that need to be a seperate system ?
We could seperate out the scanner runner and teh scanner scanner - the runner is responsible for starting all jobs that make up a page scan and awaiting all the results, the scanner_scanner will be what we currently have ( the one and only job that makes up a scan ) 

14 Resourse management : __IMPORTANT__  the scanner should not give a flying rats ass about threads or anything else. it should be in one of two states READY (can accept scan requests) or BUSY (running a scan request) then the threading is managed by how many instance of the scanner the queue is able to engage
(if we spool up 20 scanners then we can run 20 page scans at once if we only spool up 1 then we will have to wait till its page is scanned )
The queue can do this in a round robin fashion and maybe the scanner will be responisble for alerting a queue to its presence when it starts up 


