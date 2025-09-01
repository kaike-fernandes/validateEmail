import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, FileText, Sparkles, Trash2, Copy, Check, Brain, Settings2, Bot, Heart } from "lucide-react";
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
        const form = new FormData(); 
        form.append('file', file);
        res = await fetch(
          `${API}/upload?mode=${mode}`,
          { 
            method: 'POST', 
            body: form 
          }
        );
      } else {
        res = await fetch(
          `${API}/analyze`,
          { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ text, mode }) 
          }
        );
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
    <div className="w-full h-full text-slate-100">
      {/* NAV */}
      <motion.nav variants={fade} initial="hidden" animate="show" className="border-b border-slate-800/80 bg-slate-900/70">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl glass shadow-soft glow flex items-center justify-center text-indigo-300">
              <Sparkles className="w-6 h-6"/>
            </div>
            <h1 className="text-3xl tracking-tight font-mono">Email Classifier</h1>
            <span className={`ml-2 text-xs font-mono px-2 py-0.5 rounded-full ${health==='online' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'}`}>{health}</span>
          </div>
          <div className="font-mono hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Settings2 className="w-4 h-4"/> {API}
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="w-full flex items-center justify-center p-6">
        <motion.div variants={fade} initial="hidden" animate="show" className="flex items-center gap-3 text-slate-300">
          <Brain className="w-5 h-5 text-indigo-300"/>
          <p className="text-sm font-mono">Agente analista de e-mail. Digite ou copie o conteúdo do e-mail ou anexe um arquivo <b>.txt/.pdf</b>.</p>
        </motion.div>
      </section>

      {/* MAIN */}
      <motion.main variants={stagger} initial="hidden" animate="show" className="w-full mx-auto px-8s gap-4">
        {/* FORM CARD */}
        <motion.section variants={fade} className="col-span-12 2xl:col-span-8 glass rounded-2xl px-12 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-mono">Analisar email</h2>
            <div className="bg-slate-800/80 rounded-xl p-1 flex gap-1">
                {/* {['ai','baseline'].map(m => (
                  <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1.5 rounded-lg text-sm transition ${mode===m? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{m==='ai'?'IA':'Baseline'}</button>
                ))} */}
                <Bot></Bot>
            </div>
          </div>

          {/* <label className="block text-xs text-slate-400 mb-1">Texto do email</label> */}
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Cole aqui o conteúdo do email..." className="font-mono input h-64 w-full border-indigo-500 border-2 hover:border-indigo-600 focus:outline-none focus:border-indigo-600 rounded-2xl p-4" />

          <div className="mt-5 grid gap-5">
            {/* Dropzone */}
            <div onClick={()=>fileRef.current?.click()} onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} className="h-20 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/60 transition flex flex-col items-center justify-center text-center cursor-pointer">
              <Upload className="w-5 h-5 text-slate-400 mb-2"/>
              <p className="text-sm text-slate-400 font-mono">Selecione ou arraste .txt / .pdf</p>
              <input ref={fileRef} type="file" accept=".txt,application/pdf" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)} />
              {file && <div className="mt-2 text-sm flex items-center gap-2 text-slate-300"><FileText className="w-4 h-4"/>{file.name}</div>}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={onAnalyze} disabled={!canSubmit||loading} className="w-full btn-primary disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Analisar'}
            </button>
            <button onClick={resetAll} className="w-full btn-ghost flex items-center gap-2 justify-center">
              <Trash2 className="w-4 h-4"/>
              Limpar
            </button>
          </div>
          <AnimatePresence>{error && (<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:6}} className="mt-3 text-sm text-red-400">{error}</motion.div>)}</AnimatePresence>
        </motion.section>


        {/* RESULT CARD */}
        <motion.section variants={fade} className="rounded-2xl px-12 py-8">
          <h2 className="text-xl font-semibold font-mono">Resultado</h2>
          {!result ? (
            <p className="text-slate-400 text-sm">Envie um texto/arquivo para classificar.</p>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-4 px-14">
                <span className={`font-mono px-3 py-1 rounded-full text-xs tracking-wide ${result.category==='Produtivo' ? 'bg-emerald-900/70 text-emerald-300' : 'bg-slate-800 text-slate-200'}`}>{result.category}</span>
                <span className="text-xs font-mono text-slate-400">Confiança: {(result.confidence*100).toFixed(0)}%</span>
              </div>


              <div className="w-full px-10 flex flex-col justify-center items-center">
                <textarea readOnly className="font-mono input h-64 w-full border-indigo-500 border-2 hover:border-indigo-600 focus:outline-none focus:border-indigo-600 rounded-2xl p-4">{result.reply}</textarea>
                <button onClick={async()=>{await copy();}} className="w-1/2 btn-ghost text-xs flex justify-center items-center gap-2 mt-4">
                  {copied ? (<><Check className="w-4 h-4"/> Copiado</>) : (<><Copy className="w-4 h-4"/> Copiar</>)}
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </motion.main>
      <footer className="text-center text-[15px] text-slate-300 py-6 animate-pulse font-mono">
        Desenvolvido por Kaike Fernandes.<br/>
        Feito com ❤️
      </footer>
    </div>
  )
}