import { create } from 'zustand'

export const useCheckStore = create((set) => ({
  currentStep: 0,
  answers: {},

  setAnswer: (categoryId, key, value) => set((state) => ({
    answers: {
      ...state.answers,
      [categoryId]: {
        ...state.answers[categoryId],
        [key]: value,
      }
    }
  })),

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  goToStep: (step) => set({ currentStep: step }),
  reset: () => set({ currentStep: 0, answers: {} }),
}))
