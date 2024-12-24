const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_pass}@cluster0.331jm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("restaurant_DB");
    const foodsCollections = database.collection("restaurant_DB");
    const foodsPurchaseCollections = database.collection("Purchase_DB");


    app.get('/foods',async(req,res)=>{
        const cursor = foodsCollections.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    app.get('/foods/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await foodsCollections.findOne(query);
      res.send(result)
    })

    app.post('/foods',async (req,res)=>{
        const newfood = req.body;
        const result = await foodsCollections.insertOne(newfood)
        res.send(result)

    })

    app.get('/purchaseFood', async(req,res)=>{
      const cursor = foodsPurchaseCollections.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/purchaseFood', async(req,res)=>{
      const newPurchase = req.body;
      const result = await foodsPurchaseCollections.insertOne(newPurchase)
      res.send(result) 
    })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('resturant server is running')
})
app.listen(port, ()=>{
    console.log('server is running');
    
})