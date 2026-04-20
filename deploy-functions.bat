@echo off
chcp 65001 >nul
echo ========================================
echo   微信云函数批量部署工具
echo ========================================
echo.

cd /d "%~dp0cloudfunctions"

set count=0
set success=0
set fail=0

for /d %%F in (*) do (
    set /a count+=1
    echo [%%count%%] 正在部署: %%~nxF
    cloudbase functions:deploy %%~nxF --force
    if errorlevel 1 (
        echo   ✗ 部署失败
        set /a fail+=1
    ) else (
        echo   ✓ 部署成功
        set /a success+=1
    )
    echo.
)

echo ========================================
echo   部署完成！
echo   总计: %count% 个
echo   成功: %success% 个
echo   失败: %fail% 个
echo ========================================
pause
