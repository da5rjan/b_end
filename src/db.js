import { MongoClient } from "mongodb";
// zamijeni sa svojim connection stringom
let connection_string = "mongodb+srv://dadmin:00HC15uu@cluster0.xzs5xto.mongodb.net/?retryWrites=true&w=majority";
let client = new MongoClient(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


let db = null
// eksportamo Promise koji resolva na konekciju
export default () => {
    return new Promise((resolve, reject) => {
        // ako smo inicijalizirali bazu i klijent je još uvijek spojen
        if (db && client.isConnected) {
            resolve(db)
        }
        else {
            client.connect(err => {
                if (err) {
                    reject("Spajanje na bazu nije uspjelo:" + err);
                }
                else {
                    console.log("Database connected successfully!");
                    db = client.db("oglasnik");
                    resolve(db);
                }
            });
        }
    });
}



client.connect(err => {
    if (err) {
        console.error(err);
    return;
    }
    console.log("Database connected successfully!");
    // za sada ništa nećemo raditi, samo zatvaramo pristup sljedećom naredbom
    client.close();
});
