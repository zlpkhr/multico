export const insertExecution = async (
  pool,
  { code, codeHash, result, executionTime, error },
) => {
  return pool.query(
    `INSERT INTO code_executions (code, code_hash, result, execution_time, error) 
     VALUES ($1, $2, $3, $4, $5)`,
    [
      code,
      codeHash,
      error ? null : JSON.stringify(result),
      executionTime,
      error,
    ],
  );
};

export const getExecutions = async (pool) => {
  return pool.query(`
    SELECT * FROM code_executions 
    ORDER BY created_at DESC 
    LIMIT 100
  `);
};

export const getStats = async (pool) => {
  return pool.query(`
    SELECT 
      COUNT(*) as total_executions,
      AVG(execution_time) as avg_execution_time,
      MIN(execution_time) as min_execution_time,
      MAX(execution_time) as max_execution_time,
      COUNT(CASE WHEN error IS NOT NULL THEN 1 END) as error_count
    FROM code_executions
    WHERE created_at > NOW() - INTERVAL '24 HOURS'
  `);
};
