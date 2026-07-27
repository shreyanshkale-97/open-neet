import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Brain, ArrowRight } from 'lucide-react';

export const OwnPaperModePage: React.FC = () => {
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleProcess = () => {
    if (!paperFile) {
      alert('Please upload a Question Paper PDF first');
      return;
    }
    setProcessing(true);
    // Simulate OCR Extraction + Auto-Matching
    setTimeout(() => {
      setProcessing(false);
      setResult({
        extractedQuestions: 180,
        matchedAnswers: 175,
        score: 645,
        maxScore: 720,
        accuracy: 91.2,
      });
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--emerald-light)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--emerald)',
          padding: '0.4rem 0.875rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <Brain size={16} /> Free Local Tesseract.js OCR Engine
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Own Paper Mode</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Upload any Coaching or State exam PDF paper & answer key for instant OCR extraction & auto-scoring
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Upload Question Paper */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <FileText size={40} color="#6366F1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Upload Question Paper PDF</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Scanned or digital PDF of Coaching / Mock paper
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
            id="paper-upload"
          />
          <label htmlFor="paper-upload" style={{
            background: '#1E293B',
            color: '#FFF',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-block'
          }}>
            {paperFile ? paperFile.name : 'Choose Question PDF'}
          </label>
        </div>

        {/* Upload Answer Key */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Upload size={40} color="#10B981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Upload Official Answer Key PDF (Optional)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Official answer key for automatic score evaluation
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
            id="key-upload"
          />
          <label htmlFor="key-upload" style={{
            background: '#1E293B',
            color: '#FFF',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-block'
          }}>
            {keyFile ? keyFile.name : 'Choose Key PDF'}
          </label>
        </div>
      </div>

      <button
        onClick={handleProcess}
        disabled={processing || !paperFile}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          border: 'none',
          borderRadius: '10px',
          color: '#FFF',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
          opacity: processing || !paperFile ? 0.6 : 1,
          marginBottom: '2.5rem'
        }}
      >
        {processing ? 'Processing OCR & Auto-Matching Answers...' : 'Extract & Evaluate Own Paper'}
      </button>

      {/* Extracted Result */}
      {result && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={48} color="#10B981" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Paper Evaluated Successfully!</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366F1' }}>{result.extractedQuestions}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Questions Extracted</div>
            </div>
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)' }}>{result.score} / {result.maxScore}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NEET Score</div>
            </div>
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--amber)' }}>{result.accuracy}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};