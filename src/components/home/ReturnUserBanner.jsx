import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { getLatestCheck } from '../../services/user'
import { formatEuro } from '../../services/savings'

export default function ReturnUserBanner() {
  const { user } = useUser()
  const [latestCheck, setLatestCheck] = useState(null)

  useEffect(() => {
    if (user?.id) {
      getLatestCheck(user.id).then(setLatestCheck).catch(() => {})
    }
  }, [user])

  if (!latestCheck) return null

  return (
    <div className="bg-successBg border border-success/20 rounded-lg p-4 mx-4 sm:mx-auto max-w-5xl my-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-medium text-sm text-ink-900">Welkom terug</p>
          <p className="text-sm text-ink-500">
            Je potentiële besparing: {formatEuro(latestCheck.total_savings)}/jaar
          </p>
        </div>
        <Link
          to={`/check/resultaten/${latestCheck.id}`}
          className="text-primary-500 font-medium text-sm whitespace-nowrap hover:text-primary-600 transition-colors"
        >
          Bekijk resultaten →
        </Link>
      </div>
    </div>
  )
}
