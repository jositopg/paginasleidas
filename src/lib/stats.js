export function computeStats(books) {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  const recent = books.filter(b => b.dateRead && new Date(b.dateRead) >= cutoff)

  const totalBooks = recent.length
  const totalPages = recent.reduce((s, b) => s + (b.pages || 0), 0)

  // Genre breakdown
  const genreCounts = {}
  recent.forEach(b => {
    if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1
  })
  const genres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: Math.round((count / totalBooks) * 100) }))

  // Avg rating
  const rated = recent.filter(b => b.rating)
  const avgRating = rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) : null

  // Authors
  const authors = new Set(recent.map(b => b.author).filter(Boolean))

  // Longest / shortest
  const withPages = recent.filter(b => b.pages)
  const longest = withPages.reduce((max, b) => b.pages > (max?.pages || 0) ? b : max, null)
  const shortest = withPages.reduce((min, b) => b.pages < (min?.pages || Infinity) ? b : min, null)

  // Languages
  const langs = [...new Set(recent.map(b => b.language).filter(Boolean))]

  // Books per month (last 12)
  const perMonth = {}
  for (let i = 0; i < 12; i++) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    perMonth[key] = 0
  }
  recent.forEach(b => {
    const d = new Date(b.dateRead)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in perMonth) perMonth[key]++
  })
  const bestMonth = Object.entries(perMonth).sort((a, b) => b[1] - a[1])[0]

  return {
    totalBooks,
    totalPages,
    genres,
    avgRating,
    authorsCount: authors.size,
    longest,
    shortest,
    langs,
    bestMonth: bestMonth?.[1] > 0 ? bestMonth : null,
    perMonth,
  }
}

export const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function formatMonthKey(key) {
  const [year, month] = key.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year.slice(2)}`
}
