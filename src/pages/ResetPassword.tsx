import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { BelugaLogo } from '@/components/BelugaLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve conter no mínimo 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: any) {
      setError(err?.message || 'Token inválido ou expirado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D5C] via-[#08293E] to-[#041520] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <BelugaLogo size="md" className="mb-3" />
          <h1 className="text-xl font-bold text-[#0B3D5C]">Definir Nova Senha</h1>
        </div>

        {success ? (
          <div className="text-center space-y-3 py-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-[#142A36]">Senha redefinida com sucesso!</p>
            <p className="text-xs text-[#5B6B78]">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">
                Nova senha
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-9 h-11 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passwordConfirm" className="text-xs font-semibold">
                Confirmar nova senha
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  className="pl-9 h-11 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !token}
              className="w-full h-12 bg-[#0B3D5C] hover:bg-[#125B7C] text-white font-semibold rounded-xl text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </Button>

            {!token && (
              <p className="text-center text-xs text-amber-600">
                Token de redefinição ausente na URL.
              </p>
            )}

            <Link
              to="/login"
              className="block text-center text-xs text-[#5B6B78] hover:text-[#0B3D5C] pt-2"
            >
              Cancelar e voltar para o login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
