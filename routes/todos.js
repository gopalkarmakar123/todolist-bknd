const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const  conn =require("../conn");
const { connectionString } = require('../conn');

router.post("/save",async (req,res) =>{
    const client = new MongoClient(conn.connectionString);
    await client.connect();
    const data = req.body;
    // console.log(req.body);
    const newTodo = {title:data.title,displayOrder:data.displayOrder,selected:data.selected}; 
    queryResult = await client.db("todoList").collection("todos").insertOne(newTodo);
    res.status(201).send({success:true,insertedData:newTodo});
    await client.close();
});
router.put("/changeOrder",async (req,res) =>{
    const arrengedTodos = req.body;
    console.log( "changeOrderd",arrengedTodos);
    // const updatedTodoValue = bd.map(({title, displayOrder, selected},idx) => {title:[title];displayOrder;[idx]+1;selected:[selected]});
    // console.log( "change value",updatedTodoValue);
    const result  = {error_code:0, message:""};
    if(!(typeof arrengedTodos === 'object' && Array.isArray(arrengedTodos) && arrengedTodos.length > 1)){
        result.error_code = 1;
        result.message = "Please send a collection of todos";
    }
    arrengedTodos.forEach(async (todo,idx) => {
        const client = new MongoClient(connectionString);
        await client.connect();
        await client.db("todoList").collection("todos").updateOne({_id: new ObjectId(todo._id)},{$set:{displayOrder:todo.displayOrder}});
        await client.close();
    });

    res.status(201).send({success:true});
});

router.put("/selectTodo", async (req,res) => {
    const data = req.body;
    const result = {error_code:0,message:""};
    if(!data._id)
    {
        result.error_code = 1;
        result.message = "Id is required!";
        return result;
    }
    const client = new MongoClient(connectionString);
    await client.connect();
    queryUpdateResult = await client.db("todoList").collection("todos").updateOne({_id: new ObjectId(data._id)},{$set:{selected:true}});
    if(!queryUpdateResult){
        result.error_code = 1;
        result.message = "Mongo Query failed!.";
        return result;
    }
    const queryCursor = await client.db("todoList").collection("todos").find({_id: new ObjectId(data._id)});
    const queryResult = await queryCursor.toArray();
    res.status(201).send({error_code:0,message:"hurray! "+ data.title + "has been marked as completed!", data: queryResult[0]});
    await client.close();
});

router.get('/',async (req,res) => {
    const client = new MongoClient(conn.connectionString);
    await client.connect();
    const queryCursor = await client.db("todoList").collection("todos").find().sort({displayOrder:1});
    const queryResult = await queryCursor.toArray();
    // console.log(queryResult);
    res.status(200).send({success:true,data:queryResult});
    await client.close();
});
module.exports = router;