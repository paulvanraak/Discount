const MARKET_BENCHMARKS = {
  energie: {
    average_monthly: 195,
    cheapest_monthly: 142,
  },
  bank: {
    free_alternatives: ['bunq', 'revolut', 'n26'],
  },
  telecom: {
    avg_internet: 55,
    avg_mobile: 22,
    cheapest_internet: 38,
    cheapest_mobile: 12,
  },
  verzekering: {
    car_savings_pct: 0.18,
    health_savings_pct: 0.08,
  },
  vpn: {
    cheapest_monthly: 3.39,
  },
}

export function calculateSavings(answers) {
  const results = {}
  let total = 0

  // Energie
  if (answers.energie) {
    const current = answers.energie.monthly_cost ?? 180
    const cheapest = MARKET_BENCHMARKS.energie.cheapest_monthly
    const monthlySaving = Math.max(0, current - cheapest)
    const yearlySaving = monthlySaving * 12
    results.energie = {
      currentMonthly: current,
      potentialMonthly: cheapest,
      monthlySaving,
      yearlySaving,
      savable: yearlySaving > 50,
      easeOfSwitch: 'medium',
    }
    total += yearlySaving
  }

  // Bank
  if (answers.bank) {
    const fee = answers.bank.monthly_fee ?? 3
    const monthlySaving = Math.max(0, fee)
    const yearlySaving = monthlySaving * 12
    results.bank = {
      currentMonthly: fee,
      potentialMonthly: 0,
      monthlySaving,
      yearlySaving,
      savable: fee > 1,
      easeOfSwitch: 'easy',
    }
    total += yearlySaving
  }

  // Telecom
  if (answers.telecom) {
    const internet = answers.telecom.internet_cost ?? 55
    const mobile = answers.telecom.mobile_cost ?? 22
    const internetSaving = Math.max(0, internet - MARKET_BENCHMARKS.telecom.cheapest_internet)
    const mobileSaving = Math.max(0, mobile - MARKET_BENCHMARKS.telecom.cheapest_mobile)
    const yearlySaving = (internetSaving + mobileSaving) * 12
    results.telecom = {
      currentMonthly: internet + mobile,
      potentialMonthly: internet + mobile - internetSaving - mobileSaving,
      monthlySaving: internetSaving + mobileSaving,
      yearlySaving,
      savable: yearlySaving > 60,
      easeOfSwitch: 'medium',
    }
    total += yearlySaving
  }

  // Verzekering
  if (answers.verzekering) {
    const car = answers.verzekering.car_insurance ?? 0
    const health = answers.verzekering.health_insurance ?? 145
    const carSaving = car * MARKET_BENCHMARKS.verzekering.car_savings_pct
    const healthSaving = health * MARKET_BENCHMARKS.verzekering.health_savings_pct
    const yearlySaving = (carSaving + healthSaving) * 12
    results.verzekering = {
      currentMonthly: car + health,
      potentialMonthly: (car + health) - (carSaving + healthSaving),
      monthlySaving: carSaving + healthSaving,
      yearlySaving,
      savable: yearlySaving > 80,
      easeOfSwitch: 'medium',
    }
    total += yearlySaving
  }

  // Beleggen
  if (answers.beleggen?.invests === 'yes') {
    const traditionalPlatforms = ['ing', 'rabo', 'abn']
    if (traditionalPlatforms.includes(answers.beleggen.platform)) {
      const yearlySaving = 120
      results.beleggen = {
        currentMonthly: 10,
        potentialMonthly: 0,
        monthlySaving: 10,
        yearlySaving,
        savable: true,
        easeOfSwitch: 'medium',
      }
      total += yearlySaving
    }
  }

  // VPN
  if (answers.vpn?.has_vpn === 'yes') {
    const current = answers.vpn.vpn_cost ?? 10
    const cheapest = MARKET_BENCHMARKS.vpn.cheapest_monthly
    const monthlySaving = Math.max(0, current - cheapest)
    const yearlySaving = monthlySaving * 12
    results.vpn = {
      currentMonthly: current,
      potentialMonthly: cheapest,
      monthlySaving,
      yearlySaving,
      savable: yearlySaving > 30,
      easeOfSwitch: 'easy',
    }
    total += yearlySaving
  }

  return { results, totalSavings: Math.round(total) }
}

export function calculateScore(results, totalSavings) {
  if (totalSavings < 50) return 9.5
  if (totalSavings < 200) return 8.5
  if (totalSavings < 400) return 7.5
  if (totalSavings < 700) return 6.5
  if (totalSavings < 1000) return 5.5
  if (totalSavings < 1500) return 4.5
  return 3.5
}

export function sortByQuickWins(results) {
  const easeOrder = { easy: 0, medium: 1, hard: 2 }
  return Object.entries(results)
    .filter(([, r]) => r.savable)
    .sort((a, b) => {
      const easeDiff = easeOrder[a[1].easeOfSwitch] - easeOrder[b[1].easeOfSwitch]
      if (easeDiff !== 0) return easeDiff
      return b[1].yearlySaving - a[1].yearlySaving
    })
}

export function formatEuro(amount) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Legacy — gebruikt door bestaande VPN vergelijker
export function calculateVPNSavings(provider, plan = 'biennial') {
  const monthly = provider.price.monthly
  const chosen = provider.price[plan]
  return Math.round((monthly - chosen) * 24)
}
