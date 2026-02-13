import express from "express";
import chatHandler from "./api/chat.js";

const app = express();
app.use(express.json());

app.post("/api/chat", chatHandler); 

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
