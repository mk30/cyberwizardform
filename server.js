var http = require('http');
var ecstatic = require('ecstatic');
var ex = ecstatic({ root: __dirname +
'/public' });
var concat = require('concat-stream');
var qs = require('querystring');
var level = require('level');
var bytewise = require('bytewise');

var db = level('applicants.db', {
    keyEncoding: bytewise,
    valueEncoding: 'json'
});

http.createServer(function (req, res){
    console.log(req.method + ' ' + req.url);
    if (req.method === 'POST') {
        req.pipe(concat(function (body){
            var input = qs.parse(body.toString());
            db.put(Date.now(), input,
            function (err) {
                if (err)
                    res.end('error!')
                else res.end('thanks!')
            })
        }));
    }
    else if (req.url === '/applicants.html') {
        var stream = db.createReadStream()
        stream.on('data', function (data) {
            res.write(data.key + '');
            res.write(JSON.stringify(data.value))
        })
        stream.on('end', function () {
            res.end()
        })
    }
    else
        ex(req, res);
}).listen(8000);
