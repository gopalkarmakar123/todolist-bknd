const express = require('express');
// const http = require('http');
var cors = require('cors')
var bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require('mongodb');

const todos = require("./routes/todos");
// const qs = require('querystring');
const port = process.env.PORT || 8000;
const connectionString = "mongodb+srv://gopal-mongo:01qac2QOwwtSodR8@cluster0.lv9yd.mongodb.net/admin?authSource=admin&replicaSet=atlas-stnoyb-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";
const app = express();

const corsOpt = {
    allowedHeaders:['Content-Type', 'Authorization','Access-Control-Allow-Headers','X-Requested-With'],
};
app.use(cors(corsOpt));
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({extended:false}));

app.use('/todos',cors(corsOpt),todos);

app.use("/", (req,res) => {
    res.status(401).send({message:"Please specify an endpoint."});
});
app.listen(port,
    ()=>{console.log("Server is running on "+port);
});
