export const GENRES = [
  'Novela', 'Ensayo', 'Ciencia ficción', 'Fantasía', 'Thriller',
  'Biografía', 'Historia', 'Ciencia', 'Filosofía', 'Poesía',
  'Cómic/Manga', 'Autoayuda', 'Economía', 'Otros',
]

export function mapGoogleCategory(categories) {
  if (!categories?.length) return ''
  const raw = categories[0].toLowerCase()

  if (raw.includes('science fiction') || raw.includes('sci-fi')) return 'Ciencia ficción'
  if (raw.includes('fantasy')) return 'Fantasía'
  if (raw.includes('thriller') || raw.includes('mystery') || raw.includes('crime') || raw.includes('horror')) return 'Thriller'
  if (raw.includes('biography') || raw.includes('autobiography') || raw.includes('memoir')) return 'Biografía'
  if (raw.includes('history')) return 'Historia'
  if (raw.includes('science') || raw.includes('technology') || raw.includes('nature')) return 'Ciencia'
  if (raw.includes('philosophy') || raw.includes('ethics')) return 'Filosofía'
  if (raw.includes('poetry') || raw.includes('drama')) return 'Poesía'
  if (raw.includes('comic') || raw.includes('graphic novel') || raw.includes('manga')) return 'Cómic/Manga'
  if (raw.includes('self-help') || raw.includes('health') || raw.includes('body') || raw.includes('mind') || raw.includes('psychology')) return 'Autoayuda'
  if (raw.includes('business') || raw.includes('economic') || raw.includes('finance') || raw.includes('investment')) return 'Economía'
  if (raw.includes('essay') || raw.includes('literary criticism') || raw.includes('social science') || raw.includes('political')) return 'Ensayo'
  if (raw.includes('fiction') || raw.includes('literary')) return 'Novela'

  return ''
}
