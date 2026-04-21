# Análisis Numérico - Método de Bisección

## Backend (FastAPI)

1. Ir a la carpeta `backend`:

```bash
cd backend
```

2. Crear un entorno virtual e instalar dependencias:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Ejecutar el servidor:

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

4. El endpoint disponible es:

- `POST http://127.0.0.1:8000/api/biseccion`

Ejemplo de body JSON:

```json
{
  "funcion": "x^3 - x - 2",
  "xi": 1,
  "xs": 2,
  "tol": 1e-6,
  "niter": 50,
  "error_type": "relative"
}
```

## Frontend (React + TypeScript)

1. Ir a la carpeta `frontend`:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar el frontend:

```bash
npm run dev
```

4. Abrir el navegador en la dirección que muestre Vite, típicamente `http://127.0.0.1:4173`.

## Notas

- El frontend consume el backend en `http://127.0.0.1:8000/api/biseccion`.
- El backend permite expresiones matemáticas comunes y convierte `^` a `**`.
- El resultado incluye la tabla de iteraciones y un mensaje de convergencia o fallo.
