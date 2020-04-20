var MongoClient = require('mongodb').MongoClient;

const mongourl = 'mongodb://localhost:27017';
const dbName = "chatapp";

var get_session_store = function(session){
    const MongoStore = require('connect-mongo')(session);

    var MongoSessionStore = new MongoStore({ url: mongourl+"/"+dbName,
                                ttl: 24 * 60 * 60 // Keeps session open for 1 day 
                            });
    return MongoSessionStore;
}

//options: method, coll, data, sort, order, limit
var execute = function(options, callback){

    // Connect to the db
    MongoClient.connect(mongourl, function (err, client) {

        const dbo = client.db(dbName);
    
        if (err) return console.log(err);

        if(options.method === "insert"){

            dbo.collection(options.coll, function (err, collection) {
                
                collection.insert(options.data);
                //collection.insert({ id: 2, firstName: 'Bill', lastName: 'Gates' });

                dbo.collection(options.coll).countDocuments(function (err, count) {
                    if (err) throw err;
                    
                    console.log('Total Rows: ' + count);
                });
            });
        } else if(options.method === "find") {

            var query = dbo.collection(options.coll).find(options.data);//.sort({"time":-1}).limit(10)

            //console.log(query);

            if(options.sort){
                var order = options.order;
                var sort = options.sort;
                
                var sortby ={};
                sortby[sort] = order;
                query = query.sort(sortby);
            }

            if(options.limit){
                query = query.limit(parseInt(options.limit));
            }
            
            query.toArray(function(err, result) {
                    if (err) throw err;
    
                    //console.log(result);
                    client.close();
                    callback(result);
                  });
            

        } else if(options.method === "update") {
            dbo.collection(options.coll).update(options.query,
                {$set : options.data},
                {upsert: options.upsert},
                function(err, obj) {
                    if (err) throw err;
                    console.log("Document updated");
                });
        } else if(options.method === "delete") {
            dbo.collection(options.coll).deleteOne(options.data, function(err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
            });
        }

        client.close();
                    
    });
}

module.exports = {execute, get_session_store};