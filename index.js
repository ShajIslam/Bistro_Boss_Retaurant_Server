const express = require("express");
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 8001;

// middleware

app.use(express.json());
app.use(cors());

//middleware
const verifyToken = (req, res, next)=>{
  console.log('inside verify token', req.headers);

  if(!req.headers.authorization){
   return res.status(401).send({message: 'forbidden access'})
  }

  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
   if(err){
     return res.status(401).send({message: 'forbidden access'})
   }
   req.decoded = decoded;
   next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1vqmal2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnect = async () => {
  try {
      client.connect()
      console.log('DB Connected Successfully✅')
  } catch (error) {
      console.log(error.name, error.message)
  }
}
dbConnect();

    const foodCollection = client.db('bistroBossDb').collection('menu');
    const reviewsCollection = client.db('bistroBossDb').collection('reviews');
    const cartCollection = client.db('bistroBossDb').collection('myCart');
    const usersCollection = client.db('bistroBossDb').collection('users')

    //default route
    app.get('/', (req, res)=>{
      res.send("Server Running Successfully...");
  })

    app.post('/users', async(req, res)=>{
      const user = req.body;
      const insert = await usersCollection.insertOne(user);
      res.send(insert);
    })

    app.get('/menu', async(req, res)=>{

        const result = await foodCollection.find().toArray();
        res.send(result)
    })
    app.get('/reviews', async(req, res)=>{
        const result = await reviewsCollection.find().toArray();
        res.send(result)
    })

    app.post('/myCart', async(req, res)=>{
        const cartItem = req.body;
        const insert = await cartCollection.insertOne(cartItem);
        res.send(insert);
    })

    app.get('/carts', async(req, res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
      })

      app.get('/users', async(req, res)=>{
        console.log(req.headers);
        const result = await usersCollection.find().toArray();
        res.send(result);
      })


      app.delete('/carts/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await cartCollection.deleteOne(query);
        res.send(result);
      })

      app.delete('/users/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await usersCollection.deleteOne(query);
        res.send(result);
      })

      //jwt related api

      app.post('/jwt', async(req, res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'});
        res.send({token})

      })
      app.patch('/users/admin/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updatedDoc = {
          $set:{
            role: 'admin'
          }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc)
        res.send(result);
      })

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})

//this line is for numberic alue
//running this sentece successfully 
//it is the fascination about those things which is allright for sur
