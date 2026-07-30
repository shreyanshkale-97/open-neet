import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, Brain, ArrowRight, Loader2, AlertTriangle, Layers, HelpCircle, Cpu, Key } from 'lucide-react';
import { ownPaperApi } from '../services/api';
import { AnswerKeyModal } from '../components/AnswerKeyModal';

type ProcessingStep = 'idle' | 'uploading' | 'extracting' | 'validating' | 'done' | 'error';

export const OwnPaperModePage: React.FC = () => {
  const navigate = useNavigate();
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const [totalBatches, setTotalBatches] = useState<number>(0);
  const [currentPages, setCurrentPages] = useState<string>('Initial setup');
  const [extractedCount, setExtractedCount] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleProcess = async () => {
    if (!paperFile) {
      alert('Please upload a Question Paper PDF first');
      return;
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    setStep('uploading');
    setProgress(5);
    setStatusText('Uploading PDF & initializing local processing pipeline...');
    setCurrentBatch(0);
    setTotalBatches(0);
    setCurrentPages('Document analysis');
    setExtractedCount(0);
    setErrorMsg('');

    // Start 700ms polling timer for real-time progress updates
    pollRef.current = setInterval(async () => {
      try {
        const prog = await ownPaperApi.getProgress(jobId);
        if (prog) {
          if (prog.progressPercent !== undefined) setProgress(prog.progressPercent);
          if (prog.currentBatch !== undefined) setCurrentBatch(prog.currentBatch);
          if (prog.totalBatches !== undefined) setTotalBatches(prog.totalBatches);
          if (prog.currentPages) setCurrentPages(prog.currentPages);
          if (prog.extractedQuestionsCount !== undefined) setExtractedCount(prog.extractedQuestionsCount);
          if (prog.statusText) setStatusText(prog.statusText);
          if (prog.status === 'extracting') setStep('extracting');
          if (prog.status === 'validating') setStep('validating');

          if (prog.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);
          }
          if (prog.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep('error');
            setErrorMsg(prog.error || 'Processing failed');
          }
        }
      } catch (e) {
        // silent polling fallback
      }
    }, 700);

    try {
      const formData = new FormData();
      formData.append('file', paperFile);
      if (keyFile) {
        formData.append('answerKey', keyFile);
      }

      const response = await ownPaperApi.processPaper(formData, jobId);

      if (pollRef.current) clearInterval(pollRef.current);
      setProgress(100);
      setStep('done');
      setStatusText('Paper processed successfully!');
      setResult(response);
    } catch (err: any) {
      if (pollRef.current) clearInterval(pollRef.current);
      setStep('error');
      setErrorMsg(err.message || 'Failed to process PDF. Please try again.');
    }
  };

  const handleStartTest = () => {
    if (result?.testId) {
      navigate(`/test/${result.testId}`);
    }
  };

  const progressBarColor =
    step === 'error'
      ? '#EF4444'
      : step === 'done'
      ? '#10B981'
      : 'linear-gradient(90deg, #6366F1, #10B981)';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
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
            marginBottom: '1rem',
          }}
        >
          <Brain size={16} /> Local Ollama + Qwen — Zero API Cost Extraction
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Own Paper Mode</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Upload any NEET / Coaching exam PDF — Local Qwen engine extracts questions & generates a full NTA-style test simulator
        </p>
      </div>

      {/* Upload Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Upload Question Paper */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <FileText size={40} color="#6366F1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Upload Question Paper PDF</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Scanned or digital PDF of NEET / Coaching / Mock paper
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
            id="paper-upload"
          />
          <label
            htmlFor="paper-upload"
            style={{
              background: paperFile ? 'linear-gradient(135deg, #10B981, #059669)' : '#1E293B',
              color: '#FFF',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as any,
            }}
          >
            {paperFile ? `✓ ${paperFile.name}` : 'Choose Question PDF'}
          </label>
          {paperFile && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {(paperFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
        </div>

        {/* Upload Answer Key */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Upload size={40} color="#10B981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Upload Official Answer Key (Optional)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Official answer key for automatic score evaluation after test
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
            id="key-upload"
          />
          <label
            htmlFor="key-upload"
            style={{
              background: keyFile ? 'linear-gradient(135deg, #10B981, #059669)' : '#1E293B',
              color: '#FFF',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            {keyFile ? `✓ ${keyFile.name}` : 'Choose Key PDF'}
          </label>
        </div>
      </div>

      {/* Real-Time Processing Progress Panel */}
      {step !== 'idle' && step !== 'done' && step !== 'error' && (
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          {/* Top Progress Info Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 size={24} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFF' }}>
                  Processing Document
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {statusText}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#6366F1',
                fontFamily: 'monospace',
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              {progress}%
            </div>
          </div>

          {/* Animated Bar */}
          <div
            style={{
              width: '100%',
              height: '10px',
              background: '#0B0F17',
              borderRadius: '5px',
              overflow: 'hidden',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: progressBarColor,
                borderRadius: '5px',
                transition: 'width 0.4s ease-in-out',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
              }}
            />
          </div>

          {/* Live Batch & Page Progress Details Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {/* Card 1: Currently Processing Pages */}
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <Layers size={14} color="#6366F1" /> Target Pages
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>
                {currentPages}
              </div>
              {totalBatches > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '0.2rem', fontWeight: 600 }}>
                  Batch {currentBatch} of {totalBatches}
                </div>
              )}
            </div>

            {/* Card 2: Extracted Questions Count */}
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <HelpCircle size={14} color="#10B981" /> Questions Extracted
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald)' }}>
                {extractedCount} Questions
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Real-time count
              </div>
            </div>

            {/* Card 3: Model Engine */}
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <Cpu size={14} color="#F59E0B" /> AI Inference Engine
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>
                Qwen 2.5 7B
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--amber)', marginTop: '0.2rem', fontWeight: 600 }}>
                Local Ollama GPU
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {step === 'error' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderColor: '#EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#EF4444' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {step !== 'done' && (
        <button
          onClick={handleProcess}
          disabled={(step !== 'idle' && step !== 'error') || !paperFile}
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
            opacity: (step !== 'idle' && step !== 'error') || !paperFile ? 0.6 : 1,
            marginBottom: '2.5rem',
          }}
        >
          {step === 'idle' || step === 'error'
            ? 'Extract & Launch NTA Test Simulator'
            : 'Extracting Questions (Please wait...)'}
        </button>
      )}

      {/* Success Result */}
      {step === 'done' && result && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={48} color="#10B981" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Paper Extracted Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {result.extractedCount || result.totalQuestions} questions extracted from your PDF
            {result.reviewFlaggedCount > 0 && (
              <span style={{ color: 'var(--amber)', fontWeight: 700 }}>
                {' '}({result.reviewFlaggedCount} flagged for review)
              </span>
            )}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366F1' }}>
                {result.extractedCount || result.totalQuestions}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valid Questions</div>
            </div>
            {result.reviewFlaggedCount > 0 && (
              <div
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--amber)' }}>
                  {result.reviewFlaggedCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Needs Review</div>
              </div>
            )}
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)' }}>180 min</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test Duration</div>
            </div>
            <div style={{ background: '#0B0F17', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--amber)' }}>NTA</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exam Format</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowKeyModal(true)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1rem',
                background: '#1E293B',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '10px',
                color: '#10B981',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
            >
              <Key size={20} /> View Official Answer Key
            </button>

            <button
              onClick={handleStartTest}
              style={{
                flex: 2,
                minWidth: '240px',
                padding: '1rem',
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                border: 'none',
                borderRadius: '10px',
                color: '#FFF',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              Start NTA Exam Simulator <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Answer Key & NCERT Solutions Modal */}
      {showKeyModal && result?.testId && (
        <AnswerKeyModal testId={result.testId} onClose={() => setShowKeyModal(false)} />
      )}
    </div>
  );
};