import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerk } from "./middleware/auth";
import { createSchema } from "./db/schema";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import farmsRouter from "./routes/farms";
import diseasesRouter from "./routes/diseases";
import permitsRouter from "./routes/permits";
import analyticsRouter from "./routes/analytics";
import mapRouter from "./routes/map";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);

app.use(clerk);

app.use("/api/users", usersRouter);
app.use("/api/farms", farmsRouter);
app.use("/api/diseases", diseasesRouter);
app.use("/api/permits", permitsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/map", mapRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

async function start() {
  await createSchema();
  app.listen(PORT, () => console.log(`SwineTrack API running on port ${PORT}`));
}

start().catch(console.error);
