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

        // alwaysVisible: toon altijd maar dim als conditie niet klopt
        const conditionMet = question.showIf ? question.showIf(answers) : true
        const dimmed = question.alwaysVisible && !conditionMet

        if (question.type === 'slider') {
          return (
            <QuestionSlider
              key={question.key}
              question={question}
              value={value}
              onChange={(v) => setAnswer(step.id, question.key, v)}
              dimmed={dimmed}
            />
          )
        }

        if (question.type === 'choice') {
          // Verberg choice-vragen als condite niet klopt (en niet alwaysVisible)
          if (question.showIf && !conditionMet && !question.alwaysVisible) return null
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
