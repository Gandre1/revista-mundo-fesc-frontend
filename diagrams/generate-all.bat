@echo off
REM Script para generar todas las imágenes de diagramas UML
REM Sistema de Gestión Editorial - Revista Mundo FESC

echo ==========================================
echo   Generador de Diagramas UML - FESC
echo ==========================================
echo.

REM Crear directorio de salida
set OUTPUT_DIR=output
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
if not exist "%OUTPUT_DIR%\png" mkdir "%OUTPUT_DIR%\png"
if not exist "%OUTPUT_DIR%\svg" mkdir "%OUTPUT_DIR%\svg"

echo Directorio de salida: %OUTPUT_DIR%
echo.

REM ====================================
REM OPCIÓN 1: PlantUML
REM ====================================

where plantuml >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] PlantUML encontrado
    echo Generando diagramas PlantUML...
    echo.
    
    REM Generar PNG
    echo   - Generando PNG alta resolucion...
    plantuml -tpng -DPLANTUML_LIMIT_SIZE=16384 -o "..\%OUTPUT_DIR%\png" *.puml
    
    REM Generar SVG
    echo   - Generando SVG vectorial...
    plantuml -tsvg -o "..\%OUTPUT_DIR%\svg" *.puml
    
    echo [OK] Diagramas PlantUML generados
    echo.
) else (
    echo [ERROR] PlantUML no encontrado
    echo   Instalar con: choco install plantuml
    echo   o descargar desde: https://plantuml.com/download
    echo.
)

REM ====================================
REM OPCIÓN 2: Mermaid CLI
REM ====================================

where mmdc >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Mermaid CLI encontrado
    echo Generando diagramas Mermaid...
    echo.
    
    cd mermaid
    
    REM Generar PNG
    echo   - Generando PNG...
    for %%f in (*.mmd) do (
        echo      * %%~nf
        mmdc -i "%%f" -o "..\%OUTPUT_DIR%\png\%%~nf.png" -b transparent 2>nul
    )
    
    REM Generar SVG
    echo   - Generando SVG...
    for %%f in (*.mmd) do (
        echo      * %%~nf
        mmdc -i "%%f" -o "..\%OUTPUT_DIR%\svg\%%~nf.svg" -b transparent 2>nul
    )
    
    cd ..
    
    echo [OK] Diagramas Mermaid generados
    echo.
) else (
    echo [ERROR] Mermaid CLI no encontrado
    echo   Instalar con: npm install -g @mermaid-js/mermaid-cli
    echo.
)

REM ====================================
REM RESUMEN
REM ====================================

echo.
echo ==========================================
echo       GENERACION COMPLETA
echo ==========================================
echo.

REM Contar archivos
for /f %%i in ('dir /b "%OUTPUT_DIR%\png\*.png" 2^>nul ^| find /c /v ""') do set PNG_COUNT=%%i
for /f %%i in ('dir /b "%OUTPUT_DIR%\svg\*.svg" 2^>nul ^| find /c /v ""') do set SVG_COUNT=%%i

echo Archivos generados:
echo   * PNG: %PNG_COUNT% archivos
echo   * SVG: %SVG_COUNT% archivos
echo.
echo Ubicacion: .\%OUTPUT_DIR%\
echo.

REM Listar archivos PNG
if exist "%OUTPUT_DIR%\png\*.png" (
    echo Archivos PNG generados:
    dir /b "%OUTPUT_DIR%\png\*.png" | findstr ".*"
    echo.
)

REM Listar archivos SVG
if exist "%OUTPUT_DIR%\svg\*.svg" (
    echo Archivos SVG generados:
    dir /b "%OUTPUT_DIR%\svg\*.svg" | findstr ".*"
    echo.
)

echo Recomendaciones:
echo   * PNG: Usar en presentaciones PowerPoint/Google Slides
echo   * SVG: Usar en documentos o web mejor calidad
echo.
echo Alternativas online si no tienes las herramientas:
echo   * PlantUML: http://www.plantuml.com/plantuml/
echo   * Mermaid:  https://mermaid.live/
echo.
echo ==========================================
echo       PROCESO COMPLETADO
echo ==========================================

pause
