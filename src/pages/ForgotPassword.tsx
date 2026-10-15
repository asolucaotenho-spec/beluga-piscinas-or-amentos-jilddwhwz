import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { BelugaLogo } from '@/components/BelugaLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await pb.collection('users').requestPasswordReset(email.trim())
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Não foi possível solicitar a redefinição de senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D5C] via-[#08293E] to-[#041520] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-white/10">
        <div className="flex flex-col items-center text-center mb-6">
          <BelugaLogo size="md" className="mb-3" />
          <h1 className="text-xl font-bold text-[#0B3D5C]">Recuperação de Senha</h1>
          <p className="text-xs text-[#5B6B78] mt-1">
            Digite seu e-mail cadastrado para receber as instruções de redefinição.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-[#142A36]">Instruções enviadas com sucesso!</p>
            <p className="text-xs text-[#5B6B78]">
              Se o e-mail informado estiver cadastrado em nossa base, você receberá um link seguro
              para redefinir sua senha.
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="outline" className="w-full h-11">
                Voltar para o login
              </Button>
            </Link>
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
              <Label htmlFor="email" className="text-xs font-semibold">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="pl-9 h-11 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0B3D5C] hover:bg-[#125B7C] text-white font-semibold rounded-xl text-sm"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-xs text-[#5B6B78] hover:text-[#0B3D5C] pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para o login</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
