var express = require('express');
var connection = require('express-myconnection');
var mysql=require('mysql');
var app = express();


app.use(
    connection(mysql,{

        host: 'localhost',
        user: 'root',
        password : 'password',
        port : 3306, //port mysql
        database:'enrollment'

    },'pool') //or single
    

);