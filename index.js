const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect mongodb

const uri = `mongodb+srv://${process.env.MOTEX_user}:${process.env.MOTEX_PASS}@cluster0.5rl0xtm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // brand db
        const db = client.db("brandName");
        const collection = db.collection("brandInfo");

        // car db
        const carDB = client.db("carName");
        const carCollection = carDB.collection("carInfo");

        // cart db
        const cartDB = client.db("cartDB");
        const cartItemsCollection = cartDB.collection("cartItems");


        // get brand info
        app.get("/brandInfo", async (req, res) => {
            const cursor = collection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // get car info
        app.get("/cars", async (req, res) => {
            const cursor = carCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/cars/:brandName", async (req, res) => {
            const brandName = req.params.brandName;
            const query = { brandName: brandName };
            const cursor = await carCollection.find(query).toArray();
            res.send(cursor);
        });

        app.get("/car/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const car = await carCollection.findOne(query);
            res.send(car);
        });

        // update information

        app.get("/updateInfo/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carCollection.findOne(query);
            res.send(result);
        });

        app.put("/updateCar/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateInfo = req.body;
            console.log(updateInfo);
            const carInfo = {
                $set: {
                    carName: updateInfo.carName,
                    brandName: updateInfo.brandName,
                    carImage: updateInfo.carImage,
                    price: updateInfo.price,
                    rating: updateInfo.rating,
                    details: updateInfo.details,
                    bodyTypes: updateInfo.bodyTypes,
                },
            };
            const result = await carCollection.updateOne(
                query,
                carInfo,
                options
            );
            res.send(result);
        });

        app.post("/cars", async (req, res) => {
            const cars = req.body;
            const result = await carCollection.insertOne(cars);
            res.send(result);
        });

        // cart data
       
        app.get('/cart', async (req, res) => {
            const cursor = cartItemsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post("/cart", async (req, res) => {
            const cart = req.body;
            const result = await cartItemsCollection.insertOne(cart);
            res.send(result);
        });

        // app.delete("/cart/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id : new ObjectId(id)};
        //     const result = await cartItemsCollection.deleteOne(query);
        //     res.send(result);
        //     console.log('cart items');
        // })

        app.delete("/cart/:id", async (req, res) => {
            const id = req.params.id;
            const query = {_id:id};
            const result = await cartItemsCollection.deleteOne(query);
            res.send(result); 
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
    console.log("server is running");
});
