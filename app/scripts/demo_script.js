const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const fs1 = require("fs");
//const shell = require('shelljs');
var sqlite3 = require('sqlite3');
var Client = require('node-rest-client').Client;
var client = new Client();
var ip = require("ip");

var arguments = process.argv

async function run(arg,cb){


    try {
        var bufferObj = Buffer.from(arg, "base64");
        const userpass = await fs.readFile("/usr/src/app/userpass.json");
        const userData = JSON.parse(userpass);
        // const cookies = JSON.parse(cookiestring);.
        const argument = JSON.parse(bufferObj);
        let ip_address=process.env.IP_ADDRESS;
        let APP_URL=process.env.APP_URL;
        var request_id = argument.rowid;
        var argss = {
            data: { ip_address: ip_address, logs: "Lead list" },
            headers: { "Content-Type": "application/json" }
        };
        client.post("https://"+APP_URL+"/linodevps_logs", argss, function (data, response) {
            // parsed response body as js object
        });



        fetchleadlists(userData.username, userData.password,request_id,function(data){
            return cb(data);
        });

    } catch (error) {
        // console.log(error);
        incomingslackwebhooks("script name fetchLeadList.js "+error);
        var obj = {
            "data" : error,
            "status" : 200
        }

        return cb(obj);
    }
}


//Fetch lead lists
async function fetchleadlists(username, password,request_id,cb) {
    try {
        //Checking for Login Cookie.JSON
        let loggedincookie = 0;var myObj;
        
        var ip_address = process.env.IP_ADDRESS;
        const path = "/usr/src/app/cookies.json";
        var cookiestring =  fs.readFile("/usr/src/app/cookies.json");
        cookiestring.toString('utf8');
        // console.log(cookiestring);
        if (fs1.existsSync(path)) {
            // Cookie exists
            loggedincookie = 1;
        }

        const browser = await puppeteer.launch({
            headless: true, // Must be true for Ubuntu server
            executablePath: process.env.CHROME_BIN || null,
            args: ["--no-sandbox",
            '--disable-dev-shm-usage'
        ],
            ignoreDefaultArgs: ["--enable-automation"],
            // args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
        });


        const page = await browser.newPage();
        page.on('error', async () => {
            // throw err; // catch don't work (issue: 6330, 5928, 1454, 6277, 3709)
            await browser.close();
            var obj = {
                "data" : "page on error browser close",
                "status" : 505
            }
            incomingslackwebhooks("script name fetchLeadList.js page on error browser close");
            return cb(obj);
        });
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
        // const navigationPromise = page.waitForNavigation({ waitUntil: "load" });
        await page.setUserAgent(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.3904.108 Safari/537.36"
        );
        await page.setDefaultNavigationTimeout(0);

        
        if (loggedincookie) {
            const cookiestring = await fs.readFile("/usr/src/app/cookies.json");
            const cookies = JSON.parse(cookiestring);
            await page.setCookie(...cookies);

            await page.goto("https://www.linkedin.com", { waitUntil: "load" });
            await delay(getRandomWait());
            const title = await page.evaluate(() => document.title);
            try {
                const globalnavprimarymenucheck = await page.$$("ul.global-nav__primary-items li");
                if(globalnavprimarymenucheck.length == 0){
                  linodevps_botuserlogout();
                  var obj = {
                  "data" : "Session Expired",
                  "status" : 505
                  }
                  return cb(obj);
                }
            } catch (e) {
            // Login Check
                linodevps_botuserlogout();
                var obj = {
                "data" : "Session Expired",
                "status" : 505
                }
                return cb(obj);
            }
            if (title.toLowerCase().includes("feed | linkedin")) {
                await delay(getRandomWait());
                const cookies = await page.cookies();
                await fs.writeFile("/usr/src/app/cookies.json", JSON.stringify(cookies, null, 2));
                var SalesNavcheck=0;
                const globalnavprimarymenu = await page.$$("ul.global-nav__primary-items li");
                for (const globalnavprimarymenus of globalnavprimarymenu){
                    try {
                      var getSectionname = await page.evaluate(
                          (el) => el.querySelector("a > span").textContent,
                          globalnavprimarymenus
                      );
                    } catch (e) {
                      continue;
                    }
                    if(getSectionname.toLowerCase().trim() == "sales nav" || getSectionname.toLowerCase().trim() == "sales navigator"){
                        SalesNavcheck=1;
                        break;
                    }
                }
                if(SalesNavcheck==1){
                await page.goto(
                    "https://www.linkedin.com/sales/lists/people", { waitUntil: 'domcontentloaded' }
                );
                await delay(getRandomWait());

                const title2 = await page.evaluate(() => document.title);

                var list_name;var lead_count;var list_url;
                var leadlistdata = [];
                    var pagination_block;
                try {
                    await page.waitForSelector('ul > li.artdeco-pagination__indicator');
                    await delay(getRandomWait());
                     pagination_block = await page.$$("ul > li.artdeco-pagination__indicator");
                } catch (error) {
                    incomingslackwebhooks("script name fetchLeadList.js "+error);
                }
                for (const pagination of pagination_block) {
                    try {
                        await page.evaluate(
                            (el) => el.querySelector("button").click(),
                            pagination
                        );
                    } catch (error) {
                        // console.log(error)
                    }
                //if (title.toLowerCase().includes("lead lists | sales navigator")) {
                // try{
                    await page.waitForSelector('tr.artdeco-models-table-row');
                    await delay(getRandomWait());
                    
                    const leadLists = await page.$$("tr.artdeco-models-table-row");
                    
                    for (const leadList of leadLists) {
                        try {
                            list_name = await page.evaluate(
                                (el) => el.querySelector("td > div > span > a > div").textContent,
                                leadList
                            );
                        } catch (error) {
                            list_name = await page.evaluate(
                                (el) => el.querySelector("td > div > a > div").textContent,
                                leadList
                            );
                        }
                        try {
                            lead_count = await page.evaluate(
                                (el) => el.querySelector("td > div > span.pl2").textContent,
                                leadList
                            );
                        } catch (error) {
                            lead_count = '';
                        }
                        try {
                            list_url = await page.evaluate(
                                (el) => el.querySelector("td > div > span > a").getAttribute("href"),
                                leadList
                            );
                        } catch (error) {
                            list_url = await page.evaluate(
                            (el) => el.querySelector("td > div > a").getAttribute("href"),
                            leadList
                            );
                        }
                    
                        let leadsData = {
                            list_name: list_name.trim(),
                            lead_count: lead_count.trim(),
                            list_url: list_url.trim(),
                            ip_address: ip_address
                        }
                        leadlistdata.push(leadsData);

                    }
                // } catch (error) {
                //     console.log(error);
                // }
                // }else{

                // }
                }
                var args = {
                    data: leadlistdata,
                    headers: { "Content-Type": "application/json" }
                };
                var APP_URL=process.env.APP_URL;
                client.post("https://"+APP_URL+"/linodevps_cmp_salesnavleadlistsfetch", args, function (data, response) {
                    // response.status(200).json(["fetching completed"]);

                });

                console.log(leadlistdata);
                //console.log(request_id);
                // request row record removed 
                deleterow(request_id);
                await browser.close();
                return cb(leadlistdata);
            }else{
                deleterow(request_id);
                await browser.close();
                return cb("Not Premium Account");
            }

            } else {
                 // Login Check
                // linodevps_botuserlogout();
                var myobj = {
                    "data" : "page not found",
                    "status" : 503
                }
                // await browser.close();
                return cb(myobj);
            }
        }
    } catch (error) {
        // await browser.close();
        incomingslackwebhooks("script name fetchLeadList.js "+ error);
        var myobj = {
            "data" : "error",
            "status" : 503
        }
        return cb(myobj);
    }
}

const delay = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

function getRandomValue() {
    let x = Math.floor(Math.random() * 30 + 100);
    return x;
}

function getRandomWait() {
    let y = Math.floor(Math.random() * 1000 + 2000);
    return y;
}

function getRandomLongWait() {
    let y = Math.floor(Math.random() * 4000 + 6000);
    return y;
}

// console.log(JSON.stringify(run()));
// console.log(JSON.stringify(run(arguments[2]), function(output){

// }));

run(arguments[2], function(output){
    let datafile='';
    fs.writeFile('/usr/src/app/runprocessrequest.json', datafile, err => {
        if (err) {
            console.error(err);
        }
        console.log('file written successfully');
    });
    console.log(JSON.stringify(output));
    return;
});

// delete row function
function deleterow(request_id){
    var db = new sqlite3.Database('/usr/src/app/fintellobot.db', (err) => {
      if (err) {
          console.log("Getting error " + err);
      }
      db.run('DELETE FROM run_scheduled WHERE id = ?', [request_id], function(err) {
          if (err) {
              console.error(err.message);
          } else {
              console.log(`Row(s) deleted: ${this.changes}`);
          }
      });
    });
  }

  function incomingslackwebhooks(textmessage){
    try {
      const webhookUrl = '';
  
      let ip_address = process.env.IP_ADDRESS;
      const message = {
        text: "IP Address: "+ip_address+" "+textmessage
      };
      
      const args = {
        data: message,
        headers: { 'Content-Type': 'application/json' }
      };
      var respon;
      client.post(webhookUrl, args, (data, response) => {
        if (response.statusCode === 200) {
          respon='Message sent to Slack';
        } else {
          respon='Error sending message to Slack:'+ response.statusMessage;
        }
      });
      // res.status(200).json(respon);
    } catch (error) {
      console.log(error);
      // res.status(302).json(error);
    }
  }

  async function linodevps_botuserlogout(){
    // await fs.writeFile("/usr/src/app/cookies.json", "");
    //   var argss = {
    //       data: { ip_address: process.env.IP_ADDRESS },
    //       headers: { "Content-Type": "application/json" }
    //   };
      
    // client.post("https://"+process.env.APP_URL+"/linodevps_botuserlogout", argss, function (data, response) {
    // });
    incomingslackwebhooks("script name fetchLeadList.js Session Expired");
  }