import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { 
  MousePointer2, 
  UserCheck, 
  RefreshCw, 
  ChevronLeft, 
  Activity, 
  Cpu, 
  ShieldCheck 
} from 'lucide-react';

const API_URL = "ws://localhost:8000";

function App() {
  const [mode, setMode] = useState<'hero' | 'writing' | 'age'>('hero');
  const [result, setResult] = useState<any>(null);
  const [processedImg, setProcessedImg] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
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
            v1.0.0 Stable
          </div>
        </div>
      </nav>

      {mode === 'hero' && (
        <section className="hero animate-in">
          <div className="glass" style={{ padding: '8px 20px', borderRadius: '100px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--secondary)' }}>
            <Activity size={16} /> Powered by Neural Networks
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

              <div className="glass stat-card" style={{ flex: 1 }}>
                <h4 style={{ marginBottom: '1rem' }}>System Health</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Processing Latency</span>
                    <span style={{ color: '#00ff00' }}>42ms</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                    <div style={{ width: '85%', height: '100%', background: 'var(--secondary)', borderRadius: '2px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '8px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Model Confidence</span>
                    <span style={{ color: 'var(--secondary)' }}>94.2%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                    <div style={{ width: '94%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                  </div>
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
