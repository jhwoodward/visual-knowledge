var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('dist'));

app.get('*', function (req, res) {
    res.sendFile('dist/index.html', { root: __dirname });
});

var port = process.env.PORT || 50008;


app.listen(port);
console.log('Magic happens on port ' + port);