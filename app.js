const http = require('http');
const { MongoClient } = require('mongodb');
const { deflate } = require('zlib');
const qs = require('querystring');
const port = process.env.PORT || 8080;
const connectionString = "mongodb+srv://gopal-mongo:01qac2QOwwtSodR8@cluster0.lv9yd.mongodb.net/admin?authSource=admin&replicaSet=atlas-stnoyb-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";


const  getTodos = async (client)=>{
    await client.connect();
    const result = {error_code: 0, message: ""};
    const queryCursor = await client.db("todoList").collection("todos").find();
    // console.log(queryResult);
    return queryResult = await queryCursor.toArray();
    await client.close();
    
}

const saveTodo = async (client,data) =>{
    await client.connect();
    const result = {error_code: 0 , message:""} ;
    let queryResult;
    if(!data._id)
        queryResult = await client.db("todoList").collection("todos").insertOne(data);
    else 
        queryResult = await client.db("todoList").collection("todos").update( {_id:post._id}, data);    
    // console.log(queryResult);
    await client.close();
    return queryResult;
}


// const updateTodo = async (client,id,data) =>{
//     await client.connect();
//     const result = {error_code: 0 , message:""} ;
//     const queryResult = await client.db("todoList").collection("todos").update( {id:id}, data);
//     // console.log(queryResult);
//     await client.close();
// }



const serverCallback = async (req,res) => {
    let resp  = {error_code: 0, message: ""};

    if(req.url == "/"){
        resp = {error_code: 1, message : "Server is running. Please specify endpoint."}
    }else{
        console.log(req.url,req.method);
        client = new MongoClient(connectionString);
        switch(req.method){
            case "POST":
                switch(req.url){
                    case "/todo/save":
                        var body = '';

                        req.on('data', function (data) {
                            body += data;

                            // Too much POST data, kill the connection!
                            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                            if (body.length > 1e6)
                                req.connection.destroy();
                        });

                        req.on('end', function () {
                            var post = qs.parse(body);
                            saveTodo(client,post);
                        });
                        break;
                    default:
                        resp = {error_code: 1 , message: "Undefined endpoint."}
                        break;
                }
                break;
            case "GET": 
                switch(req.url){
                    case "/todoList":
                        let todos = await getTodos(client);
                        console.log(todos);
                        resp = {error_code: 0 , message: "data fetched successfully.", data:todos};
                        break;             
                    default:
                        resp = {error_code: 1 , message: "Undefined endpoint."}
                        break;
                }
                break;
            default: 
                console.log("hello");
                break;
        }
    }
    if(resp.error_code > 0){
        res.statusCode = 404;
    }else{
        res.statusCode = 200;
    }
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(resp));
    res.end();
};

const server = http.createServer(serverCallback);

server.listen(port,()=>{console.log("Server is running on"+process.env.HOST+port);});
