require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();


// middleware
app.use(express.json());
app.use(cors());


// ------------------------------------------------




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@my-project.owhux.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('mnaCarDealer').collection('inventory');

        // get all inventory
        app.get("/inventories", async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventories = await cursor.toArray();
            res.send(inventories);
        });

        // get specific inventory by id
        app.get("/inventory/:id", async (req, res) => {
            const inventoryId = req.params.id;
            const query = { _id: ObjectId(inventoryId) };
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
        });

        // delete specific inventory by
        app.delete("/inventory/:id", async (req, res) => {
            const inventoryId = req.params.id;
            const query = { _id: ObjectId(inventoryId) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });

        // update item quantity
        app.put("/inventory/:id", async (req, res) => {
            const inventoryId = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(inventoryId) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.quantity,
                },
            };
            const result = await inventoryCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        });


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






// ------------------------------------------------

app.get('/',(req,res)=> {
    res.send('server is working');
})


// listening the server at the given port
app.listen(port,()=> {
    console.log(`working on port : ${port}`);
})