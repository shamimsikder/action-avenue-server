const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express =  require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {

    res.send('Action Avenue is Running')

})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5yg7cj.mongodb.net/?retryWrites=true&w=majority`;

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
    //await client.connect();

    const toysCollection = client.db('actionAvenue').collection('toys')

    app.get('/all-toys', async(req, res) => {

      const cursor = toysCollection.find()
      const result = await cursor.toArray()
      res.send(result)
      console.log(result)

    })

    app.get('/toy/:id', async(req, res) => {

      const id = req.params.id
      const query = {_id: new ObjectId(id)}

      const result = await toysCollection.findOne(query)
      res.send(result)

    })

    app.get("/myToys/:email", async (req, res) => {
      
      const email = req.params.email;
      const toys = await toysCollection.find({ sellerEmail: email }).toArray();
      res.send(toys);
    
    });

    app.post('/all-toys', async (req, res) => {
      const toys = req.body;
      console.log(toys);
      const result = await toysCollection.insertOne(toys);
      res.send(result);
    });

    app.patch("/myToys/:id", async (req, res) => {
        const id = req.params.id;
        const body = req.body;
        console.log(body);
        const filter = { _id: new ObjectId(id) }; 
        const updateDoc = {
          $set: {
            price: body.price,
            quantity: body.quantity,
            description: body.description,
          },
        };

        const result = await toysCollection.updateOne(filter, updateDoc);
        res.send(result);
    });


    

    app.delete('/myToys/:id', async(req, res) => {

      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.deleteOne(query)

      res.send(result)

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Action Avenue Server is Running on Port: ${port}`)
})
