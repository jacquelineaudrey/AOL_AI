import express from "express";
import cors from "cors";
import chatRouter from "./router/chatRouter";
import statsRouter from "./router/statsRouter";
import { errorHandler } from "./controller/errorController";
const app = express();

// Enable fetching from localhost
app.use(cors());

// Middle to parse body request
app.use(express.json());

app.use("/chat", chatRouter);
app.use("/statistics", statsRouter);
app.use(errorHandler);

export default app;
