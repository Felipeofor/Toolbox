const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

async function fetchJson (path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body.error || ''
    } catch (_) { /* ignore */ }
    const err = new Error(detail || `request failed: ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export function getFilesData (fileName) {
  const q = fileName ? `?fileName=${encodeURIComponent(fileName)}` : ''
  return fetchJson(`/files/data${q}`)
}

export function getFilesList () {
  return fetchJson('/files/list')
}
