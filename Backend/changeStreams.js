const { MongoClient } = require('mongodb');

async function listenToChangeStreams(io) {
    const uri = "mongodb+srv://ahmeddiaaeldin82:50Cmdlvag9XUkYul@cluster0.seivwpm.mongodb.net/test3";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Connected to MongoDB for Change Streams");

        const database = client.db("test3");
        const collection = database.collection("markers");

        const changeStream = collection.watch();

        changeStream.on("change", async () => {
            try {
                const markers = await collection.find({}).toArray();
                const categoryUpdate = {
                    apple: false,
                    banana: false,
                    orange: false
                };

                markers.forEach(marker => {
                    if (marker.upperHalf) {
                        if (marker.num === 1) {
                            categoryUpdate.apple = true;
                        } else if (marker.num === 2) {
                            categoryUpdate.banana = true;
                        } else if (marker.num === 3) {
                            categoryUpdate.orange = true;
                        }
                    }
                });

                io.emit("categoryUpdate", categoryUpdate);
            } catch (err) {
                console.error('Error processing change stream event:', err);
            }
        });
    } catch (e) {
        console.error("Error connecting to MongoDB Change Streams", e);
    }
}

module.exports = listenToChangeStreams;
