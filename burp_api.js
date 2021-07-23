const request = require('requestretry');

var REST_API="http://127.0.0.1:1337/v0.1/scan";

function task_id(url,callback)
{

request({
    method: 'POST',
    url: REST_API,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-type':'application/json'
    },
    maxAttempts: 25,
    retryDelay: 14000,
    followRedirect: false,
    followAllRedirects: false,
    fullResponse: false,
    json: {
        "scope": {
            "include": [{"rule": url, "type":"SimpleScopeDef"}]
        }, 
        "urls": [url]
    }
    
}, function(err, response, body){
    return callback(response)
  });
}

function report(id,callback)
{

request({
    method: 'GET',
    url: REST_API+"/"+id,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-type':'application/json'
    },
    maxAttempts: 25,
    retryDelay: 14000,
    followRedirect: false,
    followAllRedirects: false,
    fullResponse: false,
    
}, function(err, response, body){
    return callback(body)
  });
}


var id_list = [];
var issue_db= [];

require('fs').readFileSync('domains.txt', 'utf-8').split(/\r?\n/).forEach(function(line){
    task_id(line,function (response)  {
        console.log("TASK ID: "+response.headers.location+ " --> "+line)
        id_list.push(response.headers.location);
        });
  })

setInterval(function() {  

if(id_list.length>0) {
    for (var i = 0; i < id_list.length; i++) {
        report(id_list[i],function (response)  {
            if(response.includes("succeeded")) {

                   // delete id_list[i]
                    id_list.pop(i)
            
            }else {
               // console.log(response)

               if(response.includes("issue_events")) {

                try {
                        var issue_list_json = JSON.parse(response);
                        var issue_list=issue_list_json.issue_events

                        if(!issue_db.includes(JSON.stringify(issue_list))) {
                            issue_db.push(JSON.stringify(issue_list))
                            console.log(issue_list)

                        }
                }
                catch (e) {

                }

        }

            }
        
        });
    }

}
}, 5000);  


