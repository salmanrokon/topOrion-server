const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors');
const jwt=require('jsonwebtoken');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e0co39v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)
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

    const usersCollections = client.db('topOrion').collection('users');
    const salesCollections = client.db('topOrion').collection('sales');
    const postsCollections = client.db('topOrion').collection('posts');

    app.post('/jwt',async(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,'secret',{expiresIn:'1h'})
      res.send({token})
    })

    const verifyToken=(req,res,next) => {
      console.log('inside verifyToken',req.headers.authorization)
      if(!req.headers.authorization){
        return res.status(401).send({message:"Invalid authorization"})
      }
      const token=req.headers.authorization.split(' ')[1];

      // next();
    }
    app.get('/users',async(req,res)=>{
      const users = await usersCollections.find({}).toArray();
      res.send(users);
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollections.findOne(query);
      if (existingUser) {
        return res.status(400).send('User already exists');
      }
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });
    app.delete('/users/:id',async(req,res)=>{
      const id = req.params.id;
      const query={_id:new ObjectId(id)}
      const result = await usersCollections.deleteOne(query);
      res.send(result);
    })
    app.patch('/users/admin/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)}
      const updatedDoc={
        $set:{
          role:'admin'
        }
      }
      const result =await usersCollections.updateOne(filter,updatedDoc)
      res.send(result);
    })
    app.post('/sales', async (req, res) => {
      const sale = req.body;
      const result = await salesCollections.insertOne(sale);
      res.send(result);
    })
    app.get('/sales', async (req, res) => {
      const sales = await salesCollections.find({}).toArray();
      res.send(sales);
    })
    app.get('/posts',async(req, res) => {
      const posts = await postsCollections.find({}).toArray();
      res.send(posts);
    });
    app.post('/posts', async (req, res) => {
      const post = req.body;
      const result = await postsCollections.insertOne(post);
      res.send(result);
    })
    app.delete('/posts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id:new ObjectId(id) };
      const result = await postsCollections.deleteOne(query);
      res.send(result);
    });

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
  res.send('Hello Top Orion !')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})