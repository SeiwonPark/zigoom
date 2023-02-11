import * as express from "express";
import * as cors from "cors";
import * as http from "http";
import { Server, Socket } from "socket.io";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.on("error", (err) => {
  console.log(err);
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // client url
  },
});

io.on("connection", (socket: Socket) => {
  console.log("client connected: ", socket.id);
  socket.join("clock-room");
  socket.on("disconnect", (reason) => {
    console.log(reason);
  });
});

setInterval(() => {
  io.to("clock-room").emit("time", new Date());
}, 1000);

httpServer.listen(PORT, () => {
  console.log("Server running on Port ", PORT);
});
