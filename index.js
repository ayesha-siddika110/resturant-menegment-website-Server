const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 3000

app.use(cors({
  origin: ['http://localhost:5173', 'https://resturant-website-eada4.firebaseapp.com/', 'https://resturant-website-eada4.web.app/', 'https://resturant-menegment-website-110.netlify.app'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// const Varifytoken = (req,res,next) =>{
//   const token = req?.cookies?.token;
//   console.log('token:',token)
//   if(!token){
//     return res.status(401).send({message: 'unauthorized access'})

//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET , (err, decoded)=>{
//     if(err){
//       return res.status(401).send({message: 'unauthorized access'})
//     }
//     req.user = decoded
//     next();
//   })

// }



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
//testing
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("restaurant_DB");
    const foodsCollections = database.collection("restaurant_DB");
    const foodsPurchaseCollections = database.collection("Purchase_DB");


    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5h'
      })

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

        })
        .send({ success: true })
    })
    ///remove jwt token
    app.post('/logout', (req, res) => {
      res
        .clearCookie('token', {
          httpOnly: true,
          secure: true
        })
        .send({ success: true })
    })


    app.get('/foods', async (req, res) => {

      const emaill = req.query.email;
      const search = req.query.search || '';
      // console.log(search);

      let query = {
        foodName: {
          $regex: String(search),
          $options: 'i'
        }
      };
      if (emaill) {
        query = { email: emaill }
      }
      const cursor = foodsCollections.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodsCollections.findOne(query);
      res.send(result)
    })

    app.post('/foods', async (req, res) => {
      const newfood = req.body;
      const result = await foodsCollections.insertOne(newfood)
      res.send(result)

    })

    app.get('/purchaseFood', async (req, res) => {
      const email = req.query.email;
      //
      const foodId = req.query.food_id
      let query = {};
      if (email) {
        query = { buyerEmail: email }
      }
      if(foodId){
        query = {food_id: foodId}
      }

      const cursor = foodsPurchaseCollections.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/purchaseFood/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) }
      const result = await foodsPurchaseCollections.findOne(query)
      res.send(result)
    })

    // app.get('/purchaseFood', async (req, res) => {
    //   const { _id, food_id } = req.query;
    //   console.log(_id)
    //   console.log(food_id)
    //   // const query = {food_id : id};
    //   if (_id) {
    //     const query = { _id: new ObjectId(_id) }
    //     const result = await foodsPurchaseCollections.findOne(query)
    //     return res.send(result)

    //   }
    //   if(food_id){
    //     const query = {food_id : food_id}
    //     const cursor = foodsPurchaseCollections.find(query)
    //     const result = await cursor.toArray()
    //     return res.send(result)
    //   }
    // })

    app.post('/purchaseFood', async (req, res) => {
      const newPurchase = req.body;
      const result = await foodsPurchaseCollections.insertOne(newPurchase)


      const filter = {_id: new ObjectId(newPurchase.food_id)}
      const update = {
        $inc : {purchase_count: 1}
      }
      const updatePurchaseCount = await foodsCollections.updateOne(filter, update)
      res.send(result)
    })

    // Update a document
    app.patch('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateData = {
        $set: req.body
      };
      const result = await foodsCollections.updateOne(filter, updateData, options)
      res.send(result)
    })

    // delete a document

    app.delete('/purchaseFood/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodsPurchaseCollections.deleteOne(query)
      res.send(result)
    })








    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('resturant server is running')
})
app.listen(port, () => {
  console.log('server is running');

})