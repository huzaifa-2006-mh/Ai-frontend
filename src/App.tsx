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
const API_BASE = "ai-backend--huzaifamm70.replit.app";
const FINAL_API_URL = `wss://${API_BASE}/api`;
const FINAL_REST_URL = `https://${API_BASE}/api`;

function App() {
  const [mode, setMode] = useState<'hero' | 'writing' | 'age'>('hero');
  const [result, setResult] = useState<any>(null);
  const [processedImg, setProcessedImg] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const webcamRef = useRef<Webcam>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchLogs();
    if (mode !== 'hero') {
      setWsStatus('connecting');
      const endpoint = mode === 'writing' ? '/ws/air-writing' : '/ws/age-detection';
      const ws = new WebSocket(`${FINAL_API_URL}${endpoint}`);
      wsRef.current = ws;

      ws.onopen = () => setWsStatus('open');
      ws.onclose = () => setWsStatus('closed');
      ws.onerror = () => setWsStatus('closed');

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (mode === 'writing') {
          setProcessedImg(data.image);
        } else {
          setResult(data);
          // Only fetch logs if the backend says a new log was created
          if (data.new_log) fetchLogs();
        }
      };

      const interval = setInterval(() => {
        if (webcamRef.current && ws.readyState === WebSocket.OPEN) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            ws.send(JSON.stringify({ type: 'frame', image: imageSrc }));
          }
        }
      }, 200); // 5 FPS is plenty for these tasks and prevents server overload

      return () => {
        clearInterval(interval);
        ws.close();
      };
    } else {
      setProcessedImg(null);
      setResult(null);
      setWsStatus('closed');
    }
  }, [mode]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${FINAL_REST_URL}/logs`);
      if (!response.ok) throw new Error('Fetch failed');
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
      <nav className="nav-container animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-box">
            <Cpu size={24} color="white" />
          </div>
          <div>
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>MHS AI</h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase' }}>Vision Intelligence</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={`glass status-pill ${wsStatus}`}>
            <div className={`status-dot ${wsStatus}`}></div>
            {wsStatus === 'open' ? 'System Online' : wsStatus === 'connecting' ? 'Connecting...' : 'System Offline'}
          </div>
        </div>
      </nav>

      {mode === 'hero' && (
        <section className="hero animate-in">
          <div className="badge-premium">
            <Activity size={16} /> Neural Engine v2.0 Online
          </div>
          <h1 className="gradient-text hero-title">Future of Vision AI</h1>
          <p className="hero-subtitle">
            Experience the next generation of human-computer interaction. 
            Write in the air or analyze facial biometrics with millisecond precision.
          </p>
          
          <div className="feature-grid">
            <div className="feature-card glass glass-hover" onClick={() => setMode('writing')}>
              <div className="icon-box">
                <MousePointer2 size={32} />
              </div>
              <h3>Air Writing</h3>
              <p>Spatial tracking turns your index finger into a digital brush. Draw in mid-air with real-time rendering.</p>
              <div className="card-footer">Launch Module →</div>
            </div>
            
            <div className="feature-card glass glass-hover" onClick={() => setMode('age')}>
              <div className="icon-box" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--secondary)' }}>
                <UserCheck size={32} />
              </div>
              <h3>Age Detection</h3>
              <p>Deep neural networks analyze facial landmarks to estimate age and biological attributes instantly.</p>
              <div className="card-footer">Launch Module →</div>
            </div>
          </div>
        </section>
      )}

      {mode !== 'hero' && (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <button 
              onClick={() => setMode('hero')} 
              className="btn btn-glass"
            >
              <ChevronLeft size={20} /> Exit Module
            </button>
            <div className="module-title">
              {mode === 'writing' ? 'Air Writing Recognition' : 'Facial Attribute Analysis'}
            </div>
          </div>
          
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
              <div className="camera-overlay"></div>
              {wsStatus !== 'open' && (
                <div className="camera-placeholder">
                  <RefreshCw className="pulse" size={48} />
                  <p>Establishing Secure Link...</p>
                </div>
              )}
            </div>

            <div className="analysis-panel">
              <div className="glass stat-card main-stat">
                <div className="stat-header">
                  <ShieldCheck size={18} color="var(--secondary)" /> 
                  <span>{mode === 'writing' ? 'Recognition Status' : 'Detection Result'}</span>
                </div>
                
                {mode === 'age' && (
                  <div className="stat-content">
                    <div className="stat-val">
                      {result?.age ? `${result.age}` : wsStatus === 'open' ? 'Scanning' : '--'} 
                      {result?.age && <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>Years</span>}
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: result?.confidence ? `${result.confidence * 100}%` : '0%' }}></div>
                    </div>
                    <p className="stat-desc">
                      AI Confidence: {result?.confidence ? `${(result.confidence * 100).toFixed(1)}%` : wsStatus === 'open' ? 'Calibrating...' : 'Offline'}
                    </p>
                  </div>
                )}

                {mode === 'writing' && (
                  <div className="stat-content">
                    <button onClick={resetCanvas} className="btn btn-primary w-full">
                      <RefreshCw size={20} /> Clear Canvas
                    </button>
                    <div className="hint-box">
                      <strong>Tip:</strong> Raise your index finger and keep it extended to start writing.
                    </div>
                  </div>
                )}
              </div>

              <div className="glass stat-card history-card">
                <div className="stat-header">
                  <History size={18} color="var(--primary)" />
                  <span>Real-time Log</span>
                </div>
                <div className="logs-container">
                  {logs.length > 0 ? logs.slice(0, 10).map((log, i) => (
                    <div key={i} className="log-entry animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="log-time">
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className="log-val">
                        {log.feature_type === 'age' ? `Detected Age: ${log.result_value}` : 'Writing Captured'}
                      </div>
                    </div>
                  )) : (
                    <div className="no-logs">
                      <Activity size={24} className="pulse" />
                      <p>Waiting for data...</p>
                    </div>
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
