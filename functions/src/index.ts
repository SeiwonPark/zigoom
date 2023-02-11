import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.on("error", (err) => {
  console.log(err);
});

app.get("/test", (req: express.Request, res: express.Response) => {
  res.send({ title: "GET Request", content: "Test" });
});

export const api = functions.region("asia-northeast3").https.onRequest(app);
