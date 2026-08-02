import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BrainCircuit,
  Eye,
  Camera,
  Download,
  Printer,
  FileJson,
  Check,
  Edit2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  ShieldAlert,
  Zap,
  ArrowRight,
  Layers,
  Cpu,
} from 'lucide-react';
import { Patient, Vitals } from '../../types';
import { LabAnalysisResult, LabExtractionParameter } from '../../types/labAnalysis';
import { LabOcrService } from '../../services/labOcrService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activePatient: Patient;
  onApplyAutoFill?: (updatedVitals: Partial<Vitals>, reportSummary: string) => void;
}

export const LabReportAnalyzerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activePatient,
  onApplyAutoFill,
}) => {
  const [selectedSample, setSelectedSample] = useState<string>('sample-diabetic-metabolic');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('File Ingestion');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<LabAnalysisResult | null>(null);

  // Workspace View State
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'borderline' | 'normal' | 'unverified'>('all');
  const [selectedParamId, setSelectedParamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingParamId, setEditingParamId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Run Extraction Pipeline
  const runExtraction = async (fileOrSample: File | string) => {
    setIsProcessing(true);
    setProgressPercent(10);
    setProcessingStage('Ingesting File & Sanitizing Formats...');

    const timer1 = setTimeout(() => {
      setProgressPercent(35);
      setProcessingStage('Executing Optical Character Recognition (OCR)...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgressPercent(65);
      setProcessingStage('Extracting Medical Parameters & Normalizing Units...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgressPercent(90);
      setProcessingStage('Calculating Reference Ranges & Longitudinal Trends...');
    }, 1400);

    try {
      const result = await LabOcrService.analyzeReport(fileOrSample, activePatient);
      setProgressPercent(100);
      setAnalysisResult(result);
      if (result.parameters.length > 0) {
        setSelectedParamId(result.parameters[0].id);
      }
      setIsAutoFilled(false);
    } catch (err) {
      console.error('Extraction error:', err);
      showToast('Error during lab report OCR extraction.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsProcessing(false);
    }
  };

  // Load initial analysis when modal opens
  useEffect(() => {
    if (isOpen && !analysisResult && !isProcessing) {
      runExtraction(selectedSample);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Verification Handler
  const handleToggleVerify = (paramId: string) => {
    if (!analysisResult) return;
    const updatedParams = analysisResult.parameters.map((p) => {
      if (p.id === paramId) {
        return { ...p, isVerified: !p.isVerified };
      }
      return p;
    });

    const unverifiedCount = updatedParams.filter((p) => !p.isVerified || p.confidence === 'Low').length;
    setAnalysisResult({
      ...analysisResult,
      parameters: updatedParams,
      unverifiedCount,
    });
    showToast('Parameter verification status updated.');
  };

  // Edit Value Handler
  const handleSaveEdit = (paramId: string) => {
    if (!analysisResult) return;
    const num = parseFloat(editValue);
    if (isNaN(num)) return;

    const updatedParams = analysisResult.parameters.map((p) => {
      if (p.id === paramId) {
        return {
          ...p,
          rawValue: `${num}`,
          numericValue: num,
          standardizedValue: num,
          isVerified: true,
          confidence: 'High' as const,
          confidenceScore: 100,
        };
      }
      return p;
    });

    setAnalysisResult({
      ...analysisResult,
      parameters: updatedParams,
    });
    setEditingParamId(null);
    showToast('Parameter value updated & verified.');
  };

  // Auto-Fill Handler
  const handleAutoFillClick = () => {
    if (!analysisResult) return;
    if (onApplyAutoFill) {
      onApplyAutoFill(analysisResult.updatedVitals, analysisResult.summary.executiveSummary);
    }
    setIsAutoFilled(true);
    showToast('Vitals auto-filled to Assessment & CDSS Pipeline triggered!');
  };

  // Export JSON
  const handleDownloadJSON = () => {
    if (!analysisResult) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysisResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${analysisResult.metadata.patientName.replace(/\s+/g, '_')}_Lab_OCR.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Extracted JSON downloaded.');
  };

  // Print PDF
  const handlePrintSummary = () => {
    window.print();
  };

  // Filtered Parameters
  const filteredParameters = (analysisResult?.parameters || []).filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'critical') return p.status === 'Critical';
    if (activeTab === 'borderline') return p.status === 'Borderline';
    if (activeTab === 'normal') return p.status === 'Normal';
    if (activeTab === 'unverified') return !p.isVerified || p.confidence === 'Low';
    return true;
  });

  const selectedParam = analysisResult?.parameters.find((p) => p.id === selectedParamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-7xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">Intelligent Pathology OCR Workspace</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AI Medical Extraction v3.2
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Patient: <strong className="text-white">{activePatient.name}</strong></span>
                <span>•</span>
                <span>MRN: {activePatient.mrn}</span>
                <span>•</span>
                <span>Age: {activePatient.age} ({activePatient.gender})</span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            <button
              onClick={handleDownloadJSON}
              disabled={!analysisResult}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition disabled:opacity-50"
            >
              <FileJson className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={handlePrintSummary}
              disabled={!analysisResult}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Print Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload & Sample Controls Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
          {/* Sample Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Sample Reports:
            </span>
            {LabOcrService.getSampleReports(activePatient).map((sample) => {
              const isSelected = selectedSample === sample.id && !uploadedFile;
              return (
                <button
                  key={sample.id}
                  onClick={() => {
                    setSelectedSample(sample.id);
                    setUploadedFile(null);
                    runExtraction(sample.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {sample.title.split('&')[0]}
                </button>
              );
            })}
          </div>

          {/* Direct File & Camera Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setUploadedFile(file);
                  runExtraction(file);
                }
              }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setUploadedFile(file);
                  runExtraction(file);
                }
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse / Drag PDF</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Capture</span>
            </button>
          </div>
        </div>

        {/* Loading / OCR Processing Overlay */}
        {isProcessing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 min-h-[500px]">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center border border-blue-500/30 animate-pulse">
                <BrainCircuit className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-bounce" />
            </div>

            <div className="space-y-2 text-center max-w-md">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                HealthSense AI OCR Processing...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{processingStage}</p>
            </div>

            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-900">
              <Cpu className="w-4 h-4 animate-pulse" />
              <span>Normalizing mg/dL, mmol/L & Checking Range Severity</span>
            </div>
          </div>
        ) : analysisResult ? (
          /* SPLIT SCREEN WORKSPACE */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* LEFT PANEL: Interactive Document Viewer (5 cols) */}
            <div className="lg:col-span-5 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto flex flex-col space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Original Pathology Report Document
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{analysisResult.fileInfo.name}</span>
              </div>

              {/* Simulated Pathology Lab Document Canvas */}
              <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-5 border border-slate-300 dark:border-slate-700 shadow-md font-sans space-y-4 min-h-[580px] select-none">
                {/* Lab Header */}
                <div className="border-b-2 border-slate-800 dark:border-slate-300 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="font-extrabold text-sm uppercase tracking-wide text-blue-900 dark:text-blue-400">
                      {analysisResult.metadata.laboratoryName}
                    </h2>
                    <p className="text-[10px] text-slate-500">CLIA Certified • Accredited Reference Diagnostics</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    <p>Report Date: <strong>{analysisResult.metadata.reportDate}</strong></p>
                    <p>Specimen ID: <strong>LAB-948201</strong></p>
                  </div>
                </div>

                {/* Patient Block */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-slate-500 text-[10px]">PATIENT NAME:</p>
                    <p className="font-bold">{analysisResult.metadata.patientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">AGE / GENDER:</p>
                    <p className="font-bold">{analysisResult.metadata.patientAge} Y / {analysisResult.metadata.patientGender}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">REFERRING DOCTOR:</p>
                    <p className="font-bold">{analysisResult.metadata.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">COLLECTION DATE:</p>
                    <p className="font-bold">{analysisResult.metadata.collectionDate}</p>
                  </div>
                </div>

                {/* Document Section Title */}
                <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase border-b border-slate-200 dark:border-slate-700 pb-1 flex justify-between">
                  <span>TEST PARAMETER</span>
                  <span>RESULT (UNITS)</span>
                  <span>REFERENCE RANGE</span>
                </div>

                {/* Simulated Text Lines with Bounding Box Highlights */}
                <div className="relative space-y-3 pt-1 text-xs font-mono">
                  {analysisResult.parameters.map((param) => {
                    const isSelected = selectedParamId === param.id;
                    const isCritical = param.status === 'Critical';
                    const isBorderline = param.status === 'Borderline';

                    return (
                      <div
                        key={param.id}
                        onClick={() => setSelectedParamId(param.id)}
                        className={`relative p-2 rounded-xl transition cursor-pointer border ${
                          isSelected
                            ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/50 shadow-md'
                            : isCritical
                            ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-900'
                            : isBorderline
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-sans font-bold text-slate-800 dark:text-slate-200">
                            {param.name}
                          </span>
                          <span
                            className={`font-mono font-extrabold px-1.5 py-0.5 rounded ${
                              isCritical
                                ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100'
                                : isBorderline
                                ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {param.rawValue} {param.rawUnit}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{param.normalRange}</span>
                        </div>

                        {/* OCR Bounding Box Glow Badge */}
                        {isSelected && (
                          <div className="absolute -top-2 right-2 bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shadow-sm animate-pulse flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>OCR Highlight Match ({param.confidenceScore}%)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer seal */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[9px] text-slate-400">
                  <span>Verified by Pathologist: Dr. H. Vance, MD</span>
                  <span>Page 1 of 1 • HealthSense AI OCR Token</span>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Extracted Structured Data Workspace (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-6 overflow-y-auto space-y-5 flex flex-col">
              {/* Executive Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Clinical Extraction Summary
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {analysisResult.confidenceAverage}% Confidence Avg
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {analysisResult.summary.executiveSummary}
                </p>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-300 block uppercase font-bold">Total</span>
                    <span className="font-extrabold text-white text-sm">{analysisResult.counts.total}</span>
                  </div>
                  <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/30 text-red-300">
                    <span className="text-[10px] block uppercase font-bold">Critical</span>
                    <span className="font-extrabold text-sm">{analysisResult.counts.critical}</span>
                  </div>
                  <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-300">
                    <span className="text-[10px] block uppercase font-bold">Borderline</span>
                    <span className="font-extrabold text-sm">{analysisResult.counts.borderline}</span>
                  </div>
                  <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-300">
                    <span className="text-[10px] block uppercase font-bold">Unverified</span>
                    <span className="font-extrabold text-sm">{analysisResult.unverifiedCount}</span>
                  </div>
                </div>
              </div>

              {/* Auto-Fill Action Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/60 dark:to-emerald-950/60 border border-blue-200 dark:border-blue-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Auto-Fill Vitals & Sync CDSS Pipeline
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Populate patient assessment vitals automatically without typing. Triggers 10-Stage CDSS Risk Engine.
                  </p>
                </div>

                <button
                  onClick={handleAutoFillClick}
                  disabled={isAutoFilled}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 shrink-0 transition ${
                    isAutoFilled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                  }`}
                >
                  {isAutoFilled ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Vitals Auto-Filled</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Apply Auto-Fill</span>
                    </>
                  )}
                </button>
              </div>

              {/* Search & Filter Tabs */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search parameters or category (e.g. HbA1c, Renal)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto text-[11px]">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      All ({analysisResult.counts.total})
                    </button>
                    <button
                      onClick={() => setActiveTab('critical')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        activeTab === 'critical' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Critical ({analysisResult.counts.critical})
                    </button>
                    <button
                      onClick={() => setActiveTab('borderline')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        activeTab === 'borderline' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Borderline ({analysisResult.counts.borderline})
                    </button>
                    <button
                      onClick={() => setActiveTab('unverified')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        activeTab === 'unverified' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Unverified ({analysisResult.unverifiedCount})
                    </button>
                  </div>
                </div>

                {/* Parameters Extracted Table */}
                <div className="space-y-2.5">
                  {filteredParameters.map((param) => {
                    const isSelected = selectedParamId === param.id;
                    const isEditing = editingParamId === param.id;
                    const isCritical = param.status === 'Critical';
                    const isBorderline = param.status === 'Borderline';

                    return (
                      <div
                        key={param.id}
                        onClick={() => setSelectedParamId(param.id)}
                        className={`p-4 rounded-2xl border transition space-y-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {param.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {param.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{param.interpretation}</p>
                          </div>

                          {/* Severity Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${
                              isCritical
                                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
                                : isBorderline
                                ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {param.status}
                          </span>
                        </div>

                        {/* Parameter Numerical Details Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                          {/* Value / Edit */}
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Extracted Value</span>
                            {isEditing ? (
                              <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="number"
                                  step="any"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-20 px-2 py-0.5 text-xs rounded border border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                                <button
                                  onClick={() => handleSaveEdit(param.id)}
                                  className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                  {param.rawValue} {param.rawUnit}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingParamId(param.id);
                                    setEditValue(`${param.numericValue}`);
                                  }}
                                  className="text-slate-400 hover:text-blue-600 transition"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Reference Range */}
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Normal Ref Range</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 block mt-0.5 font-bold">
                              {param.normalRange}
                            </span>
                          </div>

                          {/* Confidence Score */}
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">OCR Confidence</span>
                            <span
                              className={`font-bold block mt-0.5 ${
                                param.confidence === 'High'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : param.confidence === 'Medium'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {param.confidence} ({param.confidenceScore}%)
                            </span>
                          </div>

                          {/* Longitudinal Trend */}
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Previous vs Current</span>
                            {param.previousValue ? (
                              <span
                                className={`font-bold flex items-center gap-1 mt-0.5 ${
                                  param.trend === 'Increasing'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {param.trend === 'Increasing' ? (
                                  <TrendingUp className="w-3.5 h-3.5" />
                                ) : (
                                  <TrendingDown className="w-3.5 h-3.5" />
                                )}
                                {param.previousValue} → {param.numericValue} ({param.trend})
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono mt-0.5 block">Baseline</span>
                            )}
                          </div>
                        </div>

                        {/* Verification Control Footer */}
                        <div className="flex items-center justify-between pt-1 text-[11px]" onClick={(e) => e.stopPropagation()}>
                          <span className="text-slate-400 font-mono text-[10px]">
                            Mapped to Bounding Box: [{param.boundingBox.x}, {param.boundingBox.y}]
                          </span>

                          <button
                            onClick={() => handleToggleVerify(param.id)}
                            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
                              param.isVerified
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 animate-pulse'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{param.isVerified ? 'Doctor Verified' : 'Verify Value'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
