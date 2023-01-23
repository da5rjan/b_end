import express from 'express';
//import cors from 'cors'
import connect from "./db.js"
import { ObjectId } from 'mongodb'

const app = express() // instanciranje aplikacije
const port = 3000 // port na kojem će web server slušati

app.use(express.json())

// json parser error catcher
app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send('Oglasnik invalid data sent')
  } else {
    next()
  }
})

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
        if ((!("naziv" in req.body)) ) {
                return res.status(400).send({"message": "field naziv missing"})
        }
        let naziv = req.body.naziv
         if   (naziv.length < 5) {
                return res.status(400).send({"message": "field naziv too short"})
        }
        if(!("opis" in req.body)) 
                {return res.status(400).send({"message": "field opis missing"})
        }
        let opis = req.body.opis
        if (opis.length < 16){
                return res.status(400).send({"message": "field opis too short"})
        }
         let novi={"naziv": req.body.naziv, "opis": req.body.opis}
        let kategorija = await db.collection("kategorije").insertOne(novi)
        res.json({"status": "ok"})
});

app.get('/kategorije/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        console.log("pitam za kategoriju" + id)
        try {
                let o_id = new ObjectId(id)
                let kategorija = await db.collection("kategorije").findOne({'_id': o_id})
                if (kategorija==null) {
                        return res.status(400).send({"message": "kategorija nije nadjena"})
                }
                res.json(kategorija)
        }
        catch (exception) {
                return res.status(400).send({"message": "kategorija nije nadjena"})
        }
});

app.put('/kategorije/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        if (!("naziv" in req.body)){
                return res.status(400).send({"message":"nema tog naziva "})
        }
        let naziv = req.body.naziv
        if (naziv.length < 5 ) {
                return res.status(400).send({"message":"naziv je prekratak"})
        }
        if (!("opis" in req.body) ) {
                return res.status(400).send({"message":" nema opisa "})
        }
        let opis = req.body.opis
        if(opis.length < 10){
                return res.status(400).send({"message":"opis   je prekratak"})
        }
        try {
                let o_id = new ObjectId(id)
                let update={"naziv": naziv, "opis": opis}
                let kategorija = await db.collection("kategorije").updateOne({'_id': o_id}, update)
                res.json({"status": "ok"})
        } catch (exception) {
                return res.status(400).send({"message": "kategorija nije promijenjena"})
        }
});

app.delete('/kategorije/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        try {  
                let id = req.params['id']
                let o_id = new ObjectId(id)
                let kategorija = await db.collection("kategorije").deleteOne({'_id': o_id})
                if (kategorija.deletedCount <1 ) {
                        return res.status(400).send({"message": "kategorija nije obrisana"})
                }
                        res.json({"status": "ok"})
        }
        catch(exception){
                return res.status(400).send({"message": " kategorija nije obrisana"})
        }
});

////////////////////////////////////////////////////////////////////////////
//      Oglasi
app.get('/oglasi', async (req, res) => {
        // trebamo dodati da se ekspandiraju podaci iz korisnika
        //
       try{
        let db = await connect() // pristup db objektu
        let cursor = await db.collection("oglasi").find()
        let results = await cursor.toArray()
        res.json(results)
       }
       catch(exception) {
        return res.status(400).send({"message": " baza nije dostupna"})
       }

});
app.get('/oglasi/:id', async (req, res) => {
      try{  let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let oglas = await db.collection("oglasi").findOne({'_id': o_id})
        if (oglas==null) {
                return res.status(400).send({"message": " oglas ne valja"})
        }
        console.log(oglas)
        res.json(oglas)
        }
        catch(exception){
                return res.status(400).send({"message": " oglas ne valja"})
        }

});

app.post('/oglasi',async(req,res) => {let db = await connect() // pristup db objektu
        if(!("naslov" in req.body)){

                return res.status(400).send({"message": "nema naslova"})
        }
        let naslov = req.body.naslov
        if(naslov.length< 5 ) {
                return res.status(400).send({"message":"naslov je prekartak"})
        }
       
        if(!("text"in req.body))
        {       
                return res.status(400).send({"message": "  text nepostoji"})
        }

        let text = req.body.text
        if(text.length< 10 ){
                return res.status(400).send({"message":" text je prekratak"})
        }
        if (!("cijena" in req.body)){
                return res.status(400).send({"message": " niste unijeli cijenu"})
        }
        let cijena = req.body.cijena 
        if(!("korisnik" in req.body))
        {
                return res.status(400).send({"message":"korisnik ne postoji"})

        }

        if(!("kategorija" in req.body))
        {
                return res.status(400).send({"message":"kategorija  ne postoji"})
        }
        try {   let kat_id = new ObjectId(req.body.kategorija)
                let katObj = await db.collection("kategorije").findOne({'_id': kat_id})
                if(katObj == null) {
                        return res.status(400).send({"message":"kategorija ne postoji"})
                }
                let k_id = new ObjectId(req.body.korisnik)
                let korisnikObject = await db.collection("korisnici").findOne({'_id': k_id})
                if(korisnikObject == null) {
                        return res.status(400).send({"message":"korisnik ne postoji"})
                }
         
                let novi={
                        "naslov":req.body.naslov, 
                        "text": req.body.text, 
                        "cijena": {
                                "$numberDecimal":req.body.cijena
                        },
                        "kategorija":req.body.kategorija, 
                        "korisnik":req.body.korisnik,
                        "ocijene":[]
                }
                let oglas = await db.collection("oglasi").insertOne(novi)
                res.json({"status": "ok"})
        } catch(exception) {
                console.log(exception)
                return res.status(400).send({"message":"nepravilan upit"})
        }
});

app.put('/oglasi/:id',async(req,res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        if(!("kategorija" in req.body))
        {
                return res.status(400).send({"message":"kategorija  ne postoji"})
        }
        if(!("naslov" in req.body)){
        return res.status(400).send({"message": " naslov ne postoji "})}
        if(!("text"in req.body))
        {       
                return res.status(400).send({"message": "  text nepostoji"})
        }

        let text = req.body.text
        if(text.length< 10 ){
                return res.status(400).send({"message":" text je prekratak"})
        }
        if (!("cijena" in req.body)){
                return res.status(400).send({"message": " niste unijeli cijenu"})
        }
        let cijena = req.body.cijena 
        if(!("korisnik" in req.body))
        {
                return res.status(400).send({"message":"korisnik ne postoji"})

        }
        if(!("ocijene" in req.body))
        {
                return res.status(400).send({"message":"ocjena ne postoji"})
        }
        let o_id = new ObjectId(id)
        let naslov = req.body.naslov

        if(naslov.length< 5 ) {
                return res.status(400).send({"message":"naslov je prekartak"})
        }                      
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

        

app.delete('/oglasi/:id', async (req, res) => {
       let db = await connect() // pristup db objektu
       try{ 
        let id = req.params['id']
        let o_id = new ObjectId(id)
        let oglas = await db.collection("oglasi").deleteOne({'_id': o_id}) 
        if (oglas.deletedCount <1 ) {
                return res.status(400).send({"message": "oglas 1 nije obrisan"})
        }
        res.json({"status": "ok"})
        }
        catch(exception){
                console.log(exception)
                return res.status(400).send({"message": " oglas 2 nije obrisan"})
        }
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
        try{  
                let id = req.params['id']
                let o_id = new ObjectId(id)
                let korisnik = await db.collection("korisnici").findOne({'_id': o_id})
                if (korisnik == null) {
                        return res.status(400).send({"message": "korisnik ne postoji"})
                }
                res.json(korisnik)
        } catch (exception) {
                return res.status(400).send({"message": "neispravan upit"})
        }
});

app.post('/korisnici',async(req,res) => {let db = await connect() // pristup db objektu
        // treba provjeriti sve podatke iz req.body (req.body.ime, ..) da li postoje i 
        // imaju li odgovarajuce vrijednosti
        if(!("ime" in req.body)){
                return  res.status(400).send({"message": " nepostoji to ime "})

        }
        if(!("prezime" in req.body)){
                return res.status(400).send({"message": "nema prezime"  })

     

        }
        if(!("kratki_opis"  in req.body)){
                return  res.status(400).send({"message": " nema opissa  "})

               
        }
        if(!("OIB"  in req.body)){
                return  res.status(400).send({"message": " nema OIB  "})
        }
        if(!("user_name"  in req.body)){
                return  res.status(400).send({"message": " nema user_name  "})
        }
        if(!("broj_mobitela" in req.body)){
                return  res.status(400).send({"message": " nema broja  "})
               

        } 
        if(!("grad"in req.body)){
                return res.status(400).send( {"message": "nema grada"})
        }      
        if(!("adresa" in req.body)){
                return  res.status(400).send({"message": " nema adrese   "})
        }
        if(!("e_mail"in req.body)){
                return  res.status(400).send({"message": " nema mail adrese    "})
        }
        if(!("vrsta" in req.body)) {
                return  res.status(400).send({"message": " nema vrste    "})
        }
   let novi= {
                "ime": req.body.ime, 
                "prezime": req.body.prezime, 
                "kratki_opis":req.body.kratki_opis,
                "OIB":req.body.OIB,
                "user_name":req.body.user_name,
                "broj_mobitela":req.body.broj_mobitela,
                "adresa":req.body.adresa, 
                "grad":req.body.grad,
                "e_mail":req.body.e_mail,
                "vrsta": req.body.vrsta   }; 


        try    { 
                let korisnik = await db.collection("korisnici").insertOne(novi)
                if(korisnik == null){
                        return res.status(400).send({"message": "korisnik nije dobar"})
                }
        }
        catch(exception)
                {
               return res.status(400).send({"message": "korisnik ne postoji"})
                }
           
        res.json({"status": "ok"})


});

app.put('/korisnici/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
        let id = req.params['id']
        let o_id
        try {
                 
                o_id = new ObjectId(id)}
        catch (exception) {
                console.log(exception)
                 return res.status(400).send({"message": "neispravan id korisnika"})
        }
     

        if(!("ime" in req.body)){
                return  res.status(400).send({"message": " nepostoji to ime "})

        }
        if(!("prezime" in req.body)){
                return res.status(400).send({"message": "nema prezime"  })

     

        }
        if(!("kratki_opis"  in req.body)){
                return  res.status(400).send({"message": " nema opissa  "})

               
        } 
        if(!("user_name"  in req.body)){
                return  res.status(400).send({"message": " nema user_name  "})
        }
        if(!("broj_mobitela" in req.body)){
                return  res.status(400).send({"message": " nema broja  "})
               

        } 
        if(!("grad"in req.body)){
                return res.status(400).send( {"message": "nema grada"})
        }      
        if(!("adresa" in req.body)){
                return  res.status(400).send({"message": " nema adrese   "})
        }
        if(!("e_mail"in req.body)){
                return  res.status(400).send({"message": " nema mail adrese    "})
        }
        if(!("vrsta" in req.body)) {
                return  res.status(400).send({"message": " nema vrste    "})
        }
         
       

     try{
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
                "e_mail":req.body.e_mail,
                "vrsta":req.body.vrsta  };
        let updated = await db.collection("korisnici").replaceOne({'_id': o_id}, update)
        res.json({"status": "ok"})
     }
        catch (exception) {
                return res.status(400).send({"message": "korisnik  nije promijenjen"})}
});


app.delete('/korisnici/:id', async (req, res) => {
        let db = await connect() // pristup db objektu
     try{ 

        let id = req.params['id']
        let o_id = new ObjectId(id)
        let oglas = await db.collection("oglasi").findOne({'korisnik': o_id})
         if(oglas != null ){
                        return res.status(400).send({"message":"korisnik nije obrisan jer ima oglas "})
         }
          
        let korisnik = await db.collection("korisnici").deleteOne({'_id': o_id})
     
       if (korisnik.deletedCount <1 ) {
               return res.status(400).send({"message": "oglas 1 nije obrisan"})}
      res.json(korisnik)
        
       }

        catch(exception){
                console.log(exception)
                return res.status(400).send({"message": " korisnik    nije obrisan"})
        }
        




});

      

app.listen(port, () => console.log(`Slušam na portu ${port}!`))