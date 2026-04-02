export function downloadImage(dataUri: string, prompt: string): void {
  const timestamp = new Date().toISOString().slice(0, 10)
  const slug = prompt.slice(0, 20).replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')
  const filename = `drawai-${timestamp}-${slug}.png`

  const link = document.createElement('a')
  link.href = dataUri
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
