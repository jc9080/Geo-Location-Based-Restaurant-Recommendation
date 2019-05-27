var mysql=require('mysql');
var connection=mysql.createConnection({
  host:'csgy6083.c0xc0ecktlug.us-east-1.rds.amazonaws.com',
  port:'33060',
  user:'root',
  password:'rootroot',
  database:'oingobackup'
});
module.exports=connection;
