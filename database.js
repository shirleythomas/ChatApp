var MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = "chatapp";


var execute = function(method, data, callback){

    // Connect to the db
    MongoClient.connect(url, function (err, client) {

        const dbo = client.db(dbName);
    
        if (err) return console.log(err);

        if(method === "insert"){

            dbo.collection('users', function (err, collection) {
                console.log(data)
                
                collection.insertOne(data);
                //collection.insert({ id: 2, firstName: 'Bill', lastName: 'Gates' });

                dbo.collection('users').countDocuments(function (err, count) {
                    if (err) throw err;
                    
                    console.log('Total Rows: ' + count);
                });
            });
        } else if(method === "find") {
            dbo.collection("users").find(data).toArray(function(err, result) {
                if (err) throw err;
                //console.log(result[0]);

                client.close();
                callback(result[0]);
              });

        } else if(method === "delete") {
            dbo.collection("customers").deleteOne(data, function(err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
            });
        }

        client.close();
                    
    });
}

module.exports = execute;