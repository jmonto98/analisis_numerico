import { useState } from "react";
import BiseccionForm from "./components/BiseccionForm";
import IterationsTable from "./components/IterationsTable";
import FunctionGraph from "./components/FunctionGraph";
import { BiseccionResponse, GraphPoint, Iteration, Method } from "./types";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/biseccion";
const GRAPH_URL = "http://127.0.0.1:8000/api/grafica";

function App() {
  const [funcion, setFuncion] = useState("x^3 - x - 2");
  const [xi, setXi] = useState("1");
  const [xs, setXs] = useState("2");
  const [tol, setTol] = useState("1e-6");
  const [niter, setNiter] = useState("50");
  const [errorType, setErrorType] = useState<"absolute" | "relative">("relative");
  const [method, setMethod] = useState<Method>("biseccion");
  const [generateGraph, setGenerateGraph] = useState(true);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [graphPoints, setGraphPoints] = useState<GraphPoint[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "funcion":
        setFuncion(value);
        break;
      case "xi":
        setXi(value);
        break;
      case "xs":
        setXs(value);
        break;
      case "tol":
        setTol(value);
        break;
      case "niter":
        setNiter(value);
        break;
      case "errorType":
        setErrorType(value as "absolute" | "relative");
        break;
      case "method":
        setMethod(value as Method);
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setFuncion("");
    setXi("");
    setXs("");
    setTol("");
    setNiter("");
    setErrorType("relative");
    setMethod("biseccion");
    setGenerateGraph(true);
    setIterations([]);
    setGraphPoints([]);
    setMessage("");
    setError("");
  };

  const fetchGraph = async () => {
    const response = await fetch(GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funcion,
        xi: parseFloat(xi),
        xs: parseFloat(xs),
        n_points: 180,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Error al generar la gráfica.");
    }

    const data = (await response.json()) as { points: GraphPoint[]; success: boolean; message: string };
    setGraphPoints(data.points);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setIterations([]);
    setGraphPoints([]);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
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

      if (generateGraph) {
        await fetchGraph();
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
        <h1>Métodos Númericos</h1>
        <p>Ingresa la función y los parámetros para obtener la tabla de iteraciones y la gráfica.</p>
      </header>

      <BiseccionForm
        funcion={funcion}
        xi={xi}
        xs={xs}
        tol={tol}
        niter={niter}
        errorType={errorType}
        method={method}
        generateGraph={generateGraph}
        onChange={handleFieldChange}
        onToggleGenerateGraph={() => setGenerateGraph((current) => !current)}
        onSubmit={handleSubmit}
        onReset={handleReset}
        loading={loading}
      />

      {message && <div className="result-card">{message}</div>}
      {error && <div className="error-card">{error}</div>}

      <div className="result-row">
        {iterations.length > 0 && <IterationsTable iterations={iterations} />}
        {graphPoints.length > 0 && <FunctionGraph points={graphPoints} />}
      </div>
    </div>
  );
}

export default App;
