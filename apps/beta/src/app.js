import express from "express";
import pg from "pg";
import Redis from "ioredis";
import pino from "pino";
import pinoHttp from "pino-http";
import config from "./config.js";
import { initDb } from "./db/migrations.js";
import { insertExecution, getExecutions, getStats } from "./db/queries.js";
import { generateCodeHash, executeCode } from "./utils/codeExecution.js";

const { Pool } = pg;

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

const redis = new Redis(config.redis);
const pool = new Pool(config.postgres);
const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

await initDb(pool, logger);

app.post("/execute", async (req, res) => {
  const client = await pool.connect();
  try {
    if (!req.body.code || typeof req.body.code !== "string") {
      return res.status(400).json({ error: "Invalid code" });
    }

    const codeHash = generateCodeHash(req.body.code);
    const cached = await redis.get(`code:${codeHash}`);

    if (cached) {
      return res.json({ result: JSON.parse(cached), cached: true });
    }

    const start = process.hrtime();
    let result, error;

    try {
      result = executeCode(req.body.code, req.log);
      await redis.set(`code:${codeHash}`, JSON.stringify(result), "EX", 3600);
    } catch (e) {
      error = e.message;
    }

    const [s, ns] = process.hrtime(start);
    const executionTime = Math.round(s * 1000 + ns / 1000000);

    await insertExecution(pool, {
      code: req.body.code,
      codeHash,
      result,
      executionTime,
      error,
    });

    if (error) throw new Error(error);
    res.json({ result, cached: false });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/executions", async (req, res) => {
  const { rows } = await getExecutions(pool);
  res.json({ executions: rows });
});

app.get("/stats", async (req, res) => {
  const { rows } = await getStats(pool);
  res.json({ stats: rows[0] });
});

app.get("/health", async (req, res) => {
  try {
    await Promise.all([redis.ping(), pool.query("SELECT 1")]);
    res.json({ status: "healthy" });
  } catch (error) {
    res.status(500).json({ status: "unhealthy" });
  }
});

app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port}`);
});
