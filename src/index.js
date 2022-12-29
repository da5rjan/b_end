import express from 'express';
//import cors from 'cors'
import connect from "./db.js"
import { ObjectId } from 'mongodb'

const app = express() // instanciranje aplikacije
const port = 3000 // port na kojem će web server slušati

app.use(express.json())

/////////////////////////////////////////////////////////////////////////////////////////
//      kategorije
app.get('/kategorije', async (req, res) => {
        let db = await connect() // pristup db objektu
        let cursor = await db.collection("kategorije").find()
        let results = await cursor.toArray()
        res.json(results)
});

app.post('/kategorije', async (req, res) => {
        let db = await connect() // pristup db objektu
        let novi={"naziv": req.body.naziv, "opis": req.body.opis}
        let kategorija = await db.collection("kategorije").insertOne(novi)
        res.json({"status": "ok"})
});

app.get('/kategorije/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        console.log("pitam za kategoriju" + id)
        let o_id = new ObjectId(id)
        let kategorija = await db.collection("kategorije").findOne({'_id': o_id})
        res.json(kategorija)
});

app.put('/kategorije/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let update={"_id": o_id, "naziv": req.body.naziv, "opis": req.body.opis}
        let kategorija = await db.collection("kategorije").replaceOne({'_id': o_id}, update)
        res.json({"status": "ok"})
});

app.delete('/kategorije/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let kategorija = await db.collection("kategorije").deleteOne({'_id': o_id})
        res.json({"status": "ok"})
});

////////////////////////////////////////////////////////////////////////////
//      Oglasi
app.get('/oglasi', async (req, res) => {
        // trebamo dodati da se ekspandiraju podaci iz korisnika
        //
        let db = await connect() // pristup db objektu
        let cursor = await db.collection("oglasi").find()
        let results = await cursor.toArray()
        res.json(results)
});
app.get('/oglasi/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let oglas = await db.collection("oglasi").findOne({'_id': o_id})
        res.json(oglas)
});

app.post('/oglasi',async(req,res) => {let db = await connect() // pristup db objektu
        let novi={
                "naslov":req.body.naslov, 
                "text": req.body.text, 
                "cijena": {
                        "$numberDecimal":req.body.kratki_cijena
                },
                "kategorija":req.body.kategorija, 
                "korisnik":req.body.korisnik,
                "ocijene":[]
        }
        let oglas = await db.collection("oglasi").insertOne(novi)
        res.json({"status": "ok"})
});

app.put('/oglasi/:id',async(req,res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let update={
                "_id": o_id,
                "naslov":req.body.naslov, 
                "text": req.body.text, 
    
                "cijena": {
                        "$numberDecimal":req.body.cijena
                },
                "kategorija":req.body.kategorija, 
                "korisnik":req.body.korisnik,
                "ocijene": req.body.ocijene
        }
        let kategorija = await db.collection("oglasi").replaceOne({'_id': o_id}, update)
        res.json({"status": "ok"})
});



////////////////////////////////////////////////////////////////////////////////////////
//      Korisnici
app.get('/korisnici', async (req, res) => {
        let db = await connect() // pristup db objektu
        let cursor = await db.collection("korisnici").find()
        let results = await cursor.toArray()
        res.json(results)
});

app.get('/korisnici/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let korisnik = await db.collection("korisnici").findOne({'_id': o_id})
        res.json(korisnik)
});

app.post('/korisnici',async(req,res) => {let db = await connect() // pristup db objektu
        // treba provjeriti sve podatke iz req.body (req.body.ime, ..) da li postoje i 
        // imaju li odgovarajuce vrijednosti
        let novi={
                "ime": req.body.ime, 
                "prezime": req.body.prezime, 
                "kratki_opis":req.body.kratki_opis,
                "OIB":req.body.OIB, 
                "user_name":req.body.user_name,
                "broj_mobitela":req.body.broj_mobitela,
                "adresa":req.body.adresa, 
                "grad":req.body.grad,
                "e_mail":req.body.e_mail
        };
        let korisnik = await db.collection("korisnici").insertOne(novi)
        res.json({"status": "ok"})
});

app.put('/korisnici/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        // provjeriti sva req.body polja koja koristimo,
        // vrattiti gresku ako ne valjaju
        let update = {
                "_id": o_id,
                "ime": req.body.ime, 
                "prezime": req.body.prezime, 
                "kratki_opis":req.body.kratki_opis,
                "OIB":req.body.OIB, 
                "user_name":req.body.user_name,
                "broj_mobitela":req.body.broj_mobitela,
                "adresa":req.body.adresa, 
                "grad":req.body.grad,
                "e_mail":req.body.e_mail
        };
        let updated = await db.collection("korisnici").replaceOne({'_id': o_id}, update)
        res.json({"status": "ok"})
});
app.delete('/korisnici/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let korisnik = await db.collection("korisnici").deleteOne({'_id': o_id})
        res.json(korisnik)
});



app.listen(port, () => console.log(`Slušam na portu ${port}!`))