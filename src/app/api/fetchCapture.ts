export const fetchFaceAnalysis = async () => {
  const res = await fetch("http://10.202.202.110:5000/analyze", {
    method: "POST",
  })

  const data = await res.json()
  return data
}
