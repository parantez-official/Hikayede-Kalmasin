$file = "c:\Users\yukse\Desktop\Hikayede-Kalmasin-main\Hikayede-Kalmasin-main\admin.html"
$content = [System.IO.File]::ReadAllText($file)

# Change model to gemini-1.5-flash for maximum compatibility
$content = $content.Replace('gemini-2.0-flash', 'gemini-1.5-flash')
$content = $content.Replace('gemini-1.5-flash-latest', 'gemini-1.5-flash')

# Improve analyzeReportWithGemini robustness
$oldAnalyze = 'responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();'
$newAnalyze = 'responseText = responseText.replace(/```json/g, "").replace(/```/g, "").replace(/^json\s+/i, "").trim();'
$content = $content.Replace($oldAnalyze, $newAnalyze)

[System.IO.File]::WriteAllText($file, $content)
Write-Host "Done - Model changed to gemini-1.5-flash and robustness improved"
