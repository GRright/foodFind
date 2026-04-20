# 微信云函数批量部署脚本 (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  微信云函数批量部署工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$cloudfunctionsPath = Join-Path $PSScriptRoot "cloudfunctions"
Set-Location $cloudfunctionsPath

$dirs = Get-ChildItem -Directory
$count = 0
$success = 0
$fail = 0

foreach ($dir in $dirs) {
    $count++
    Write-Host "[$count] 正在部署: $($dir.Name)" -ForegroundColor Yellow
    
    $result = cloudbase functions:deploy $dir.Name --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 部署成功" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  ✗ 部署失败" -ForegroundColor Red
        $fail++
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "  总计: $count 个" -ForegroundColor White
Write-Host "  成功: $success 个" -ForegroundColor Green
if ($fail -gt 0) {
    Write-Host "  失败: $fail 个" -ForegroundColor Red
} else {
    Write-Host "  失败: $fail 个" -ForegroundColor Green
}
Write-Host "========================================" -ForegroundColor Cyan
