import { useState, FormEvent } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import useAppStore from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Eye, EyeOff, Loader2, Wrench, ShieldCheck, Activity } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { registerUser, isAuthenticated } = useAuthStore()
  const { companyLogo, companyName } = useAppStore()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const isFormValid =
    name.length > 0 &&
    isValidEmail(email) &&
    password.length >= 6 &&
    password === confirmPassword &&
    role.length > 0

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast({
        title: 'Atenção',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: 'Atenção', description: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }
    if (!role) {
      toast({
        title: 'Atenção',
        description: 'Selecione um perfil de acesso.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    const success = await registerUser({ name, email, password, role })
    setIsLoading(false)

    if (success) {
      toast({
        title: 'Conta criada',
        description: 'Sua conta foi criada com sucesso! Faça login para continuar.',
      })
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Branding/Image (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-950 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.15)_0%,_transparent_40%),radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15)_0%,_transparent_40%)]" />

        <div className="relative z-10 flex items-center gap-3">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName || 'FieldOps Pro'}
              className="h-10 object-contain drop-shadow-md brightness-0 invert"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
          )}
          <span className="text-2xl font-bold tracking-tight">{companyName || 'FieldOps Pro'}</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
            Junte-se à revolução na gestão de operações.
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Crie sua conta e tenha acesso ao ERP completo para gerenciamento de ordens de serviço,
            manutenção predial, telecom e facilities.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-300">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              <span>Segurança e privacidade dos seus dados</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Gestão eficiente e em tempo real</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} {companyName || 'FieldOps Pro'}. Todos os direitos
          reservados.
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 md:p-16 bg-background overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6 my-auto">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-4">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName || 'FieldOps Pro'}
                className="h-10 object-contain drop-shadow-md"
              />
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                  <Wrench className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {companyName || 'FieldOps Pro'}
                </span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Criar Conta</h2>
            <p className="text-muted-foreground">
              Preencha os dados abaixo para se registrar no sistema.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil de Acesso</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="role-admin">Administrador</SelectItem>
                    <SelectItem value="role-supervisor">Supervisor</SelectItem>
                    <SelectItem value="role-tecnico">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Já possui uma conta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
