#!/bin/bash

# Script para generar todas las imágenes de diagramas UML
# Sistema de Gestión Editorial - Revista Mundo FESC

echo "=========================================="
echo "  Generador de Diagramas UML - FESC"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Crear directorio de salida
OUTPUT_DIR="output"
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}📁 Directorio de salida: ${OUTPUT_DIR}${NC}"
echo ""

# ====================================
# OPCIÓN 1: PlantUML (Requiere plantuml instalado)
# ====================================

if command -v plantuml &> /dev/null; then
    echo -e "${GREEN}✅ PlantUML encontrado${NC}"
    echo -e "${BLUE}🎨 Generando diagramas PlantUML...${NC}"
    echo ""
    
    # Generar PNG (para presentaciones)
    echo "  → Generando PNG (alta resolución)..."
    plantuml -tpng -DPLANTUML_LIMIT_SIZE=16384 -o "../$OUTPUT_DIR/png" ./*.puml
    
    # Generar SVG (para documentos)
    echo "  → Generando SVG (vectorial)..."
    plantuml -tsvg -o "../$OUTPUT_DIR/svg" ./*.puml
    
    echo -e "${GREEN}✅ Diagramas PlantUML generados${NC}"
    echo ""
else
    echo -e "${RED}❌ PlantUML no encontrado${NC}"
    echo "   Instalar con: sudo apt-get install plantuml"
    echo "   o: brew install plantuml (macOS)"
    echo "   o: choco install plantuml (Windows)"
    echo ""
fi

# ====================================
# OPCIÓN 2: Mermaid CLI (Requiere mmdc)
# ====================================

if command -v mmdc &> /dev/null; then
    echo -e "${GREEN}✅ Mermaid CLI encontrado${NC}"
    echo -e "${BLUE}🎨 Generando diagramas Mermaid...${NC}"
    echo ""
    
    cd mermaid
    
    # Generar PNG
    echo "  → Generando PNG..."
    for file in *.mmd; do
        filename="${file%.mmd}"
        echo "     • $filename"
        mmdc -i "$file" -o "../$OUTPUT_DIR/png/$filename.png" -b transparent 2>/dev/null
    done
    
    # Generar SVG
    echo "  → Generando SVG..."
    for file in *.mmd; do
        filename="${file%.mmd}"
        echo "     • $filename"
        mmdc -i "$file" -o "../$OUTPUT_DIR/svg/$filename.svg" -b transparent 2>/dev/null
    done
    
    cd ..
    
    echo -e "${GREEN}✅ Diagramas Mermaid generados${NC}"
    echo ""
else
    echo -e "${RED}❌ Mermaid CLI no encontrado${NC}"
    echo "   Instalar con: npm install -g @mermaid-js/mermaid-cli"
    echo ""
fi

# ====================================
# RESUMEN
# ====================================

echo ""
echo "=========================================="
echo -e "${GREEN}✨ GENERACIÓN COMPLETA${NC}"
echo "=========================================="
echo ""

# Contar archivos generados
PNG_COUNT=$(find "$OUTPUT_DIR/png" -name "*.png" 2>/dev/null | wc -l)
SVG_COUNT=$(find "$OUTPUT_DIR/svg" -name "*.svg" 2>/dev/null | wc -l)

echo "📊 Archivos generados:"
echo "   • PNG: $PNG_COUNT archivos"
echo "   • SVG: $SVG_COUNT archivos"
echo ""
echo "📁 Ubicación: ./$OUTPUT_DIR/"
echo ""

# Listar archivos generados
if [ "$PNG_COUNT" -gt 0 ]; then
    echo "🖼️  Archivos PNG generados:"
    ls -1 "$OUTPUT_DIR/png/" 2>/dev/null | sed 's/^/   • /'
    echo ""
fi

if [ "$SVG_COUNT" -gt 0 ]; then
    echo "🎨 Archivos SVG generados:"
    ls -1 "$OUTPUT_DIR/svg/" 2>/dev/null | sed 's/^/   • /'
    echo ""
fi

# Recomendaciones
echo "💡 Recomendaciones:"
echo "   • PNG: Usar en presentaciones PowerPoint/Google Slides"
echo "   • SVG: Usar en documentos LaTeX o web (mejor calidad)"
echo ""
echo "🌐 Alternativas online si no tienes las herramientas:"
echo "   • PlantUML: http://www.plantuml.com/plantuml/"
echo "   • Mermaid:  https://mermaid.live/"
echo ""
echo "=========================================="
echo -e "${GREEN}✅ PROCESO COMPLETADO${NC}"
echo "=========================================="
