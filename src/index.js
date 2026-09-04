import express from "express";
import "dotenv/config";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

const app = express();
app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (req, res) => {
  res.send("server setup");
});

app.listen(3002, () => {
  console.log("yo, the server is set up");
});
