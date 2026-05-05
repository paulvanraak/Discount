import { useCheckStore } from '../../store/checkStore'
import QuestionSlider from './QuestionSlider'
import QuestionChoice from './QuestionChoice'

export default function CheckStep({ step }) {
  const { answers, setAnswer } = useCheckStore()
  const stepAnswers = answers[step.id] ?? {}

  return (
    <div>
      {step.questions.map((question) => {
        const value = stepAnswers[question.key]

        if (question.type === 'slider') {
          return (
            <QuestionSlider
              key={question.key}
              question={question}
              value={value}
              onChange={(v) => setAnswer(step.id, question.key, v)}
            />
          )
        }

        if (question.type === 'choice') {
          return (
            <QuestionChoice
              key={question.key}
              question={question}
              value={value}
              onChange={(v) => setAnswer(step.id, question.key, v)}
              answers={answers}
            />
          )
        }

        return null
      })}
    </div>
  )
}
