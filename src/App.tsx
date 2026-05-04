import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { 
  MousePointer2, 
  UserCheck, 
  RefreshCw, 
  ChevronLeft, 
  Activity, 
  Cpu, 
  ShieldCheck,
  History,
  Clock
} from 'lucide-react';

// LIVE PRODUCTION API CONFIGURATION
const BASE_DOMAIN = "ai-backend--huzaifamm70.replit.app";
const API_URL = `wss://${BASE_DOMAIN}/api`;
const REST_API_URL = `https://${BASE_DOMAIN}/api`;

function App() {
  const [mode, setMode] = useState<'hero' | 'writing' | 'age'>('hero');
  const [result, setResult] = useState<any>(null);
  const [processedImg, setProcessedImg] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchLogs();
    if (mode !== 'hero') {
      const endpoint = mode === 'writing' ? '/ws/air-writing' : '/ws/age-detection';
      const ws = new WebSocket(`${API_URL}${endpoint}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (mode === 'writing') {
          setProcessedImg(data.image);
        } else {
          setResult(data);
          if (data.age) fetchLogs(); // Refresh logs when age is detected
        }
      };

      const interval = setInterval(() => {
        if (webcamRef.current && ws.readyState === WebSocket.OPEN) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            ws.send(JSON.stringify({ type: 'frame', image: imageSrc }));
          }
        }
      }, 100);

      return () => {
        clearInterval(interval);
        ws.close();
      };
    } else {
      setProcessedImg(null);
      setResult(null);
    }
  }, [mode]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${REST_API_URL}/logs`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const resetCanvas = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reset' }));
    }
  };

  return (
    <div className="container">
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 0',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--primary)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={24} color="white" />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>MHS AI</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass" style={{ padding: '8px 16px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            v1.1.0 DB Connected
          </div>
        </div>
      </nav>

      {mode === 'hero' && (
        <section className="hero animate-in">
          <div className="glass" style={{ padding: '8px 20px', borderRadius: '100px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            <Activity size={16} /> Powered by Neural Networks & Neon DB
          </div>
          <h1 className="gradient-text">Future of Vision AI</h1>
          <p>
            Seamlessly bridge the gap between physical gestures and digital input 
            with our advanced Air Writing and Facial Analysis technology.
          </p>
          
          <div className="feature-grid">
            <div className="feature-card glass glass-hover" onClick={() => setMode('writing')}>
              <div className="icon-box">
                <MousePointer2 size={32} />
              </div>
              <h3>Air Writing</h3>
              <p>Turn your finger into a digital brush. Write in mid-air and let AI capture every stroke.</p>
            </div>
            
            <div className="feature-card glass glass-hover" onClick={() => setMode('age')}>
              <div className="icon-box" style={{ background: 'rgba(255, 0, 122, 0.1)', color: 'var(--accent)' }}>
                <UserCheck size={32} />
              </div>
              <h3>Age Detection</h3>
              <p>Advanced facial recognition that estimates age with remarkable precision in real-time.</p>
            </div>
          </div>
        </section>
      )}

      {mode !== 'hero' && (
        <div className="animate-in">
          <button 
            onClick={() => setMode('hero')} 
            className="btn btn-glass" 
            style={{ marginBottom: '2rem' }}
          >
            <ChevronLeft size={20} /> Back to Hub
          </button>
          
          <div className="camera-view">
            <div className="camera-wrapper glass">
              <div className="badge-live">Live Feed</div>
              {processedImg ? (
                <img src={processedImg} className="camera-feed" alt="Processed AI Feed" />
              ) : (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="camera-feed"
                  mirrored={true}
                />
              )}
            </div>

            <div className="analysis-panel">
              <div className="glass stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  <ShieldCheck size={16} color="var(--secondary)" /> 
                  {mode === 'writing' ? 'Input Recognition' : 'Facial Analysis'}
                </div>
                <h3 className="gradient-text">{mode === 'writing' ? 'Canvas Controls' : 'AI Results'}</h3>
                
                {mode === 'age' && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="stat-val">{result?.age ? `${result.age} Yrs` : 'Scanning...'}</div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '10px' }}>
                      Biological age estimated based on facial landmarks and skin texture analysis.
                    </p>
                  </div>
                )}

                {mode === 'writing' && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={resetCanvas} className="btn btn-primary">
                      <RefreshCw size={20} /> Reset Canvas
                    </button>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      Tip: Use your index finger to write. Keep your hand clearly visible to the camera.
                    </p>
                  </div>
                )}
              </div>

              <div className="glass stat-card" style={{ flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <History size={18} color="var(--primary)" />
                  <h4>Detection History</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {logs.length > 0 ? logs.map((log, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.85rem', 
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} color="var(--text-dim)" />
                        <span style={{ color: 'var(--text-dim)' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                        Age: {log.result_value}
                      </span>
                    </div>
                  )) : (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>No logs yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
