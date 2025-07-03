export type DiagnosisType = "mental" | "action"

export interface DiagnosisResult {
  date: string
  result: string
}

export function saveDiagnosisResult(type: DiagnosisType, result: string) {
  const key = `diagnosis_${type}`
  const existing: DiagnosisResult[] = JSON.parse(localStorage.getItem(key) || "[]")

  const newEntry: DiagnosisResult = {
    date: new Date().toLocaleString("ja-JP"),
    result,
  }

  const updated = [newEntry, ...existing].slice(0, 2) // 最大2件まで保存
  localStorage.setItem(key, JSON.stringify(updated))
}
