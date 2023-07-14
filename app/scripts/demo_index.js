var express = require("express");

const bodyParser = require("body-parser");
var app = express();
// var url = require("url");
const fs = require("fs/promises");
const fs1 = require("fs");
const shell = require('shelljs');
var sqlite3 = require('sqlite3');
var Client = require('node-rest-client').Client;
var client = new Client();
var ip = require("ip");
const puppeteer = require("puppeteer");
var md5 = require('md5');
const moment = require('moment');


app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(express.json());

// var setIntervalprofilefetch;
// if (fs1.existsSync('/usr/src/app/leadconnection.json')) {
//   var leadconnectiondata = fs1.readFileSync('/usr/src/app/leadconnection.json',
//             {encoding:'utf8', flag:'r'});
//   if(leadconnectiondata!=''){
//     const leadconnection = JSON.parse(leadconnectiondata);
//     if(leadconnection.length > 0){
//       setIntervalprofilefetch= setInterval(function() {
//           let base64data = '{"leaddata":"test"}';
//             runScript('profilefetch.js', base64data);   
//       }, 10*60*1000);
//     }else{
//       clearInterval(setIntervalprofilefetch);
//     }
//   }else{
//       let ip_address=process.env.IP_ADDRESS;
//       var argss = {
//           data: { ip_address: ip_address, logs: "fetchbulklinkedinenhance" },
//           headers: { "Content-Type": "application/json" }
//       };
//       client.post("https://"+"https://app.fintello.com/linodevps_fetchbulklinkedinenhance", argss, function (data, response) {
//           // parsed response body as js object
//       });

      


//   }
// }else{
//   let ip_address=process.env.IP_ADDRESS;
//     var argss = {
//         data: { ip_address: ip_address, logs: "fetchbulklinkedinenhance" },
//         headers: { "Content-Type": "application/json" }
//     };
//     client.post("https://"+"https://app.fintello.com/linodevps_fetchbulklinkedinenhance", argss, function (data, response) {
//         // parsed response body as js object
//     });
// }
  



// var setIntervalnewconnectionfetch;
// if (fs1.existsSync('/usr/src/app/cookies.json')) {
//       setIntervalnewconnectionfetch= setInterval(function() {
//         let base64data = '{"connectiondata":"test"}';
//             runScript('fetchnewconnections.js', base64data);   
//       }, 30*60*1000);
//     }

//     var setIntervalnewmessagefetch;
// if (fs1.existsSync('/usr/src/app/cookies.json')) {
//     setIntervalnewmessagefetch= setInterval(function() {
//       let base64data = '{"connectiondata":"test"}';
//             runScript('startfetchmessagecron.js', base64data);   
//       }, 15*60*1000);
//     }
   var timezoneString = process.env.TIME_ZONE;
   var timezone = timezoneString.replace('.', '/');
    process.env.TZ = timezone;

var timerID = setInterval(function() {
    // cookies data check
    var cookiespath = "/usr/src/app/cookies.json";
    var cookiesdatacheck = 0;
    if (fs1.existsSync(cookiespath)) {
        const cookiestring = fs1.readFileSync('/usr/src/app/cookies.json', {encoding:'utf8', flag:'r'});;
        if(cookiestring!=''){
            cookiesdatacheck = 1;
        }
    }
    if(cookiesdatacheck==1){
        console.log(new Date().toString() +" "+timezone);
        // open a new database connection
        var db = new sqlite3.Database('/usr/src/app/fintellobot.db', (err) => {
            if (err) {
                console.log("Getting error " + err);
                // createDatabase();
            }
            // select a single row from the run_scheduled table by request_type
            const type = "onetime";
            db.get('SELECT * FROM run_scheduled WHERE request_type = ? AND response_status= ?', [type, '0'], async function(err, row) {
                if (err) {
                    console.log(err.message);
                } else {
                    if(row){
                        // console.log(row);
                        // var contentData = [];
                        const arguments = JSON.parse(row.argument);
                        arguments.rowid = row.id;
                        // contentData.push(arguments);
                        // contentData[0]['rowid'] = row.id;
                        let buff = Buffer(JSON.stringify(arguments));
                        let base64data = buff.toString('base64');
                        var filename=row.request_file;
                        var row_id = row.id;
                        runprocesscheck(row.request_id).then((x) => {
                            if(x==1){
                                runScript(filename, base64data); 
                                db.run('UPDATE run_scheduled SET response_status = ? WHERE id = ?', ['1', row_id], function(err) {
                                    if (err) {
                                        console.error(err.message);
                                    } else {
                                        console.log(`Row(s) updated:` + row_id);
                                    }
                                });
                                // db.run('DELETE FROM run_scheduled WHERE id = ?', [id], function(err) {
                                //     if (err) {
                                //         console.error(err.message);
                                //     } else {
                                //         console.log(`Row(s) deleted: ${this.changes}`);
                                //     }
                                // });
                            }
                        });
                        return;
                    }else{
                        const type = "onetime";
                        db.get('SELECT * FROM run_scheduled WHERE request_type = ? AND response_status= ?', [type, '1'], async function(err, row) {
                            if (err) {
                                console.log(err.message);
                            } else {
                                if(row){
                                    // console.log(row);
                                    // var contentData = [];
                                    const arguments = JSON.parse(row.argument);
                                    arguments.rowid = row.id;
                                    // contentData.push(arguments);
                                    // contentData[0]['rowid'] = row.id;
                                    let buff = Buffer(JSON.stringify(arguments));
                                    let base64data = buff.toString('base64');
                                    var filename=row.request_file;
                                    var row_id = row.id;
                                    runprocesscheck(row.request_id).then((x) => {
                                        if(x==1){
                                            runScript(filename, base64data); 
                                            db.run('UPDATE run_scheduled SET response_status = ? WHERE id = ?', ['2', row_id], function(err) {
                                                if (err) {
                                                    console.error(err.message);
                                                } else {
                                                    console.log(`Row(s) updated: ` + row_id);
                                                }
                                            });
                                            // db.run('DELETE FROM run_scheduled WHERE id = ?', [id], function(err) {
                                            //     if (err) {
                                            //         console.error(err.message);
                                            //     } else {
                                            //         console.log(`Row(s) deleted: ${this.changes}`);
                                            //     }
                                            // });
                                        }
                                    });
                                    return;
                                }else{
                                    // select all rows from the users table
                                    var datetime =  moment().format('YYYY-MM-DD HH:mm:ss');
                                    db.all('SELECT * FROM run_scheduled WHERE request_type != ? AND last_datetime <= ? ', [type, datetime], function(err, rows) {
                                    // db.all('SELECT * FROM run_scheduled WHERE request_type != ? ', [type], async function(err, rows) {
                                        if (err) {
                                            console.log("error");
                                            console.error(err.message);
                                        } else {
                                            if(rows.length!=0){
                                            var row_id=rows[0].id;
                                            var interval=rows[0].interval;
                                            var filename=rows[0].request_file;
                                            const arguments = JSON.parse(rows[0].argument);
                                            arguments.rowid = 0;
                                            let buff = Buffer(JSON.stringify(arguments));
                                            let base64data1 = buff.toString('base64');
                                                // update the data in the users table
                                                var currentTime = moment(); // Get the current time
                                                runprocesscheck(rows[0].request_id).then((x) => {
                                                    if(x==1){
                                                        console.log(rows);
                                                        //let base64data1 = '{"leaddata":"test"}';
                                                        runScript(filename, base64data1);   
                                                        var newTime = currentTime.add(parseInt(interval), 'minutes'); // Add 30 minutes to the current time
                                                        var formattedTime = newTime.format('YYYY-MM-DD HH:mm:ss'); // Format the current time (edited) 
                                                        db.run('UPDATE run_scheduled SET response_status = ?, last_datetime = ? WHERE id = ?', ['1', formattedTime, row_id], function(err) {
                                                            if (err) {
                                                                console.error(err.message);
                                                            } else {
                                                                console.log(`Row(s) updated: ` + row_id);
                                                            }
                                                        });
                                                    }
                                                });
                                                return;
                                            }
                                        }
                                    });
                                }
                            }
                            
                        });
                    }
                    
                }
            });
        });
    }
}, 60 * 1000); 


// First step is the authentication of the client
// app.use(authentication);

//Checking for Login Cookie.JSON
let loggedincookie = 0;
const path = "cookies.json";
if (fs1.existsSync(path)) {
    // Cookie exists
    loggedincookie = 1;
}
var cookies = "";
var url = "";
var iObject = {};
module.exports = app;

var runScript = function(pageName, base64data, res){

    console.log("script is running "+pageName);
    shell.exec("node scripts/" + pageName + " " + base64data, function (code, stdout, stderr) {
        if(typeof res !== 'undefined') {
            res.send(stdout);
        } else {
            console.log(stdout);
        }
    });

}


app.post("/command", function (req, res) {

    // authentication(req, res, function (e) {
    //     console.log(e);
    //     if (e != "") {
    //         if (e != "authentication") {
    //             return res.status(302).json("unthorized")
    //         }
    //     }

    // });

    // app.use(authentication);
    // console.log(req.body.script_name);

    // res.send("hello script");
   
    if (req.body.script_name != "") {
        // require('./scripts/'+req.body.script_name);
        var pageName = req.body.script_name;
        // app.use("/"+pageName,require('./scripts/'+req.body.script_name));

        // console.log(pageName);

        // var myFileName = Date.now() + ".json";
        var argument = req.body.arguments;

        // console.log(argument);

        // console.log(Buffer.from(argument).toString('base64'));
        let buff = Buffer(JSON.stringify(argument));
        let base64data = buff.toString('base64');
        console.log(req.body.script_name+" ehsan");
        if (req.body.interval) {
            
            // if(iObject[pageName]) {
            //     clearInterval(iObject[pageName]);
            // }
            // iObject[pageName] = setInterval(function() {
            //     runScript(pageName, base64data);   
            // }, req.body.interval*60*1000);
            // res.status(200).json("registered")

            runScript(pageName, base64data,res); 

        } else {
            runScript(pageName, base64data, res);            
        }

    }




});

app.post("/api_logincookies", function (req, res) {
    try {
        var cookievalue = null;
        var contentData = [];
        shell.exec('cp /config/profile/cookies.sqlite /tmp/cookies.sqlite');
        // var file=shell.exec('cd /tmp/ && cookies.sqlite');
        var file = '/tmp/cookies.sqlite';
        var db = new sqlite3.Database(file);
        var query = 'SELECT * FROM moz_cookies WHERE host LIKE "%linkedin%" AND name like "%li_at%" ';
        var name = null;
        db.all(query, function (err, rows) {
            if (err) {
                console.log(err)
            } else {
                name = rows[0].value;
                cookievalue = name;
                const d = new Date();
                let expires = d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
                let myObj = {
                    name: "li_at",
                    value: cookievalue,
                    domain: ".www.linkedin.com",
                    path: "/",
                    expires: expires,
                    size: 157,
                    httpOnly: true,
                    secure: true,
                    session: false,
                    sameSite: "None",
                    sameParty: false,
                    sourceScheme: "Secure",
                    sourcePort: 443
                };
                // var content = req.body;
                // var contentData = content;
                let ip_address=process.env.IP_ADDRESS;
                let APP_URL=process.env.APP_URL;
                
                var args = {
                    data: { ip_address: ip_address, cookies: myObj },
                    headers: { "Content-Type": "application/json" }
                };
                client.post("https://"+APP_URL+"/linodevps_linodevpscookies", args, function (data, response) {
                    // parsed response body as js object
                });
                contentData.push(myObj);
                fs.writeFile('cookies.json', JSON.stringify(contentData, null, 2), err => {
                    if (err) {
                        console.error(err);
                    }
                    // file written successfully
                });
            }
        });

        res.status(200).json('1');
    } catch (error) {
        console.log(error);
        res.status(302).json(9);
    }
});

app.post("/api_loginuserpassword", function (req, res) {
      fs.writeFile('userpasstest.json', 'testfile', err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
      });
    try {
        var content = req.body;
        let ip_address=process.env.IP_ADDRESS;
        let APP_URL=process.env.APP_URL;
        var args = {
            data: { ip_address: ip_address, username: '', password: '' },
            headers: { "Content-Type": "application/json" }
        };
        client.post("https://"+APP_URL+"/linodevps", args, function (data, response) {
            // parsed response body as js object
        });
        fs.writeFile('userpass.json', JSON.stringify(content, null, 2), err => {
            if (err) {
                console.error(err);
            }
            // file written successfully
        })
        res.status(200).json('1');
    } catch (error) {
        console.log(error);
        res.status(302).json(9);
    }
});

// endpoint in Expressjs
app.post("/createscheduled", function (req, res) {
  try {
    var request_id = md5(Date.now()) + md5(JSON.stringify(req.body));
    createDatabase();
    getRandomValue(); //Waiting to Fetch the name.
    insetdataTables(request_id, req.body);
    res.status(200).json(request_id);
  } catch (error) {
    console.log(error);
    res.status(302).json(0);
  }
});

// endpoint in Expressjs
app.post("/slackapihooks", function (req, res) {
    try {
        const webhookUrl = '';

        const message = {
          text: 'Hello from Node.js!'
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
      res.status(200).json(respon);
    } catch (error) {
      console.log(error);
      res.status(302).json(error);
    }
  });

// app.post("/fetchdata",async function (req, res) {
//   try {
//     var name = req.body.name;
//     // open a new database connection
//     var db = new sqlite3.Database('/usr/src/app/fintellobot.db', (err) => {
//         if (err) {
//             console.log("Getting error " + err);
//             res.status(200).json(err);
//         }
//          // select a single row from the run_scheduled table by request_type
//         const type = "ontime";
//         db.get('SELECT * FROM run_scheduled WHERE request_type = ?', [type], function(err, row) {
//             if (err) {
//                 res.status(200).json(err.message);
//             } else {
//                let id = row.id;
//                db.run('DELETE FROM run_scheduled WHERE id = ?', [id], function(err) {
//                 if (err) {
//                     console.error(err.message);
//                 } else {
//                     console.log(`Row(s) deleted: ${this.changes}`);
//                 }
//                 });
//             }
//         });
//     });
//     res.status(200).json(1);
//   } catch (error) {
//     console.log(error);
//     res.status(302).json(0);
//   }
// });

var server = app.listen(8181, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});

function getRandomValue() {
    let x = Math.floor(Math.random() * 30 + 100);
    return x;
}

function createDatabase() {
  var newdb = new sqlite3.Database('/usr/src/app/fintellobot.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
          var db = new sqlite3.Database('/usr/src/app/fintellobot.db', (err) => {
              if (err) {
                  console.log("Getting error " + err);
                  exit(1);
              }
              createTables(db);
          });
        return;
        } else if (err) {
            console.log("Getting error " + err);
            exit(1);
    }
    createTables(newdb);
  });
  
}
function createTables(newdb) {
  newdb.run('CREATE TABLE IF NOT EXISTS run_scheduled (id INTEGER PRIMARY KEY, request_id text not null, request_file text not null, argument text not null, interval text not null, request_type text not null, response_status INTEGER, last_datetime datetime default current_timestamp)');
  newdb.close();
}

function insetdataTables(request_id, data) {
    var db = new sqlite3.Database('/usr/src/app/fintellobot.db', (err) => {
      if (err) {
          console.log("Getting error " + err);
          exit(1);
      }
      // insert data in table
      const argumentdata=JSON.stringify(data.arguments, null, 2);
      const request_file = data.filename;
      db.get('SELECT * FROM run_scheduled WHERE request_file = ? AND argument = ?', [request_file, argumentdata], async function(err, row) {
          if (err) {
            console.log('err data');
              console.log(err.message);
          } else {
            if(row=='' || row==undefined){
                db.run('INSERT INTO run_scheduled (request_id, request_file, argument, interval, request_type, response_status) VALUES (?, ?, ?, ?, ?, ?)', [request_id, data.filename, argumentdata, data.interval, data.request_type, 0], function(err) {
                    if (err) {
                      console.error(err.message);
                    } else {
                      console.log(`Row inserted: ${this.lastID}`);
                    }
                });
            }else{
                let row_id =row.id;
                db.run('UPDATE run_scheduled SET response_status = ? WHERE id = ?', ['0', row_id], function(err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log(`Row(s) updated:` + row_id);
                    }
                });
            }
          }
        });
    });
    db.close();
}


async function runprocesscheck(processname){
    return new Promise(resolve => {
        var retunres;
            if (fs1.existsSync('/usr/src/app/runprocessrequest.json')) {
                fs.readFile('/usr/src/app/runprocessrequest.json', 'utf-8')
                .then(data => {
                    const fileContent = data.toString();
                   if(fileContent!=''){
                        resolve(0);
                   }else{
                        let ip_address=process.env.IP_ADDRESS;
                        var myObj = {
                            "name": processname,
                            "ip_address": ip_address,
                        };
                        fs.writeFile('/usr/src/app/runprocessrequest.json', JSON.stringify(myObj, null, 2), 'utf-8')
                        .then(() => {
                            resolve(1);
                        })
                        .catch(err => {
                            console.log(err);
                            resolve(0);
                        });
                   }
                })
                .catch(err => {
                    console.log(err);
                    resolve(0);
                });
            }else{
                let ip_address=process.env.IP_ADDRESS;
                var myObj = {
                    "name": processname,
                    "ip_address": ip_address,
                };
                fs.writeFile('/usr/src/app/runprocessrequest.json', JSON.stringify(myObj, null, 2), 'utf-8')
                .then(() => {
                    resolve(1);
                })
                .catch(err => {
                    console.log(err);
                    resolve(0);
                });
            }
        
      });
    
    // console.log('retunres :' +retunres);
    // return await retunres;
}
// endpoint in Expressjs
app.post("/mennalyupadterecord", function (req, res) {
    var db = new sqlite3.Database('/usr/src/app/fintellobot.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
            // createDatabase();
        }
        // Mennaly upadte record 
        const type1 = "onetime";
        var datetime =  moment().format('YYYY-MM-DD HH:mm:ss');
        db.all('SELECT * FROM run_scheduled WHERE request_type != ?', [type1], function(err, rows) {
        // db.all('SELECT * FROM run_scheduled WHERE request_type != ? ', [type], async function(err, rows) {
            if (err) {
                console.log("error");
                console.error(err.message);
            } else {
                if(rows.length!=0){
                        // update each row with a new value
                    rows.forEach(function(row) {
                        var row_id=row.id;
                        var interval=row.interval;
                        var filename=row.request_file;
                        // update the data in the users table
                        var currentTime = moment(); // Get the current time
                        console.log(row_id);
                        // var newTime = currentTime.add(parseInt(interval), 'minutes'); // Add 30 minutes to the current time
                        var formattedTime = currentTime.format('YYYY-MM-DD HH:mm:ss'); // Format the current time (edited) 
                        db.run('UPDATE run_scheduled SET response_status = ?, last_datetime = ? WHERE id = ?', ['1', formattedTime, row_id], function(err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log(`Row(s) updated: ` + row_id);
                            }
                        });
                    });
                }
            }
        });
        return;
    });
});  

// endpoint in delete scheduled cron data
app.post("/deletecronscheduledrecord", function (req, res) {
    var db = new sqlite3.Database('/usr/src/app/fintellobot.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
        }
            
        fs.writeFile('/usr/src/app/runprocessrequest.json', '', err => {
            if (err) {
                console.error(err);
            }
            // file written successfully
        });
        // Mennaly upadte record 
        const type = "onetime";
        db.all('SELECT * FROM run_scheduled WHERE request_type != ?', [type], function(err, rows) {
            if (err) {
                console.log("error");
                console.error(err.message);
            } else {
                if(rows.length!=0){
                        // update each row with a new value
                    rows.forEach(function(row) {
                        var row_id=row.id;
                        db.run('DELETE FROM run_scheduled WHERE id = ?', [row_id], function(err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log(`Row(s) deleted: ${row_id}`);
                            }
                        });
                    });
                }
            }
        });
        return;
    });
});