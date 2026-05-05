export const CHECK_STEPS = [
  {
    id: 'energie',
    title: 'Energie',
    icon: 'bolt',
    color: 'red',
    questions: [
      {
        key: 'monthly_cost',
        type: 'slider',
        label: 'Wat betaal je nu per maand voor stroom + gas?',
        min: 50, max: 400, step: 10, default: 180, unit: '€',
      },
      {
        key: 'contract_type',
        type: 'choice',
        label: 'Wat voor contract heb je nu?',
        options: [
          { value: 'variable', label: 'Variabel tarief' },
          { value: 'fixed_1yr', label: 'Vast 1 jaar' },
          { value: 'fixed_3yr', label: 'Vast 3 jaar' },
          { value: 'unknown', label: 'Geen idee' },
        ],
      },
    ],
  },
  {
    id: 'bank',
    title: 'Bankrekening',
    icon: 'account_balance',
    color: 'blue',
    questions: [
      {
        key: 'monthly_fee',
        type: 'slider',
        label: 'Wat betaal je per maand aan rekeningkosten?',
        min: 0, max: 30, step: 0.5, default: 3, unit: '€',
      },
      {
        key: 'current_bank',
        type: 'choice',
        label: 'Bij welke bank bank je nu?',
        options: [
          { value: 'ing', label: 'ING' },
          { value: 'rabo', label: 'Rabobank' },
          { value: 'abn', label: 'ABN AMRO' },
          { value: 'sns', label: 'SNS' },
          { value: 'other', label: 'Anders' },
        ],
      },
    ],
  },
  {
    id: 'telecom',
    title: 'Internet & mobiel',
    icon: 'smartphone',
    color: 'purple',
    questions: [
      {
        key: 'internet_cost',
        type: 'slider',
        label: 'Wat betaal je per maand voor thuisinternet?',
        min: 20, max: 100, step: 5, default: 55, unit: '€',
      },
      {
        key: 'mobile_cost',
        type: 'slider',
        label: 'En je mobiele abonnement?',
        min: 5, max: 60, step: 1, default: 22, unit: '€',
      },
    ],
  },
  {
    id: 'verzekering',
    title: 'Verzekeringen',
    icon: 'shield',
    color: 'amber',
    questions: [
      {
        key: 'car_insurance',
        type: 'slider',
        label: 'Wat betaal je per maand aan autoverzekering?',
        min: 0, max: 200, step: 5, default: 65, unit: '€',
        skippable: true, skipLabel: 'Ik heb geen auto',
      },
      {
        key: 'health_insurance',
        type: 'slider',
        label: 'En je zorgverzekering?',
        min: 100, max: 200, step: 5, default: 145, unit: '€',
      },
    ],
  },
  {
    id: 'beleggen',
    title: 'Beleggen',
    icon: 'trending_up',
    color: 'green',
    questions: [
      {
        key: 'invests',
        type: 'choice',
        label: 'Beleg je momenteel?',
        options: [
          { value: 'yes', label: 'Ja' },
          { value: 'no', label: 'Nee, nog niet' },
        ],
      },
      {
        key: 'platform',
        type: 'choice',
        label: 'Bij welk platform?',
        showIf: (answers) => answers.beleggen?.invests === 'yes',
        options: [
          { value: 'ing', label: 'ING' },
          { value: 'rabo', label: 'Rabobank' },
          { value: 'binck', label: 'Binck/Saxo' },
          { value: 'degiro', label: 'DEGIRO' },
          { value: 'bux', label: 'BUX' },
          { value: 'other', label: 'Anders' },
        ],
      },
    ],
  },
  {
    id: 'vpn',
    title: 'VPN',
    icon: 'language',
    color: 'pink',
    questions: [
      {
        key: 'has_vpn',
        type: 'choice',
        label: 'Gebruik je een VPN?',
        options: [
          { value: 'yes', label: 'Ja' },
          { value: 'no', label: 'Nee' },
          { value: 'considering', label: 'Overweeg het' },
        ],
      },
      {
        key: 'vpn_cost',
        type: 'slider',
        label: 'Wat betaal je per maand?',
        showIf: (answers) => answers.vpn?.has_vpn === 'yes',
        alwaysVisible: true,
        min: 0, max: 20, step: 1, default: 10, unit: '€',
      },
    ],
  },
]
