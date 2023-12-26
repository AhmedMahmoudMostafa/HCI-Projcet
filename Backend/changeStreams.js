const { MongoClient } = require('mongodb');

let lastLikeStoryState = false; // Track the last state of the like story
let lastNavigateHomeState = false;
let lastStateNum4 = false; // Track the last state for num = 4
let lastStateNum5 = false; // Track the last state for num = 5

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

                let navigateToStory = false;
                let likeStory = false;
                let navigateHome = false;

                markers.forEach(marker => {
                    if (marker.upperHalf) {
                        if (marker.num === 1) {
                            categoryUpdate.apple = true;
                        } else if (marker.num === 2) {
                            categoryUpdate.banana = true;
                        } else if (marker.num === 3) {
                            categoryUpdate.orange = true;
                        } else if (marker.num === 6) {
                            navigateToStory = true;
                        } else if (marker.num === 7) {
                            likeStory = true;
                        } else if (marker.num === 8) {
                            navigateHome = true;
                        }
                    }

                    if (marker.num === 4) {
                        if (marker.upperHalf && !lastStateNum4) {
                            io.emit("counterUpdate", 1); // Increment counter
                            lastStateNum4 = true;
                        }
                        if (!marker.upperHalf) {
                            lastStateNum4 = false;
                        }
                    }
    
                    if (marker.num === 5) {
                        if (marker.upperHalf && !lastStateNum5) {
                            io.emit("counterUpdate", -1); // Decrement counter
                            lastStateNum5 = true;
                        }
                        if (!marker.upperHalf) {
                            lastStateNum5 = false;
                        }
                    }
                });

                io.emit("categoryUpdate", categoryUpdate);

                if (navigateToStory) {
                    io.emit("navigateToStory");
                }

                if (likeStory && !lastLikeStoryState) {
                    io.emit("likeStoryUpdate");
                }
                lastLikeStoryState = likeStory;

                if (navigateHome && !lastNavigateHomeState) {
                    io.emit("navigateHome");
                }
                lastNavigateHomeState = navigateHome;

            } catch (err) {
                console.error('Error processing change stream event:', err);
            }
        });
    } catch (e) {
        console.error("Error connecting to MongoDB Change Streams", e);
    }
}

module.exports = listenToChangeStreams;
