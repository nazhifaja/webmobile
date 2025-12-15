import express from "express";
import fasumRoutes from "../routes/fasumRoutes.js";
import userRoutes from "../routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/api/fasum", fasumRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

export default app;
