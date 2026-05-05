import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatEuro } from '../../services/savings'
import { supabase } from '../../services/supabase'
import { useUser } from '../../context/UserContext'

const CATEGORY_META = {
  energie: { icon: 'bolt', label: 'Energie', slug: 'energie' },
  bank: { icon: 'account_balance', label: 'Bankrekening', slug: 'bankrekening' },
  telecom: { icon: 'smartphone', label: 'Internet & mobiel', slug: 'telecom' },
  verzekering: { icon: 'shield', label: 'Verzekeringen', slug: 'verzekering' },
  beleggen: { icon: 'trending_up', label: 'Beleggen', slug: 'beleggen' },
  vpn: { icon: 'language', label: 'VPN', slug: 'vpn-hosting' },
}

export default function ResultCategoryCard({ category, result, checkId }) {
  const [done, setDone] = useState(false)
  const { user } = useUser()
  const meta = CATEGORY_META[category] ?? { icon: 'savings', label: category, slug: category }

  async function markDone() {
    if (user?.id) {
      await supabase.from('actions').insert({
        user_id: user.id,
        check_id: checkId !== 'local' ? checkId : null,
        category,
        action_type: 'marked_done',
      })
    }
    setDone(true)
  }

  return (
    <div className={[
      'bg-white rounded-xl border p-5 transition-colors',
      done ? 'border-success/40 bg-successBg' : 'border-ink-100',
    ].join(' ')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-rounded text-primary-500 text-xl">{meta.icon}</span>
          </div>
          <div>
            <div className="font-medium text-ink-900 text-sm">{meta.label}</div>
            <div className="text-xs text-ink-500">
              {formatEuro(result.currentMonthly)}/mnd → {formatEuro(result.potentialMonthly)}/mnd
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-semibold text-primary-500">
            {formatEuro(result.yearlySaving)}
          </div>
          <div className="text-xs text-ink-500">per jaar</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <Link
          to={`/vergelijk/${meta.slug}`}
          className="flex-1 text-center py-2.5 rounded-md bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold transition-colors"
        >
          Vergelijk aanbieders →
        </Link>

        {done ? (
          <div className="flex items-center gap-1.5 text-success text-sm font-medium">
            <span className="material-symbols-rounded text-base">check_circle</span>
            Goed bezig — {formatEuro(result.yearlySaving)}/jaar bespaard
          </div>
        ) : (
          <button
            onClick={markDone}
            className="text-sm text-ink-500 hover:text-ink-700 flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-rounded text-base">check</span>
            Ik ben overgestapt
          </button>
        )}
      </div>
    </div>
  )
}
