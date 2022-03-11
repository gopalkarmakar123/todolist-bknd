const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');
const qs = require('querystring');
const port = process.env.PORT || 8000;
const connectionString = "mongodb+srv://gopal-mongo:01qac2QOwwtSodR8@cluster0.lv9yd.mongodb.net/admin?authSource=admin&replicaSet=atlas-stnoyb-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";


const  getTodos = async (client)=>{
    await client.connect();
    const result = {error_code: 0, message: ""};
    const queryCursor = await client.db("todoList").collection("todos").find();
    // console.log(queryResult);
    const queryResult = await queryCursor.toArray();
    await client.close();
    return queryResult;
    
}

const saveTodo = async (client,data) =>{
    await client.connect();
    const result = {error_code: 0, message:""};
    let queryResult;
    console.log(data);
    if(!data._id)
        queryResult = await client.db("todoList").collection("todos").insertOne({title:data.title,displayOrder:data.displayOrder,selected:data.selected});
    else
        queryResult = await client.db("todoList").collection("todos").updateOne( {_id:data._id}, data);    
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
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.setHeader('Access-Control-Max-Age', 2592000);
    
    if(req.url == "/"){
        resp = {error_code: 1, message : "Server is running. Please specify endpoint."}
    }else{
        console.log(req.url,req.method);
        client = new MongoClient(connectionString);
        switch(req.method){
            case "POST":
                switch(req.url){
                    case "/todo/save":
                        let body = '';

                        req.on('data', function (data) {
                            body += data;
                            if (body.length > 1e6)
                                req.connection.destroy();
                        });

                        req.on('end', function () {
                            console.log(body);
                            var post = JSON.parse(body);
                            console.log("post" , post);
                            saveTodo(client,post).catch(console.error());
                            resp = {error_code: 0, message : "todo successfully saved.", data:post};
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
    
    res.write(JSON.stringify(resp));
    res.end();
};

const server = http.createServer(serverCallback);

server.listen(port,()=>{console.log("Server is running on "+port);});
