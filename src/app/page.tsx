'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Upload, 
  Globe, 
  PieChart, 
  Download, 
  CheckCircle, 
  XCircle, 
  Zap,
  Circle,
  TrendingUp,
  User,
  Home,
  BarChart3,
  Target,
  Lightbulb
} from 'lucide-react';
import { JobDescription, ResumeData, AnalysisResult, OptimizedResume } from '@/lib/types';
import { 
  saveJobDescription, 
  saveResume, 
  saveAnalysis, 
  saveOptimizedResume,
  getJobDescriptions,
  getResumes,
  getAnalyses,
  getOptimizedResumes,
  generateId 
} from '@/lib/storage';
import { 
  analyzeResumeCompatibility, 
  extractTextFromFile, 
  parseJobDescription,
  generateOptimizedResume 
} from '@/lib/resume-analyzer';

export default function ResumeAnalyzer() {
  const [activeTab, setActiveTab] = useState('job');
  const [loading, setLoading] = useState(false);
  const [jobInput, setJobInput] = useState('');
  const [jobInputType, setJobInputType] = useState<'url' | 'text'>('url');
  const [currentJob, setCurrentJob] = useState<JobDescription | null>(null);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const jobs = getJobDescriptions();
    const resumes = getResumes();
    const analyses = getAnalyses();
    
    if (jobs.length > 0) setCurrentJob(jobs[jobs.length - 1]);
    if (resumes.length > 0) setCurrentResume(resumes[resumes.length - 1]);
    if (analyses.length > 0) setCurrentAnalysis(analyses[analyses.length - 1]);
  }, []);

  const handleJobSubmit = async () => {
    if (!jobInput.trim()) {
      setError('Por favor, insira um link ou descrição da vaga');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedJob = await parseJobDescription(jobInput);
      const job: JobDescription = {
        id: generateId(),
        title: parsedJob.title || 'Vaga de Emprego',
        company: parsedJob.company || 'Empresa',
        description: parsedJob.description || jobInput,
        requirements: parsedJob.requirements || [],
        skills: parsedJob.skills || [],
        url: parsedJob.url,
        createdAt: new Date()
      };

      saveJobDescription(job);
      setCurrentJob(job);
      setActiveTab('upload');
    } catch (err) {
      setError('Erro ao processar a vaga. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('document') && !file.type.includes('word')) {
      setError('Por favor, envie apenas arquivos PDF ou DOCX');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const extractedText = await extractTextFromFile(file);
      const resume: ResumeData = {
        id: generateId(),
        fileName: file.name,
        content: file.name,
        extractedText,
        uploadedAt: new Date()
      };

      saveResume(resume);
      setCurrentResume(resume);
      
      if (currentJob) {
        setActiveTab('analysis');
      }
    } catch (err) {
      setError('Erro ao processar o currículo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!currentJob || !currentResume) {
      setError('É necessário ter uma vaga e um currículo para fazer a análise');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeResumeCompatibility(currentResume, currentJob);
      saveAnalysis(analysis);
      setCurrentAnalysis(analysis);
      setActiveTab('results');
    } catch (err) {
      setError('Erro ao analisar o currículo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOptimized = async () => {
    if (!currentJob || !currentResume || !currentAnalysis) {
      setError('É necessário ter uma análise completa para gerar o currículo otimizado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const optimizedContent = await generateOptimizedResume(currentResume, currentJob, currentAnalysis);
      const optimized: OptimizedResume = {
        id: generateId(),
        originalResumeId: currentResume.id,
        jobId: currentJob.id,
        content: optimizedContent,
        improvements: currentAnalysis.improvements,
        createdAt: new Date()
      };

      saveOptimizedResume(optimized);
      setOptimizedResume(optimized);
      setActiveTab('download');
    } catch (err) {
      setError('Erro ao gerar currículo otimizado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: 'pdf' | 'docx') => {
    if (!optimizedResume) return;

    const blob = new Blob([optimizedResume.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculo-otimizado.${format === 'pdf' ? 'txt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analisador de Currículos
          </h1>
          <p className="text-lg text-gray-600">
            Otimize seu currículo para vagas específicas e aumente suas chances de sucesso
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="job" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Vaga</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Currículo</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </TabsTrigger>
          </TabsList>

          {/* Job Description Tab */}
          <TabsContent value="job">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Descrição da Vaga
                </CardTitle>
                <CardDescription>
                  Insira o link da vaga ou cole a descrição completa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={jobInputType === 'url' ? 'default' : 'outline'}
                    onClick={() => setJobInputType('url')}
                    className="flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Link da Vaga
                  </Button>
                  <Button
                    variant={jobInputType === 'text' ? 'default' : 'outline'}
                    onClick={() => setJobInputType('text')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Descrição
                  </Button>
                </div>

                {jobInputType === 'url' ? (
                  <div className="space-y-2">
                    <Label htmlFor="job-url">URL da Vaga</Label>
                    <Input
                      id="job-url"
                      placeholder="https://exemplo.com/vaga"
                      value={jobInput}
                      onChange={(e) => setJobInput(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="job-description">Descrição da Vaga</Label>
                    <Textarea
                      id="job-description"
                      placeholder="Cole aqui a descrição completa da vaga..."
                      value={jobInput}
                      onChange={(e) => setJobInput(e.target.value)}
                      rows={8}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleJobSubmit} 
                  disabled={loading || !jobInput.trim()}
                  className="w-full"
                >
                  {loading ? 'Processando...' : 'Analisar Vaga'}
                </Button>

                {currentJob && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      {currentJob.title} - {currentJob.company}
                    </h3>
                    <p className="text-blue-800 text-sm mb-3">
                      {currentJob.description.substring(0, 200)}...
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {currentJob.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Resume Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload do Currículo
                </CardTitle>
                <CardDescription>
                  Envie seu currículo em formato PDF ou DOCX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <Label htmlFor="resume-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-700">
                      Clique para enviar seu currículo
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Formatos aceitos: PDF, DOCX (máx. 10MB)
                    </p>
                  </Label>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {currentResume && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Currículo carregado: {currentResume.fileName}
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Arquivo processado com sucesso
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Análise de Compatibilidade
                </CardTitle>
                <CardDescription>
                  Compare seu currículo com os requisitos da vaga
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentJob && currentResume ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Vaga Selecionada</h3>
                        <p className="text-blue-800">{currentJob.title}</p>
                        <p className="text-blue-600 text-sm">{currentJob.company}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-2">Currículo</h3>
                        <p className="text-green-800">{currentResume.fileName}</p>
                        <p className="text-green-600 text-sm">
                          Enviado em {new Date(currentResume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleAnalyze} 
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? 'Analisando...' : 'Iniciar Análise'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Complete as etapas anteriores para iniciar a análise
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <div className="space-y-6">
              {currentAnalysis ? (
                <>
                  {/* Compatibility Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Score de Compatibilidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-center p-6 rounded-lg ${getCompatibilityBgColor(currentAnalysis.compatibilityScore)}`}>
                        <div className={`text-6xl font-bold ${getCompatibilityColor(currentAnalysis.compatibilityScore)} mb-2`}>
                          {currentAnalysis.compatibilityScore}%
                        </div>
                        <Progress 
                          value={currentAnalysis.compatibilityScore} 
                          className="w-full max-w-md mx-auto mb-4"
                        />
                        <p className="text-gray-700">
                          {currentAnalysis.compatibilityScore >= 80 ? 'Excelente compatibilidade!' :
                           currentAnalysis.compatibilityScore >= 60 ? 'Boa compatibilidade' :
                           'Compatibilidade pode ser melhorada'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          Pontos Fortes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Weaknesses */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-5 h-5" />
                          Pontos a Melhorar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {currentAnalysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Improvements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Lightbulb className="w-5 h-5" />
                        Dicas de Melhoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {currentAnalysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="text-center">
                    <Button 
                      onClick={handleGenerateOptimized}
                      disabled={loading}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {loading ? 'Gerando...' : 'Gerar Currículo Otimizado'}
                    </Button>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Execute a análise para ver os resultados
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Download Tab */}
          <TabsContent value="download">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Currículo Otimizado
                </CardTitle>
                <CardDescription>
                  Baixe seu currículo otimizado para a vaga
                </CardDescription>
              </CardHeader>
              <CardContent>
                {optimizedResume ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">
                          Currículo otimizado gerado com sucesso!
                        </span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Criado em {new Date(optimizedResume.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {optimizedResume.content}
                      </pre>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => handleDownload('pdf')}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                      <Button 
                        onClick={() => handleDownload('docx')}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download DOCX
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Gere o currículo otimizado para fazer o download
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}