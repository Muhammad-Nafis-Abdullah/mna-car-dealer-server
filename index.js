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

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Can't Authorize The Access");
    }
    next();
}

// ------------------------------------------------




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@my-project.owhux.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('mnaCarDealer').collection('inventory');


        // jwt api
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "7d",
            });
            res.send({ accessToken });
        });

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

        // delete specific inventory by id
        app.delete("/inventory/:id", async (req, res) => {
            const inventoryId = req.params.id;
            const query = { _id: ObjectId(inventoryId) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });

        // update specific item quantity
        app.put("/inventory/:id", async (req, res) => {
            const inventoryId = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(inventoryId) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: JSON.stringify(updatedQuantity.quantity),
                },
            };
            const result = await inventoryCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        });

        // add new inventory in database
        app.post("/inventory", async (req, res) => {
            const newInventory = req.body;
            const result = await inventoryCollection.insertOne(newInventory);
            res.send(result);
        });

        // items added by individual user
        app.get("/myItems",  async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = inventoryCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);
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