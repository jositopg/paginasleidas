export const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function formatMonthKey(key) {
  const [year, month] = key.split('-')
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year.slice(2)}`
}

// Returns all years that have at least one "read" book
export function getReadYears(books) {
  const years = new Set(
    books
      .filter(b => b.status === 'read' && b.dateRead)
      .map(b => new Date(b.dateRead).getFullYear())
  )
  return [...years].sort((a, b) => b - a)
}

// Filter read books by year (null = all time)
function filterByYear(books, year) {
  const read = books.filter(b => b.status === 'read' && b.dateRead)
  if (year === null) return read
  return read.filter(b => new Date(b.dateRead).getFullYear() === year)
}

export function computeStats(books, year) {
  const filtered = filterByYear(books, year)
  const total = filtered.length

  if (total === 0) return null

  const totalPages = filtered.reduce((s, b) => s + (b.pages || 0), 0)

  // Genre breakdown
  const genreCounts = {}
  filtered.forEach(b => {
    if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1
  })
  const genres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))

  // Avg rating
  const rated = filtered.filter(b => b.rating)
  const avgRating = rated.length
    ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1)
    : null

  // Authors
  const authorsCount = new Set(filtered.map(b => b.author).filter(Boolean)).size

  // Most read author
  const authorCounts = {}
  filtered.forEach(b => {
    if (b.author) authorCounts[b.author] = (authorCounts[b.author] || 0) + 1
  })
  const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]

  // Longest / shortest
  const withPages = filtered.filter(b => b.pages)
  const longest = withPages.reduce((max, b) => (!max || b.pages > max.pages) ? b : max, null)
  const shortest = withPages.reduce((min, b) => (!min || b.pages < min.pages) ? b : min, null)

  // Languages
  const langs = [...new Set(filtered.map(b => b.language).filter(Boolean))]

  // Reading time stats
  const withDays = filtered.filter(b => b.daysToRead > 0)
  const avgDays = withDays.length
    ? Math.round(withDays.reduce((s, b) => s + b.daysToRead, 0) / withDays.length)
    : null
  const fastest = withDays.reduce((min, b) => (!min || b.daysToRead < min.daysToRead) ? b : min, null)
  const slowest = withDays.reduce((max, b) => (!max || b.daysToRead > max.daysToRead) ? b : max, null)

  // Best month
  const perMonth = {}
  filtered.forEach(b => {
    const d = new Date(b.dateRead)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    perMonth[key] = (perMonth[key] || 0) + 1
  })
  const bestMonthEntry = Object.entries(perMonth).sort((a, b) => b[1] - a[1])[0]

  return {
    total,
    totalPages,
    genres,
    avgRating,
    authorsCount,
    topAuthor: topAuthor?.[1] > 1 ? { name: topAuthor[0], count: topAuthor[1] } : null,
    longest,
    shortest: shortest !== longest ? shortest : null,
    langs,
    avgDays,
    fastest,
    slowest,
    bestMonth: bestMonthEntry || null,
  }
}
