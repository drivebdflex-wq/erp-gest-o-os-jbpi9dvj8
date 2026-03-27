import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import useAppStore from '@/stores/useAppStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ClipboardList } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isAuthenticated } = useAuthStore()
  const { companyLogo } = useAppStore()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(email, password)) {
      navigate('/')
    } else {
      toast({
        title: 'Falha no Login',
        description: 'E-mail ou senha incorretos.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        {companyLogo ? (
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-20 object-contain drop-shadow-md"
          />
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <ClipboardList className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              FieldOps <span className="text-primary">Pro</span>
            </span>
          </>
        )}
      </div>

      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
          <CardDescription>Insira suas credenciais para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar no Sistema
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-xs text-muted-foreground text-center">
          <p className="font-semibold mb-1">Contas de Demonstração:</p>
          <p>Admin: admin@fieldops.com / admin123</p>
          <p>Técnico: carlos@fieldops.com / tech123</p>
          <p>Financeiro: fin@fieldops.com / fin123</p>
        </CardFooter>
      </Card>
    </div>
  )
}
