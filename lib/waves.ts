export const waveLabels = {
  'wave-0-founder': 'Wave 0, founder strike team',
  'wave-1-mobile-core': 'Wave 1, mobile core',
  'wave-2-alliance-pressure': 'Wave 2, alliance pressure',
  'wave-3-broader-market': 'Wave 3, broader market',
} as const;

export function getWaveLabel(wave: keyof typeof waveLabels) {
  return waveLabels[wave];
}
