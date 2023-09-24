import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from "jsonwebtoken"
import connect from "./db.js"
import { ObjectId } from 'mongodb'
import bodyParser from 'body-parser'
import {UserModel, CategoryModel, AdModel} from './model'
import bcrypt from 'bcrypt'
import { normalizeStyle } from 'vue'
const app = express() // instanciranje aplikacije
const port = 3000 // port na kojem će web server slušati

app.use(express.json())
app.use(cors())

// json parser error catcher
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send('Oglasnik invalid data sent')
  } else {
    next()
  }
})

const mongoString = "mongodb+srv://dadmin:00HC15uu@cluster0.xzs5xto.mongodb.net/oglasnik2?retryWrites=true&w=majority";
const accessTokenSecret = "runtime-core.esm-bundler.js:40 [Vue warn]: Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected');
})

function checkToken(req, res, next) {
        const authHeader = req.headers.authorization;
        console.log("checkToken", authHeader)
        if (authHeader) {
            const token = authHeader.split(' ')[1];
      
            jwt.verify(token, accessTokenSecret, (err, user) => {
                if (err) {
                    return res.sendStatus(403).json({error: 'Unauthorized'});
                }
                req._authentificated_user = user;
                return next();
            });
        } else {
            return res.sendStatus(401).json({error: 'Unauthorized'});
}}
      

async function hashPassword(plaintextPassword) {
        const hash = await bcrypt.hash(plaintextPassword, 10);
        return hash
}

async function comparePassword(plaintextPassword, hash) {
        const result = await bcrypt.compare(plaintextPassword, hash);
        return result;
}
            
//////////////////////////////////////////
app.post('/category', checkToken, async (req, res) => {
        console.log("category", req._authenticated_user)
        if (req._authentificated_user.role !== "admin") {
                return res.status(401).json({message: "Admin is required"})
        }
        try{
                const category = new CategoryModel(
                        req.body
                );
                await category.save();
                res.status(201).json(category)
        }
        catch(error){
                console.log("new category error)")
                console.log(req)
                res.status(500).json({message: error.message, body: req.body})
        }
})

app.put('/category/:id', checkToken, async (req, res) => {
        if (req._authentificated_user.role !== "admin") {
                return res.status(401).json({message: "Admin is required"})
        }
        try{
                let id = req.params['id']
                const objectId = new mongoose.Types.ObjectId(id) 
                let query = {"_id": objectId}
                const data = await CategoryModel.findOneAndUpdate(
                        query, 
                        req.body, 
                        { returnOriginal: false}
                      )
                      if (data) {
                        return res.json(data)  
                      }  
                      return res.status(404).json({message: "no such category"})
        }
        catch(exception) {
                console.log(exception)
         return res.status(400).send({"message": " baza nije dostupna"})
        }
});


app.get('/category', async (req, res) => {
        try{
                //await sleep(5000)
                const data = await CategoryModel.find()
                  .sort([['order', -1]])
                ;
                res.json(data)
        }
        catch(error){
                console.log("get all categories error)")
                console.log(error)
                res.status(500).json({message: error.message})
        }
});

app.get('/category/:id', async (req, res) => {
        let id = req.params['id']
        try{
                const objectId = new mongoose.Types.ObjectId(id)     
                const data = await CategoryModel.findOne({_id: objectId})
                res.json(data)
        }
        catch(error){
                console.log("get all categories error)")
                console.log(error)
                res.status(500).json({message: error.message})
        }
});

//////////////////////////////////////////
app.post('/user', async (req, res) => {
        try{
        const user = new UserModel(
                req.body
        );
        console.log(user)
        console.log(req.body)
        user.password = await hashPassword(user.password);
        user.role = "user";
        await user.save();
                res.status(201).json(user)
        }
        catch(error){
                console.log("new user error)", error.message)
                //console.log(req)
                res.status(500).json({message: error.message, body: req.body})
        }
})

app.put('/user/:id', async (req, res) => {
        try{
                let id = req.params['id']
                const objectId = new mongoose.Types.ObjectId(id) 
                let query = {_id: objectId}
                if (req._authentificated_user.role !== "admin") {
                        const creatorId = new mongoose.Types.ObjectId(req._authentificated_user.userId)
                        query = {_id: objectId, _id: creatorId}
                }
                const data = await UserModel.findOneAndUpdate(
                        query, 
                        req.body, 
                        { returnOriginal: false}
                      )
                if (data) {
                        return res.json(data)  
                }  
                return res.status(404).json({message: "no such user"})
        }
        catch(exception) {
                console.log(exception)
         return res.status(400).send({"message": " baza nije dostupna"})
        }
})

app.post('/user/login', async (req, res) => {
        try{
          const data = await UserModel.findOne({userName: req.body.userName});
          console.log("login attempt")
          //await sleep(5000)
          console.log(req.body)
          console.log(data)
          if (data === null) {
            return res.status(401).json({message: "1 invalid username/password", body: req.body})
          } 
          const authentificated = await comparePassword(req.body.password, data.password)
          if ( !authentificated) {
            return res.status(401).json({message: "2 invalid username/password", body: req.body})
          }
            const rawToken = {
              "userId": (data._id).toString(), 
              "userName": req.body.userName,
              "role": data.role
            }
            console.log("raw token")
            console.log(rawToken)
            const token = jwt.sign(rawToken , accessTokenSecret)
            const returnUser = {
              "token": token, 
              "userName" : data.userName, 
              "userId": (data._id).toString(),
              "role": data.role
            }
            return res.status(200).json(returnUser)
        }
        catch(error){
            console.log("new user error)")
            console.log(error)
            res.status(500).json({action: "new user", message: error.message, body: req.body})
        }
      })

//////////////////////////////////////////

app.get('/ad/category/:kategorijaId', async (req, res) => {
       try{
                let kategorijaId = req.params['kategorijaId']
                const objectId = new mongoose.Types.ObjectId(kategorijaId)     
                const data = await AdModel.find({category: objectId})
                res.json(data)
       }
       catch(exception) {
        return res.status(400).json({"message": exception})
       }

});

app.get('/ad/:id', async (req, res) => {
        try{
                 let id = req.params['id']
                 const objectId = new mongoose.Types.ObjectId(id)     
                 const data = await AdModel.findOne({_id: objectId})
                        .populate('creator')
                 res.json(data)
        }
        catch(exception) {
         return res.status(400).json({"message": exception})
        }
 
 });
 
app.post('/ad', checkToken, async (req, res) => {
        try{
                req.body.creator = new mongoose.Types.ObjectId(req._authentificated_user.userId)
                req.body.category = new mongoose.Types.ObjectId(req.body.kategorijaId)
                const ad = new AdModel(
                  req.body
                );
                console.log(ad)
                await ad.save();
                res.status(201).json(ad)
                    }
        catch(exception) {
                console.log(exception)
         return res.status(400).send({"message": " baza nije dostupna"})
        }
 
 });

 app.put('/ad/:id', checkToken, async (req, res) => {
        try{
                let id = req.params['id']
                const objectId = new mongoose.Types.ObjectId(id) 
                let query = {"_id": objectId}
                if (req._authentificated_user.role !== "admin") {
                        const creatorId = new mongoose.Types.ObjectId(req._authentificated_user.userId)
                        query = {_id: objectId, creator: creatorId}
                }
                const data = await AdModel.findOneAndUpdate(
                        query, 
                        req.body, 
                        { returnOriginal: false}
                )
                if (data) {
                        return res.json(data)  
                }  
                return res.status(404).json({message: "no such ad"})
        }
        catch(exception) {
                console.log(exception)
         return res.status(400).send({"message": " baza nije dostupna"})
        }
 });
 
 app.delete('/ad/:id', checkToken, async (req, res) => {
        try{
                let id = req.params['id']
                const objectId = new mongoose.Types.ObjectId(id) 
                let query = {_id: objectId}    
                if (req._authentificated_user.role !== "admin") {
                        const creatorId = new mongoose.Types.ObjectId(req._authentificated_user.userId)
                        query = {_id: objectId, creator: creatorId}
                }
                const data = await AdModel.deleteOne(query);
                if (data.deletedCount !== 1) {
                  return res.status(404).json({message: "no such ad"})
                }
                res.json(data)
                                }
        catch(exception) {
                console.log(exception)
         return res.status(400).send({"message": " delete ad error"})
        }
 });
      

app.listen(port, () => console.log(`Slušam na portu ${port}!`))