const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const IndexRoute = require("./Routers/index");
const connectDatabase = require("./Helpers/database/connectDatabase");
const customErrorHandler = require("./Middlewares/Errors/customErrorHandler");
const listenToChangeStreams = require("./changeStreams");

dotenv.config({
    path: './Config/config.env'
});

connectDatabase();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cors());

app.use("/", IndexRoute);

app.use(customErrorHandler);

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', (socket) => {
    console.log('A user connected via WebSocket.');

    socket.on('disconnect', () => {
        console.log('User disconnected.');
    });
});

listenToChangeStreams(io);

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} : ${process.env.NODE_ENV}`);
});

process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: ${err}`);
    server.close(() => process.exit(1));
});
