import * as express from "express";
import * as cors from "cors";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.on("error", (err) => {
  console.log(err);
});

app
  .get("/", (req: express.Request, res: express.Response) => {
    res.send({ title: "GET Request", content: "Test" });
  })
  .post("/", (req, res) => {
    res.send(req.body);
  });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
