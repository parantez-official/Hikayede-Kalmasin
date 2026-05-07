$svg = Get-Content -Path "assets/svg/harita.svg" -Raw -Encoding UTF8
$json = $svg | ConvertTo-Json -Compress
$out = "const turkiyeHaritasiSVG = $json;"
Set-Content -Path "js/harita.js" -Value $out -Encoding UTF8
