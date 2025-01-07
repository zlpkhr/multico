import "./app.scss";
import "bootstrap";
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

function CodeExecutor() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState([]);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);

  // Separate data fetching function
  const fetchLatestData = async () => {
    try {
      const [executionsRes, statsRes, healthRes] = await Promise.all([
        fetch("/api/executions"),
        fetch("/api/stats"),
        fetch("/api/health"),
      ]);
      
      const [executionsData, statsData, healthData] = await Promise.all([
        executionsRes.json(),
        statsRes.json(),
        healthRes.json()
      ]);

      setExecutions(executionsData.executions);
      setStats(statsData.stats);
      setHealth(healthData.status);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  // Initial data load and polling setup
  useEffect(() => {
    fetchLatestData();
    // Poll every 5 seconds
    const interval = setInterval(fetchLatestData, 5000);
    return () => clearInterval(interval);
  }, []);

  const executeCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setResult(data);
      // Immediately fetch latest data after execution
      await fetchLatestData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>JavaScript Code Executor</h1>
        <div className={`badge bg-${health === 'healthy' ? 'success' : 'danger'}`}>
          {health || 'Unknown'}
        </div>
      </div>

      {stats && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Executions</h5>
                <p className="card-text h3">{stats.total_executions}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Avg Execution Time</h5>
                <p className="card-text h3">
                  {stats.avg_execution_time 
                    ? `${parseFloat(stats.avg_execution_time).toFixed(2)}ms`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Error Rate</h5>
                <p className="card-text h3">
                  {stats.total_executions > 0
                    ? `${((parseInt(stats.error_count) / parseInt(stats.total_executions)) * 100).toFixed(1)}%`
                    : '0.0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="10"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your JavaScript code here..."
        />
      </div>

      <button 
        className="btn btn-primary mb-4"
        onClick={executeCode}
        disabled={loading || !code.trim()}
      >
        {loading ? "Executing..." : "Execute Code"}
      </button>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="card mb-4">
          <div className="card-header">
            Result {result.cached && <span className="badge bg-info">Cached</span>}
          </div>
          <div className="card-body">
            <pre className="mb-0">{JSON.stringify(result.result, null, 2)}</pre>
          </div>
        </div>
      )}

      <h2 className="mb-3">Recent Executions</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Time</th>
              <th>Code</th>
              <th>Result</th>
              <th>Execution Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((execution) => (
              <tr key={execution.id}>
                <td>{new Date(execution.created_at).toLocaleString()}</td>
                <td>
                  <code className="text-break">{execution.code.substring(0, 50)}...</code>
                </td>
                <td>
                  <code className="text-break">
                    {JSON.stringify(execution.result).substring(0, 50)}...
                  </code>
                </td>
                <td>{execution.execution_time}ms</td>
                <td>
                  <span className={`badge bg-${execution.error ? 'danger' : 'success'}`}>
                    {execution.error ? 'Error' : 'Success'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CodeExecutor />
  </StrictMode>
);
