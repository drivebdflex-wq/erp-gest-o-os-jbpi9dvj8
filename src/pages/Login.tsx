import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import useAppStore from '@/stores/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Eye, EyeOff, Loader2, Wrench, ShieldCheck, Activity } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login, isAuthenticated } = useAuthStore()
  const { companyLogo, companyName } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const isFormValid = isValidEmail(email) && password.length > 0

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      if (rememberMe) {
        localStorage.setItem('remembered_email', email)
      } else {
        localStorage.removeItem('remembered_email')
      }
      navigate('/')
    }

    setIsLoading(false)
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      toast({
        title: 'E-mail necessário',
        description: 'Preencha um e-mail válido para recuperar a senha.',
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Recuperação de Senha',
      description: 'As instruções foram enviadas para o seu e-mail.',
    })
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Branding/Image (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-950 text-white p-12 relative overflow-hidden">
        {/* Background decorative elements */}
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
            Gestão inteligente de operações em campo e manutenção.
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Um ERP completo para gerenciamento de ordens de serviço, com foco em manutenção predial,
            telecom e facilities.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-300">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              <span>Controle total de contratos e faturamento</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Monitoramento de equipes em tempo real</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} {companyName || 'FieldOps Pro'}. Todos os direitos
          reservados.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 md:p-16 lg:p-24 bg-background">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
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
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-muted-foreground">Insira suas credenciais para acessar sua conta.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha de acesso</Label>
                  <a
                    href="#"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Lembrar de mim
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Não possui uma conta?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Crie agora
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Contas de Demonstração:</p>
              <ul className="space-y-1">
                <li>
                  <span className="font-medium">Admin:</span> admin@example.com / admin123
                </li>
                <li>
                  <span className="font-medium">Técnico:</span> tech@example.com / tech123
                </li>
                <li>
                  <span className="font-medium">Supervisor:</span> ana@example.com / sup123
                </li>
                <li>
                  <span className="font-medium">Financeiro:</span> fin@example.com / fin123
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
