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
  TrendingUp,
  User,
  Home,
  BarChart3,
  Target,
  Lightbulb,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Code,
  Info
} from 'lucide-react';
import { JobDescription, ResumeData, AnalysisResult, OptimizedResume, User as UserType, UserProfile, RegisterData } from '@/lib/types';
import { 
  saveJobDescription, 
  saveResume, 
  saveAnalysis, 
  saveOptimizedResume,
  getJobDescriptions,
  getResumes,
  getAnalyses,
  getOptimizedResumes,
  generateId,
  registerUser,
  loginUser,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  saveUserProfile,
  getUserProfile,
  shouldUpdateProfile
} from '@/lib/storage';
import { 
  analyzeResumeCompatibility, 
  extractTextFromFile, 
  parseJobDescription,
  generateOptimizedResume,
  extractProfileFromResume
} from '@/lib/resume-analyzer';

// Importar bibliotecas para download
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

function RegisterPage({ onBackToLogin, onRegisterSuccess }: { onBackToLogin: () => void, onRegisterSuccess: () => void }) {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const user = await registerUser(formData);
      if (user) {
        onRegisterSuccess();
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Criar Conta</CardTitle>
          <CardDescription>Preencha seus dados para se cadastrar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Rua, número, cidade - UF"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Sua senha"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={onBackToLogin}
              className="text-blue-600 hover:text-blue-800"
            >
              Já tem uma conta? Faça login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginPage({ onLogin, onShowRegister }: { onLogin: (user: UserType) => void, onShowRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verificar credenciais de demonstração
      if (email === 'admin@demo.com' && password === 'demo123') {
        const demoUser: UserType = {
          id: 'demo-user',
          email: 'admin@demo.com',
          name: 'Usuário Demo',
          phone: '(11) 99999-9999',
          address: 'São Paulo, SP',
          createdAt: new Date(),
          emailConfirmed: true
        };
        setCurrentUser(demoUser);
        onLogin(demoUser);
        return;
      }

      const user = await loginUser(email, password);
      if (user) {
        setCurrentUser(user);
        onLogin(user);
      } else {
        setError('E-mail ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Analisador de Currículos</CardTitle>
          <CardDescription>Faça login para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={onShowRegister}
              className="text-green-600 hover:text-green-800"
            >
              Não tem uma conta? Cadastre-se
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserProfileTab({ userProfile, onProfileUpdate }: { userProfile: UserProfile | null, onProfileUpdate: (profile: UserProfile) => void }) {
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    education: userProfile?.education || '',
    experience: userProfile?.experience || '',
    skills: userProfile?.skills?.join(', ') || '',
    certifications: userProfile?.certifications?.join(', ') || '',
    projects: userProfile?.projects?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Atualizar formData quando userProfile mudar
  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        education: userProfile.education || '',
        experience: userProfile.experience || '',
        skills: userProfile.skills?.join(', ') || '',
        certifications: userProfile.certifications?.join(', ') || '',
        projects: userProfile.projects?.join(', ') || ''
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    setLoading(true);
    setSuccess(false);

    const profileData = {
      userId: currentUser.id,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      education: formData.education,
      experience: formData.experience,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      certifications: formData.certifications.split(',').map(s => s.trim()).filter(s => s),
      projects: formData.projects.split(',').map(s => s.trim()).filter(s => s)
    };

    const savedProfile = await saveUserProfile(profileData);
    if (savedProfile) {
      onProfileUpdate(savedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Meu Perfil
        </CardTitle>
        <CardDescription>
          Complete seus dados para gerar currículos personalizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Seu nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Rua, número, cidade - UF"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Formação Acadêmica</Label>
          <Textarea
            id="education"
            value={formData.education}
            onChange={(e) => setFormData({...formData, education: e.target.value})}
            placeholder="Graduação em Ciência da Computação - Universidade XYZ (2020)"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experiência Profissional</Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            placeholder="Desenvolvedor Full Stack - Empresa ABC (2021-2024)..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
          <Textarea
            id="skills"
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
            placeholder="JavaScript, React, Node.js, Python, SQL"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certifications">Certificações (separadas por vírgula)</Label>
          <Textarea
            id="certifications"
            value={formData.certifications}
            onChange={(e) => setFormData({...formData, certifications: e.target.value})}
            placeholder="AWS Certified Developer, Google Cloud Professional"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projects">Projetos (separados por vírgula)</Label>
          <Textarea
            id="projects"
            value={formData.projects}
            onChange={(e) => setFormData({...formData, projects: e.target.value})}
            placeholder="Sistema de E-commerce, App Mobile de Delivery"
            rows={2}
          />
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Perfil salvo com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSave}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ResumeAnalyzer() {
  const [currentUser, setCurrentUserState] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('job');
  const [currentJob, setCurrentJob] = useState<JobDescription | null>(null);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobInput, setJobInput] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // MELHORIA 2: Carregar perfil salvo no login
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      // Carregar perfil do usuário automaticamente
      getUserProfile(user.id).then(profile => {
        if (profile) {
          setUserProfile(profile);
          // Mostrar mensagem para verificar perfil se estiver incompleto
          const hasIncompleteProfile = !profile.fullName || !profile.email || !profile.phone || 
                                     !profile.address || !profile.education || !profile.experience ||
                                     !profile.skills?.length;
          
          if (hasIncompleteProfile) {
            setProfileMessage('📋 Verifique a aba "Perfil" para completar seus dados e melhorar a análise do currículo.');
            setTimeout(() => setProfileMessage(null), 8000);
          }
        } else {
          // Se não tem perfil, mostrar mensagem
          setProfileMessage('📋 Complete seu perfil na aba "Perfil" para obter análises mais precisas.');
          setTimeout(() => setProfileMessage(null), 8000);
        }
      });
    }
  }, []);

  const handleLogin = (user: UserType) => {
    setCurrentUserState(user);
    setShowRegister(false);
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUserState(null);
    setUserProfile(null);
    setCurrentJob(null);
    setCurrentResume(null);
    setCurrentAnalysis(null);
    setOptimizedResume(null);
    setActiveTab('job');
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  if (!currentUser) {
    if (showRegister) {
      return (
        <RegisterPage 
          onBackToLogin={() => setShowRegister(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
    return (
      <LoginPage 
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  const handleJobSubmit = async () => {
    if (!jobInput.trim()) {
      setError('Por favor, insira a descrição da vaga ou URL');
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

      const currentUser = getCurrentUser();
      if (currentUser) {
        await saveJobDescription(job, currentUser.id);
      } else {
        saveJobDescription(job, 'demo-user');
      }
      
      setCurrentJob(job);
      setActiveTab('upload');
    } catch (err) {
      console.error('Erro ao processar vaga:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar a vaga. Tente novamente.';
      
      // Mensagens mais específicas para o usuário
      if (errorMessage.includes('Failed to fetch')) {
        setError('Não foi possível acessar a URL. Verifique se o link está correto e tente novamente.');
      } else if (errorMessage.includes('CORS')) {
        setError('Problema de acesso à URL. Tente copiar e colar o texto da vaga diretamente.');
      } else if (errorMessage.includes('timeout')) {
        setError('A URL demorou muito para responder. Tente novamente ou cole o texto da vaga.');
      } else {
        setError(errorMessage);
      }
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

      const currentUser = getCurrentUser();
      if (currentUser) {
        await saveResume(resume, currentUser.id);
      } else {
        saveResume(resume, 'demo-user');
      }
      
      setCurrentResume(resume);

      // MELHORIA 3: Só atualizar perfil se enviar novo currículo e se necessário
      try {
        const extractedProfile = await extractProfileFromResume(extractedText);
        
        // Verificar se deve atualizar o perfil
        if (extractedProfile && shouldUpdateProfile(userProfile, extractedProfile)) {
          // Mesclar dados extraídos com perfil existente (preservar dados existentes)
          const updatedProfile = {
            userId: currentUser?.id || 'demo-user',
            fullName: extractedProfile.fullName || userProfile?.fullName || '',
            email: extractedProfile.email || userProfile?.email || '',
            phone: extractedProfile.phone || userProfile?.phone || '',
            address: extractedProfile.address || userProfile?.address || '',
            education: extractedProfile.education || userProfile?.education || '',
            experience: extractedProfile.experience || userProfile?.experience || '',
            skills: extractedProfile.skills?.length ? extractedProfile.skills : (userProfile?.skills || []),
            certifications: extractedProfile.certifications?.length ? extractedProfile.certifications : (userProfile?.certifications || []),
            projects: extractedProfile.projects?.length ? extractedProfile.projects : (userProfile?.projects || [])
          };
          
          // MELHORIA 1: Salvar perfil atualizado (upsert - não cria nova linha)
          const savedProfile = await saveUserProfile(updatedProfile);
          if (savedProfile) {
            setUserProfile(savedProfile);
            
            // Verificar quais campos foram extraídos
            const extractedFields = [];
            if (extractedProfile.fullName) extractedFields.push('Nome');
            if (extractedProfile.email) extractedFields.push('E-mail');
            if (extractedProfile.phone) extractedFields.push('Telefone');
            if (extractedProfile.address) extractedFields.push('Endereço');
            if (extractedProfile.education) extractedFields.push('Formação');
            if (extractedProfile.experience) extractedFields.push('Experiência');
            if (extractedProfile.skills && extractedProfile.skills.length > 0) extractedFields.push('Habilidades');
            if (extractedProfile.certifications && extractedProfile.certifications.length > 0) extractedFields.push('Certificações');
            
            if (extractedFields.length > 0) {
              // Mostrar sucesso com campos extraídos
              setError(null);
              setProfileMessage(`✅ Perfil atualizado automaticamente com: ${extractedFields.join(', ')}. Verifique a aba "Perfil" para confirmar os dados.`);
              setTimeout(() => setProfileMessage(null), 8000);
            } else {
              // Mostrar alerta para preenchimento manual
              setProfileMessage('⚠️ Não foi possível extrair dados do currículo automaticamente. Por favor, preencha manualmente os campos na aba "Perfil".');
              setTimeout(() => setProfileMessage(null), 8000);
            }
          }
        } else if (userProfile) {
          // Se já tem perfil completo, apenas mostrar mensagem informativa
          setProfileMessage('📋 Currículo carregado! Seu perfil já está completo. Verifique a aba "Perfil" se desejar fazer ajustes.');
          setTimeout(() => setProfileMessage(null), 6000);
        } else {
          // Mostrar alerta para preenchimento manual
          setProfileMessage('⚠️ Não foi possível extrair dados do currículo automaticamente. Por favor, preencha manualmente os campos na aba "Perfil".');
          setTimeout(() => setProfileMessage(null), 8000);
        }
      } catch (profileError) {
        // Se falhar a extração do perfil, mostrar alerta
        setProfileMessage('⚠️ Não foi possível extrair dados do currículo automaticamente. Por favor, preencha manualmente os campos na aba "Perfil".');
        setTimeout(() => setProfileMessage(null), 8000);
      }
      
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
      
      const currentUser = getCurrentUser();
      if (currentUser) {
        await saveAnalysis(analysis, currentUser.id);
      } else {
        saveAnalysis(analysis, 'demo-user');
      }
      
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
      const optimizedContent = await generateOptimizedResume(currentResume, currentJob, currentAnalysis, userProfile || undefined);
      const optimized: OptimizedResume = {
        id: generateId(),
        originalResumeId: currentResume.id,
        jobId: currentJob.id,
        content: optimizedContent,
        improvements: currentAnalysis.improvements,
        createdAt: new Date()
      };

      const currentUser = getCurrentUser();
      if (currentUser) {
        await saveOptimizedResume(optimized, currentUser.id);
      } else {
        saveOptimizedResume(optimized, 'demo-user');
      }
      
      setOptimizedResume(optimized);
      setActiveTab('download');
    } catch (err) {
      setError('Erro ao gerar currículo otimizado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async (content: string, filename: string) => {
    try {
      const pdf = new jsPDF();
      const lines = content.split('\n');
      let yPosition = 20;
      
      lines.forEach((line) => {
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Verificar se é um título (linhas com ===)
        if (line.includes('===')) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          const title = line.replace(/=/g, '').trim();
          pdf.text(title, 20, yPosition);
          yPosition += 10;
        } else if (line.trim().startsWith('•')) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(line, 25, yPosition);
          yPosition += 6;
        } else if (line.trim()) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(line, 20, yPosition);
          yPosition += 6;
        } else {
          yPosition += 4;
        }
      });
      
      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback para download de texto
      downloadFile(content, filename.replace('.pdf', '.txt'));
    }
  };

  const downloadDOCX = async (content: string, filename: string) => {
    try {
      const lines = content.split('\n');
      const paragraphs = [];
      
      for (const line of lines) {
        if (line.includes('===')) {
          // Título
          const title = line.replace(/=/g, '').trim();
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: title, bold: true, size: 28 })],
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 }
            })
          );
        } else if (line.trim().startsWith('•')) {
          // Item de lista
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
              spacing: { after: 100 }
            })
          );
        } else if (line.trim()) {
          // Texto normal
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
              spacing: { after: 100 }
            })
          );
        } else {
          // Linha vazia
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
        }
      }
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });
      
      const buffer = await Packer.toBlob(doc);
      const url = URL.createObjectURL(buffer);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar DOCX:', error);
      // Fallback para download de texto
      downloadFile(content, filename.replace('.docx', '.txt'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Analisador de Currículos</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, {currentUser.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MELHORIA 3: Mensagem para verificar perfil */}
        {profileMessage && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {profileMessage}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="job" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Vaga
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Currículo
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Análise
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Descrição da Vaga
                </CardTitle>
                <CardDescription>
                  Cole a URL da vaga ou a descrição completa para análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-input">URL da vaga ou descrição</Label>
                  <Textarea
                    id="job-input"
                    placeholder="Cole aqui a URL da vaga (ex: https://empresa.gupy.io/jobs/123456) ou a descrição completa da vaga..."
                    value={jobInput}
                    onChange={(e) => setJobInput(e.target.value)}
                    rows={8}
                  />
                </div>
                
                <Button 
                  onClick={handleJobSubmit}
                  disabled={loading || !jobInput.trim()}
                  className="w-full"
                >
                  {loading ? 'Processando...' : 'Analisar Vaga'}
                </Button>

                {currentJob && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Vaga Processada</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Cargo:</strong> {currentJob.title}</p>
                      <p><strong>Empresa:</strong> {currentJob.company}</p>
                      <div>
                        <strong>Habilidades:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentJob.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload do Currículo
                </CardTitle>
                <CardDescription>
                  Envie seu currículo em PDF ou DOCX para análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload" className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-700">
                        Clique para enviar seu currículo
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Arquivos PDF ou DOCX até 10MB
                      </p>
                    </Label>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {currentResume && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Currículo Carregado</h3>
                    </div>
                    <p className="text-sm text-blue-700">
                      <strong>Arquivo:</strong> {currentResume.fileName}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Data:</strong> {currentResume.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <UserProfileTab 
              userProfile={userProfile}
              onProfileUpdate={handleProfileUpdate}
            />
          </TabsContent>

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
              <CardContent className="space-y-4">
                {!currentJob || !currentResume ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Pronto para análise
                    </h3>
                    <p className="text-gray-500">
                      {!currentJob && !currentResume 
                        ? 'Adicione uma vaga e faça upload do seu currículo para começar'
                        : !currentJob 
                        ? 'Adicione uma vaga para continuar'
                        : 'Faça upload do seu currículo para continuar'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Vaga Selecionada</h4>
                        <p className="text-sm text-blue-700">{currentJob.title} - {currentJob.company}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Currículo</h4>
                        <p className="text-sm text-green-700">{currentResume.fileName}</p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Iniciar Análise
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Resultados da Análise
                </CardTitle>
                <CardDescription>
                  Veja como seu currículo se alinha com a vaga
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!currentAnalysis ? (
                  <div className="text-center py-8">
                    <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Nenhuma análise disponível
                    </h3>
                    <p className="text-gray-500">
                      Execute a análise na aba anterior para ver os resultados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Score de Compatibilidade */}
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white mb-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{currentAnalysis.compatibilityScore}%</div>
                          <div className="text-sm">Compatibilidade</div>
                        </div>
                      </div>
                      <Progress value={currentAnalysis.compatibilityScore} className="w-full max-w-md mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Pontos Fortes */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 font-semibold text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          Pontos Fortes
                        </h4>
                        <ul className="space-y-2">
                          {currentAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pontos de Melhoria */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 font-semibold text-orange-700">
                          <TrendingUp className="w-5 h-5" />
                          Pontos de Melhoria
                        </h4>
                        <ul className="space-y-2">
                          {currentAnalysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Sugestões de Melhoria */}
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 font-semibold text-blue-700">
                        <Lightbulb className="w-5 h-5" />
                        Sugestões de Melhoria
                      </h4>
                      <ul className="space-y-2">
                        {currentAnalysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <Button 
                      onClick={handleGenerateOptimized}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Gerar Currículo Otimizado
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="download">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download dos Resultados
                </CardTitle>
                <CardDescription>
                  Baixe seu currículo otimizado e relatório de análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!optimizedResume ? (
                  <div className="text-center py-8">
                    <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Nenhum currículo otimizado disponível
                    </h3>
                    <p className="text-gray-500">
                      Complete a análise para gerar o currículo otimizado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">Currículo Otimizado Pronto!</h3>
                      </div>
                      <p className="text-sm text-green-700">
                        Seu currículo foi otimizado com base na análise de compatibilidade de {currentAnalysis?.compatibilityScore}%
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Button 
                          onClick={() => downloadPDF(optimizedResume.content, `curriculo-otimizado-${currentJob?.title?.replace(/\s+/g, '-').toLowerCase()}.pdf`)}
                          className="flex items-center gap-2"
                          size="lg"
                        >
                          <Download className="w-4 h-4" />
                          Baixar Currículo (.PDF)
                        </Button>

                        <Button 
                          onClick={() => downloadDOCX(optimizedResume.content, `curriculo-otimizado-${currentJob?.title?.replace(/\s+/g, '-').toLowerCase()}.docx`)}
                          className="flex items-center gap-2"
                          size="lg"
                          variant="outline"
                        >
                          <Download className="w-4 h-4" />
                          Baixar Currículo (.DOCX)
                        </Button>
                      </div>

                      {currentAnalysis && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const reportContent = `RELATÓRIO DE ANÁLISE DE CURRÍCULO\n\nVaga: ${currentJob?.title} - ${currentJob?.company}\nData da Análise: ${currentAnalysis.createdAt.toLocaleDateString()}\nScore de Compatibilidade: ${currentAnalysis.compatibilityScore}%\n\nPONTOS FORTES:\n${currentAnalysis.strengths.map(s => `• ${s}`).join('\n')}\n\nPONTOS DE MELHORIA:\n${currentAnalysis.weaknesses.map(w => `• ${w}`).join('\n')}\n\nSUGESTÕES DE MELHORIA:\n${currentAnalysis.improvements.map(i => `• ${i}`).join('\n')}\n\n---\nRelatório gerado pelo Analisador de Currículos`;
                            
                            downloadFile(reportContent, `relatorio-analise-${currentJob?.title?.replace(/\s+/g, '-').toLowerCase()}.txt`);
                          }}
                          className="flex items-center gap-2"
                          size="lg"
                        >
                          <FileText className="w-4 h-4" />
                          Baixar Relatório de Análise (.txt)
                        </Button>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Preview do Currículo Otimizado</h4>
                      <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {optimizedResume.content}
                        </pre>
                      </div>
                    </div>
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