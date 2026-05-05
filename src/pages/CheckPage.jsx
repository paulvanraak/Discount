import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckStore } from '../store/checkStore'
import { useUser } from '../context/UserContext'
import { CHECK_STEPS } from '../data/checkQuestions'
import { calculateSavings, calculateScore } from '../services/savings'
import { saveCheck } from '../services/check'
import CheckIntro from '../components/check/CheckIntro'
import CheckLayout from '../components/check/CheckLayout'
import CheckStep from '../components/check/CheckStep'

export default function CheckPage() {
  const [started, setStarted] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { user } = useUser()
  const { currentStep, answers, nextStep, prevStep, reset } = useCheckStore()

  if (!started) {
    return <CheckIntro onStart={() => setStarted(true)} />
  }

  const isLastStep = currentStep === CHECK_STEPS.length - 1

  async function handleNext() {
    if (isLastStep) {
      setSaving(true)
      try {
        const { results, totalSavings } = calculateSavings(answers)
        const score = calculateScore(results, totalSavings)
        const check = await saveCheck({
          userId: user?.id,
          answers,
          results,
          totalSavings,
          score,
        })
        reset()
        navigate(`/check/resultaten/${check.id}`)
      } catch (err) {
        console.error('Opslaan mislukt:', err)
        // Bereken wel, sla niet op — navigeer met lokale state
        const { results, totalSavings } = calculateSavings(answers)
        const score = calculateScore(results, totalSavings)
        navigate('/check/resultaten/local', {
          state: { results, totalSavings, score, answers },
        })
      } finally {
        setSaving(false)
      }
    } else {
      nextStep()
    }
  }

  return (
    <CheckLayout
      step={CHECK_STEPS[currentStep]}
      currentIndex={currentStep}
      total={CHECK_STEPS.length}
      onNext={saving ? undefined : handleNext}
      onPrev={prevStep}
      isLast={isLastStep}
      saving={saving}
    >
      <CheckStep step={CHECK_STEPS[currentStep]} />
    </CheckLayout>
  )
}
