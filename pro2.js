// node pro2.js --url=https://www.hackerrank.com --config=config.json
let minimist = require("minimist");
let fs = require("fs");
let args = minimist(process.argv);
let puppeteer = require("puppeteer");
let configkajson = fs.readFileSync(args.config,"utf-8");
let configjso = JSON.parse(configkajson);
async function run(){
    // start the browser
    let browser = await puppeteer.launch({
        headless:false,
        args:[
            '--start-maximized'
        ],
        defaultViewport:null
    });
    // get the tabs
    let pages = await browser.pages();
    let page = pages[0];
    // open the url 
    await page.goto(args.url);
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");
      await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
      await page.click("a[href='https://www.hackerrank.com/login']");
      await page.waitForSelector("input[name='username']");
      await page.type("input[name='username']",configjso.userid,{delay:20});
      await page.waitForSelector("input[name='password']");
      await page.type("input[name='password']",configjso.password,{delay:20});
      await page.waitFor(3000);
      await page.waitForSelector("button[data-analytics='LoginPassword']");
      await page.click("button[data-analytics='LoginPassword']");
      await page.waitForSelector("a[data-analytics='NavBarContests']");
      await page.click("a[data-analytics='NavBarContests']");
      await page.waitForSelector("a[href='/administration/contests/']");
      await page.click("a[href='/administration/contests/']");
    //   get the pages
    await page.waitForSelector("a[data-attr1='Last']");
    let numpages = await page.$eval("a[data-attr1='Last']",function(atag){
        let totpages = parseInt(atag.getAttribute("data-page"));
        return totpages;
         });
         for(let i = 1;i<=numpages;i++){
           await handleallcontestsofapage(page,browser);
           if(i!=numpages){
               await page.waitForSelector("a[data-attr1='Right']");
               await page.click("a[data-attr1='Right']");
           }
         }
          }
          async function handleallcontestsofapage(page,browser){
              await page.waitForSelector("a.backbone.block-center");
              let curls = await page.$$eval("a.backbone.block-center",function(atags){
                  let urls = [];
                  for(let i =0;i<atags.length;i++){
                      let url = atags[i].getAttribute("href");
                      urls.push(url);
                  }
                  return urls;
              });
              for(let i =0;i<curls.length;i++){
                  let ctab = await browser.newPage();
                  await savemoderatorincontests(ctab,args.url+curls[i],configjso.moderators);
                  await ctab.close();
                  await page.waitFor(3000);
              }
          }
          async function savemoderatorincontests(ctab,fullcurls,moderator){
              await ctab.bringToFront();
              await ctab.goto(fullcurls);
              await ctab.waitFor(3000);
            //   click pn moderator tab
            await ctab.waitForSelector("li[data-tab='moderators']");
            await ctab.click("li[data-tab='moderators']");
            // type in moderator
            await ctab.waitForSelector("input#moderator");
            await ctab.type("input#moderator",moderator,{delay:50});
            // press enter
            await ctab.keyboard.press("Enter");
          }

run();
