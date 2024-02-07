import express from "express";
import { startEventLoop } from "./receiveEvent";

const app = express();
const port = 3001;

startEventLoop();

app.get("/", (req, res) => {
  res.send("Hello Worl!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
