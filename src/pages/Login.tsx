import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { BelugaLogo } from '@/components/BelugaLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'

export const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('belugapiscinassc@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err: any) {
      setError(
        err?.message || 'Falha ao autenticar. Verifique seu e-mail e senha e tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D5C] via-[#08293E] to-[#041520] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-white/10">
        {/* Logo e Cabeçalho */}
        <div className="flex flex-col items-center text-center mb-8">
          <BelugaLogo size="lg" className="mb-3" />
          <h1 className="text-xl font-bold text-[#0B3D5C] tracking-tight">
            Sistema de Orçamentos Comerciais
          </h1>
          <p className="text-xs text-[#5B6B78] mt-1 max-w-xs">
            Exclusivo para a equipe de vendas Beluga Piscinas. Crie e emita propostas premium em
            instantes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-[#142A36]">
              E-mail corporativo
            </Label>
            <div className="relative">
              <Mail className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@piscinasbeluga.com.br"
                className="pl-9 h-11 border-[#D6DEE4] focus:border-[#1CA0D8] text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-[#142A36]">
                Senha de acesso
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#1CA0D8] hover:underline font-medium"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 h-11 border-[#D6DEE4] focus:border-[#1CA0D8] text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#0B3D5C] hover:bg-[#125B7C] text-white font-semibold rounded-xl text-sm mt-2 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0B3D5C]/20"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Dica de login rápido demonstrativo */}
        <div className="mt-8 pt-6 border-t border-[#EDF1F4] text-center">
          <div className="text-[11px] text-[#5B6B78] font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2CA35C]" />
            <span>Acesso padrão pré-preenchido com credenciais oficiais</span>
          </div>
          <div className="text-[11px] text-[#5B6B78]/80 mt-1">
            Taquara/RS • Santa Catarina • (48) 99110-4301
          </div>
        </div>
      </div>
    </div>
  )
}
