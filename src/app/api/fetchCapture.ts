export const fetchFaceAnalysis = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_PY_API_BASE

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_PY_API_BASE is not defined")
  }

  const res = await fetch(`${baseUrl}/analyze`, {
    method: "POST",
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}
