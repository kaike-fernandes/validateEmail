import { useEffect, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {

  const [status, setStatus] = useState("checando...");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("checando...");

  useEffect( () => {
    fetch(`${API}/health`)
    .then(r => r.json())
    .then(j => setStatus(`OK (${j.env})`))
    .catch(err => {
      console.error(err);
      setStatus("Falhou")
    });
  }, []);

  useEffect(() => {
    fetch(`${API}/`)
    .then(r =>  r.json())
    .then(j => setMessage(`${j.message}`))
    .catch(err => {
      console.error(err);
      setStatus("Falhou")
    });
  })

  const pingAnalyze = async () => {
    const req = await fetch(`${API}/analyze`,{
      method: "POST",
      headers: {"Content-Type": "application/json" },
      body: JSON.stringify({text: "Mensagem de exemplo"})
    });
    setResult(await req.json());
    
  }

  return (
    <div style={{fontFamily:"system-ui",padding:24}}>
      <h1>Email AI (deploy primeiro)</h1>
      <p>API: {API}</p>
      <p>Health: {status}</p>
      <p>Mensagem de boas vindas: {message}</p>
      <button onClick={pingAnalyze}>Testar /analyze (mock)</button>
      {result && (
        <pre style={{background:"#070707ff",padding:12, marginTop:12}}>
      {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
