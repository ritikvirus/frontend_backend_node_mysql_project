var express = require("express");
var app = express();
var path = require("path");
var mysql = require('mysql');
var bodyParser = require('body-parser');
var moment = require('moment');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var con = mysql.createConnection({
     host : "assignment-2.cctpdrcs9xz3.ap-south-1.rds.amazonaws.com",
     user : "admin",
     password : "Test_1234",
     database : "divye"
});

con.connect(function(err) {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the database.');
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/', function(req, res) {
  var userName = req.body.userName;
  var emailId = req.body.emailId;
  var phoneNo = req.body.phoneNo;
  var password = req.body.password;
  var dateTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

  res.write('You sent the name "' + req.body.userName + '".\n');
  res.write('You sent the email "' + req.body.emailId + '".\n');
  res.write('You sent the password "' + req.body.password + '".\n');

  var sql = "INSERT INTO userData (userName, emailId, phoneNo, password, dateTime) VALUES (?, ?, ?, ?, ?)";
  var values = [userName, emailId, phoneNo, password, dateTime];

  con.query(sql, values, function(err, result) {
    if (err) {
      if (err.errno == 1062) {
        var updateSql = 'UPDATE userData SET userName = ?, phoneNo = ?, password = ? WHERE emailId = ?';
        var updateValues = [userName, phoneNo, password, emailId];

        con.query(updateSql, updateValues, function(err, result) {
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
        });

        res.end("Record updated.");
      } else {
        console.error(err);
        res.end("Error occurred.");
      }
    } else {
      console.log("1 record inserted");
      res.end("Record inserted.");
    }
  });
});

app.post('/search', function(req, res) {
  var emailId = req.body.emailIs;
  console.log(emailId);
  res.write('You sent the email "' + req.body.emailIs + '".\n');

  var sql = 'SELECT * FROM userData WHERE emailId = ?';
  var values = [emailId];

  con.query(sql, values, function(err, result) {
    if (err) {
      console.error(err);
      res.end("Error occurred.");
    } else {
      console.log(result);
      res.end("Search result: " + JSON.stringify(result));
    }
  });
});

app.listen(3000, function() {
  console.log("Running at Port 3000");
});
