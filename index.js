const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

console.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wp3p5wr.mongodb.net/?retryWrites=true&w=majority`;

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

    const toyCollection = client.db('toyUser').collection('addToy')

    //all Toy
    app.get("/allToy", async(req, res) =>{
      const cursor = toyCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    //category
    app.get("/allToys/:text", async(req, res) =>{
      console.log(req.params.text)
      if(req.params.text == "marvel" || req.params.text == "avengers" || req.params.text == "star wars"){
        const result = await toyCollection.find({subcategory: req.params.text}).toArray()
        res.send(result)
        return
      }
      const result = await toyCollection.find({}).toArray()
      res.send(result)
    })

    //my toy
    app.get("/addToy", async(req, res) =>{
      console.log(req.query.email)
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await toyCollection.find(query).toArray()
      res.send(result)
    })

    //for update
    app.get("/addToy/:id", async(req, res) =>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
    })

    //database
    app.post('/addToy', async(req, res) =>{
      const newToy = req.body
      console.log(newToy)
      const result = await toyCollection.insertOne(newToy)
      res.send(result)
    })

    //update
    app.put("/addToy/:id", async(req, res) =>{
      const id = req.params.id 
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedToy = req.body
      const toy = {
        $set:{
          name: updatedToy.name, 
          photo: updatedToy.photo, 
          seller: updatedToy.seller, 
          email: updatedToy.email, 
          subcategory: updatedToy.subcategory, 
          price: updatedToy.price, 
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          description: updatedToy.description
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options)
      res.send(result)
    })

    //delete
    app.delete("/addToy/:id", async(req, res) =>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query)
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


app.get('/', (req, res) => {
  res.send('Toy is running')
})

app.listen(port, () => {
  console.log(`Toy is running on port ${port}`)
})