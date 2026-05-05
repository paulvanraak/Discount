import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import { updateUserEmail } from '../../services/user'
import { supabase } from '../../services/supabase'

export default function EmailOptIn({ checkId }) {
  const { user } = useUser()
  const [email, setEmail] = useState('')
  const [reminderOptIn, setReminderOptIn] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !user?.id) return
    setLoading(true)
    setError('')
    try {
      await updateUserEmail(user.id, email, { reminder: reminderOptIn, marketing: false })
      await supabase.from('actions').insert({
        user_id: user.id,
        check_id: checkId !== 'local' ? checkId : null,
        action_type: 'email_optin',
      })
      setSubmitted(true)
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-successBg border border-success/20 rounded-xl p-6 text-center my-8">
        <span className="material-symbols-rounded text-success text-3xl">mark_email_read</span>
        <p className="font-medium text-ink-900 mt-2">
          Top — we sturen je overzicht en een reminder over 6 maanden.
        </p>
        <p className="text-sm text-ink-500 mt-1">Geen marketing. Uitschrijven met 1 klik.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-ink-100 rounded-xl p-6 my-8">
      <h3 className="font-semibold text-ink-900 mb-1">Mail me dit overzicht</h3>
      <p className="text-sm text-ink-500 mb-4">
        Plus een herinnering over 6 maanden — de markt verandert constant.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jouw@email.nl"
          required
          className="w-full border border-ink-100 rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-primary-500"
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={reminderOptIn}
            onChange={(e) => setReminderOptIn(e.target.checked)}
            className="mt-0.5 accent-primary-500"
          />
          <span className="text-sm text-ink-700">
            Ja, stuur me een herinnering over 6 maanden
          </span>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 rounded-md bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {loading ? 'Versturen…' : 'Stuur me dit overzicht'}
        </button>

        <p className="text-xs text-ink-500 text-center">
          Geen marketing-mails. Uitschrijven met 1 klik.
        </p>
      </form>
    </div>
  )
}
