import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, FileText, Sparkles, Trash2, Copy, Check, Brain, Settings2 } from "lucide-react";
import './App.css'

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: .38, ease: 'easeOut' } } };
const stagger = { show: { transition: { staggerChildren: .06 } } };

export default function App() {

  const [mode, setMode] = useState("ai");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [status, setStatus] = useState("checando...");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState("checando...");
  const fileRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.json()).then(() => setHealth("online")).catch(() => setHealth("offline"));
  }, []);

  const canSubmit = useMemo(() => (text && text.trim().length >= 5) || file, [text, file]);

  const onAnalyze = async (e) => {
    e?.preventDefault?.(); setLoading(true); setError(''); setResult(null);
    try {
      let res;
      if (file) {
        const form = new FormData(); form.append('file', file);
        res = await fetch(`${API}/upload?mode=${mode}`, { method: 'POST', body: form });
      } else {
        res = await fetch(`${API}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, mode }) });
      }
      if (!res.ok) throw new Error(await res.text());
        setResult(await res.json());
      } catch (err) {
        setError(String(err));
      } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setText(''); setFile(null); setResult(null); setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const copy = async () => {
    if (!result?.reply) return;
    await navigator.clipboard.writeText(result.reply);
    setCopied(true);
    setTimeout(()=>setCopied(false), 1200);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div className="w-full min-h-screen text-slate-100">
      {/* NAV */}
      <motion.nav variants={fade} initial="hidden" animate="show" className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur">
        <div className="max-w-[90rem] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl glass shadow-soft glow flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4"/>
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Email Classifier</h1>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${health==='online' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'}`}>{health}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Settings2 className="w-4 h-4"/> {API}
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="max-w-[90rem] mx-auto px-8 pt-10 pb-6">
        <motion.div variants={fade} initial="hidden" animate="show" className="flex items-center gap-3 text-slate-300">
        <Brain className="w-5 h-5 text-indigo-300"/>
        <p className="text-sm">Cole o texto ou envie .txt/.pdf. Escolha IA ou Baseline e clique em Analisar.</p>
      </motion.div>
      </section>

      {/* MAIN */}
      <motion.main variants={stagger} initial="hidden" animate="show" className="max-w-[90rem] mx-auto px-8 pb-16 grid grid-cols-12 gap-8">
        {/* FORM CARD */}
        <motion.section variants={fade} className="col-span-12 2xl:col-span-8 glass rounded-2xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Analisar email</h2>
            <div className="bg-slate-800/80 rounded-xl p-1 flex gap-1">
                {['ai','baseline'].map(m => (
                <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1.5 rounded-lg text-sm transition ${mode===m? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{m==='ai'?'IA':'Baseline'}</button>
              ))}
            </div>
          </div>

          <label className="block text-xs text-slate-400 mb-1">Texto do email</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Cole aqui o conteúdo do email..." className="input h-64" />

          <div className="mt-5 grid lg:grid-cols-2 gap-5">
            {/* Dropzone */}
            <div onClick={()=>fileRef.current?.click()} onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} className="h-44 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/60 transition flex flex-col items-center justify-center text-center cursor-pointer">
              <Upload className="w-5 h-5 text-slate-400 mb-2"/>
              <p className="text-sm text-slate-400">Selecione ou arraste .txt / .pdf</p>
              <input ref={fileRef} type="file" accept=".txt,application/pdf" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)} />
              {file && <div className="mt-2 text-sm flex items-center gap-2 text-slate-300"><FileText className="w-4 h-4"/>{file.name}</div>}
            </div>

            {/* Tips */}
            <div className="rounded-2xl glass border border-slate-800/70 p-5 float">
              <p className="text-sm text-slate-200">Dicas</p>
              <ul className="mt-2 text-xs text-slate-400 list-disc list-inside space-y-1">
                <li>IA gera respostas melhores e justificativas.</li>
                <li>Baseline é rápido e não depende de chave.</li>
                <li>Arquivos suportados: <code>.txt</code> e <code>.pdf</code>.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={onAnalyze} disabled={!canSubmit||loading} className="btn-primary disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Analisar'}
            </button>
            <button onClick={resetAll} className="btn-ghost"><Trash2 className="w-4 h-4"/>
              Limpar
            </button>
          </div>
          <AnimatePresence>{error && (<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:6}} className="mt-3 text-sm text-red-400">{error}</motion.div>)}</AnimatePresence>
        </motion.section>


        {/* RESULT CARD */}
        <motion.section variants={fade} className="col-span-12 2xl:col-span-4 glass rounded-2xl shadow-soft p-6">
          <h2 className="text-xl font-semibold mb-4">Resultado</h2>
          {!result ? (
            <p className="text-slate-400 text-sm">Envie um texto/arquivo para classificar.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs tracking-wide ${result.category==='Produtivo' ? 'bg-emerald-900/70 text-emerald-300' : 'bg-slate-800 text-slate-200'}`}>{result.category}</span>
                <span className="text-xs text-slate-400">Confiança: {(result.confidence*100).toFixed(0)}%</span>
                <span className="text-xs text-slate-500">Modelo: {result.model}</span>
              </div>


              <div className="relative">
                <textarea readOnly className="input h-48">{result.reply}</textarea>
                <button onClick={async()=>{await copy();}} className="absolute right-2 top-2 btn-ghost text-xs">
                  {copied ? (<><Check className="w-4 h-4"/> Copiado</>) : (<><Copy className="w-4 h-4"/> Copiar</>)}
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </motion.main>
      <footer className="text-center text-[11px] text-slate-500 py-8">Case — UI dark ampla, animada e objetiva.</footer>
    </div>
  )
}