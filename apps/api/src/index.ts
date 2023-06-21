import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.on("error", (err: any) => {
  console.log(err);
});

app.get("/", (req: express.Request, res: express.Response) => {
  res.send({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}...`);
});
