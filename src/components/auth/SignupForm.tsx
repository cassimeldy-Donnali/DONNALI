import React, { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'

interface SignupFormProps {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user && !data.session) {
        setConfirmed(true)
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-auth-email`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: {
                email,
                user_metadata: { full_name: fullName },
              },
              email_data: {
                email_action_type: 'signup',
                token_hash: data.user.confirmation_sent_at ?? '',
                redirect_to: `${window.location.origin}/`,
              },
            }),
          },
        ).catch(() => {})
      } else {
        onSuccess?.()
      }
    } catch {
      setError('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="text-center py-2 space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-ocean-50 flex items-center justify-center">
            <Mail className="w-8 h-8 text-ocean-500" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Vérifiez votre boîte mail</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un email de confirmation a été envoyé à <strong className="text-ocean-600">{email}</strong>.
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>
        </div>
        <div className="bg-eco-50 rounded-xl border border-eco-200 px-4 py-3 text-left">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-eco-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-eco-700 leading-relaxed">
              Le lien est valide 24h. Pensez à vérifier vos spams si vous ne trouvez pas l'email.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Nom complet"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        disabled={loading}
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        minLength={6}
      />

      <Button type="submit" loading={loading} className="w-full">
        Créer mon compte
      </Button>
    </form>
  )
}