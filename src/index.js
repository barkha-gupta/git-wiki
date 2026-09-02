import express from "express";
import "dotenv/config";

const app = express();

app.get("/", (req, res) => {
  res.send("server setup");
});

app.listen(3002, () => {
  console.log("yo, the server is set up");
});
