export const initDb = async (pool, logger) => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS code_executions (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        code_hash VARCHAR(64) NOT NULL,
        result JSONB,
        execution_time INTEGER,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_code_hash ON code_executions(code_hash);
      CREATE INDEX IF NOT EXISTS idx_created_at ON code_executions(created_at);
    `);
  } finally {
    client.release();
  }
};
