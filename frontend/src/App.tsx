import { useState } from "react";

type Iteration = {
  i: number;
  xm: number;
  f_xm: number;
  error: number | null;
};

type BiseccionResponse = {
  iterations: Iteration[];
  root: number | null;
  message: string;
  success: boolean;
};

const API_URL = "http://127.0.0.1:8000/api/biseccion";

function App() {
  const [funcion, setFuncion] = useState("x^3 - x - 2");
  const [xi, setXi] = useState("1");
  const [xs, setXs] = useState("2");
  const [tol, setTol] = useState("1e-6");
  const [niter, setNiter] = useState("50");
  const [errorType, setErrorType] = useState<"absolute" | "relative">("relative");
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setIterations([]);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funcion,
          xi: parseFloat(xi),
          xs: parseFloat(xs),
          tol: parseFloat(tol),
          niter: parseInt(niter, 10),
          error_type: errorType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al consultar el backend.");
      }

      const data = (await response.json()) as BiseccionResponse;
      setIterations(data.iterations);
      setMessage(data.message);
      if (!data.success) {
        setError("El método no logró converger con los parámetros dados.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Método de Bisección</h1>
        <p>Ingresa la función y los parámetros para obtener la tabla de iteraciones.</p>
      </header>

      <form onSubmit={handleSubmit} className="form-card">
        <label>
          Función f(x)
          <input value={funcion} onChange={(event) => setFuncion(event.target.value)} placeholder="x^3 - x - 2" />
        </label>

        <div className="row">
          <label>
            xi
            <input value={xi} onChange={(event) => setXi(event.target.value)} placeholder="1" />
          </label>
          <label>
            xs
            <input value={xs} onChange={(event) => setXs(event.target.value)} placeholder="2" />
          </label>
        </div>

        <div className="row">
          <label>
            Tolerancia
            <input value={tol} onChange={(event) => setTol(event.target.value)} placeholder="1e-6" />
          </label>
          <label>
            Iteraciones
            <input value={niter} onChange={(event) => setNiter(event.target.value)} placeholder="50" />
          </label>
        </div>

        <div className="row">
          <label>
            Tipo de error
            <select value={errorType} onChange={(event) => setErrorType(event.target.value as "absolute" | "relative")}>
              <option value="relative">Relativo</option>
              <option value="absolute">Absoluto</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Calculando..." : "Calcular"}
        </button>
      </form>

      {message && <div className="result-card">{message}</div>}
      {error && <div className="error-card">{error}</div>}

      {iterations.length > 0 && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Iteración</th>
                <th>xm</th>
                <th>f(xm)</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {iterations.map((row) => (
                <tr key={row.i}>
                  <td>{row.i}</td>
                  <td>{row.xm.toPrecision(12)}</td>
                  <td>{row.f_xm.toExponential(6)}</td>
                  <td>{row.error === null ? "—" : row.error.toExponential(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
