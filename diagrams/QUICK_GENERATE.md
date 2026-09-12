# ⚡ Generación Rápida de Diagramas (2 minutos)

## 🚀 Método 1: Online (SIN instalación)

### PlantUML Online ⭐ RECOMENDADO

**1.** Ir a: **http://www.plantuml.com/plantuml/uml/**

**2.** Abrir cualquier archivo `.puml` del proyecto:
```
/diagrams/01-workflow-editorial.puml
/diagrams/02-arquitectura-sistema.puml
/diagrams/03-casos-de-uso.puml
etc.
```

**3.** Copiar TODO el contenido (Ctrl+A → Ctrl+C)

**4.** Pegar en el editor online (Ctrl+V)

**5.** La imagen aparece automáticamente ✨

**6.** Descargar:
   - Click derecho en la imagen → "Guardar imagen como..."
   - O usar botón "PNG" / "SVG" en la interfaz

**7.** ¡Listo! Repite para cada diagrama que necesites

---

### Mermaid Live ⭐ ALTERNATIVA

**1.** Ir a: **https://mermaid.live/**

**2.** Abrir cualquier archivo `.mmd` del proyecto:
```
/diagrams/mermaid/01-workflow-editorial.mmd
/diagrams/mermaid/02-arquitectura-sistema.mmd
etc.
```

**3.** Copiar TODO el contenido

**4.** Pegar en el editor

**5.** Click en "Actions" → "PNG" o "SVG"

**6.** ¡Descargado!

---

## 💻 Método 2: Local (CON instalación)

### Prerrequisitos (solo una vez):

**Linux/Mac:**
```bash
# Instalar PlantUML
sudo apt-get install plantuml  # Linux
brew install plantuml          # Mac

# Instalar Mermaid (opcional)
npm install -g @mermaid-js/mermaid-cli
```

**Windows:**
```cmd
# Instalar PlantUML
choco install plantuml

# Instalar Mermaid (opcional)
npm install -g @mermaid-js/mermaid-cli
```

### Generar TODOS los diagramas:

**Linux/Mac:**
```bash
cd diagrams
chmod +x generate-all.sh
./generate-all.sh
```

**Windows:**
```cmd
cd diagrams
generate-all.bat
```

**Resultado:** 
- Imágenes en `/diagrams/output/png/`
- Vectores en `/diagrams/output/svg/`

---

## 📦 Los 3 Esenciales

Si solo necesitas 3 diagramas, genera estos:

### 1️⃣ Workflow Editorial
```
Archivo: 01-workflow-editorial.puml
Para: Explicar el proceso de revisión
Usar en: Presentaciones, manual de usuario
```

### 2️⃣ Arquitectura del Sistema
```
Archivo: 02-arquitectura-sistema.puml
Para: Mostrar estructura técnica
Usar en: Documentación técnica, onboarding devs
```

### 3️⃣ Modelo de Datos
```
Archivo: 05-modelo-datos.puml
Para: Diseñar base de datos
Usar en: Documentación backend, desarrollo
```

---

## 🎯 Casos de Uso Rápidos

### Para una Presentación de 10 minutos:
**Generar:**
1. `01-workflow-editorial.png` (slide 2: "El Proceso")
2. `06-roles-permisos.png` (slide 3: "Quién hace qué")
3. `02-arquitectura-sistema.png` (slide 4: "Cómo funciona")

### Para un README de GitHub:
**Generar:**
1. `01-workflow-editorial.svg` (sección "Workflow")
2. `02-arquitectura-sistema.svg` (sección "Arquitectura")

### Para una Tesis/Informe:
**Generar TODOS en alta calidad:**
```bash
plantuml -tpng -DPLANTUML_LIMIT_SIZE=16384 diagrams/*.puml
```

---

## ⏱️ Tiempo Estimado

| Método | Tiempo | Resultado |
|--------|--------|-----------|
| Online (1 diagrama) | 1 min | 1 PNG/SVG |
| Online (todos) | 10 min | 7 PNG/SVG |
| Script local | 30 seg | 13 PNG + 13 SVG |

---

## 🎨 Calidad Recomendada

### Para PowerPoint:
- Formato: **PNG**
- Resolución: **Alta (usar `-DPLANTUML_LIMIT_SIZE=16384`)**
- Tamaño: 1200-1920px ancho

### Para Web/GitHub:
- Formato: **SVG**
- Ventaja: Escalable infinitamente
- Menor tamaño de archivo

### Para Impresión:
- Formato: **PDF** o **SVG**
- Comando: `plantuml -tpdf diagrams/01-workflow-editorial.puml`

---

## 🔥 Pro Tips

### Tip 1: Generar Solo 1 Diagrama
```bash
# PlantUML
plantuml -tpng diagrams/01-workflow-editorial.puml

# Resultado: 01-workflow-editorial.png en el mismo directorio
```

### Tip 2: Cambiar Tamaño
```bash
# PNG más grande (mejor calidad)
plantuml -tpng -DPLANTUML_LIMIT_SIZE=16384 diagrams/01-workflow-editorial.puml
```

### Tip 3: Generar Múltiples Formatos
```bash
# PNG + SVG + PDF al mismo tiempo
plantuml -tpng -tsvg -tpdf diagrams/01-workflow-editorial.puml
```

---

## 🆘 Solución de Problemas

### "No tengo PlantUML instalado"
✅ **Solución:** Usa http://www.plantuml.com/plantuml/ (online, sin instalación)

### "Las imágenes se ven borrosas"
✅ **Solución:** Usa SVG en vez de PNG, o aumenta resolución:
```bash
plantuml -tpng -DPLANTUML_LIMIT_SIZE=16384 archivo.puml
```

### "No aparece la imagen en mi documento"
✅ **Solución:** Verifica la ruta del archivo. Si está en `/diagrams/output/png/`, usa:
```markdown
![Diagrama](diagrams/output/png/01-workflow-editorial.png)
```

### "Quiero editar el diagrama"
✅ **Solución:** Edita el archivo `.puml` o `.mmd` y regenera la imagen

---

## 📋 Checklist Express

- [ ] Decidir método: ¿Online o Local?
- [ ] Si online: Copiar/pegar en http://www.plantuml.com/plantuml/
- [ ] Si local: Ejecutar `./generate-all.sh` o `generate-all.bat`
- [ ] Descargar imágenes
- [ ] Renombrar si es necesario
- [ ] Insertar en documento/presentación
- [ ] ✅ ¡DONE!

---

## 🎁 Bonus: Herramienta VS Code

Si usas VS Code, instala la extensión:
- **PlantUML** by jebbs

Luego:
1. Abre cualquier `.puml`
2. Presiona `Alt + D` para preview
3. Click derecho → "Export Current Diagram"
4. ¡Listo!

---

## 📞 Ayuda Rápida

**¿Método más fácil?**
→ http://www.plantuml.com/plantuml/ (copiar/pegar)

**¿Método más rápido?**
→ `./generate-all.sh` (todos de una vez)

**¿Mejor calidad?**
→ SVG (vectorial, escala infinita)

**¿Para presentación?**
→ PNG alta resolución

**¿Para web?**
→ SVG

---

## ⚡ TL;DR (Too Long, Didn't Read)

```bash
# LA FORMA MÁS RÁPIDA (online, 2 minutos):
1. Ir a http://www.plantuml.com/plantuml/
2. Copiar contenido de /diagrams/01-workflow-editorial.puml
3. Pegar en el editor
4. Descargar PNG
5. ¡LISTO!

# O CON SCRIPT (local, 30 segundos):
cd diagrams
./generate-all.sh  # Linux/Mac
# o
generate-all.bat   # Windows
```

---

**🎉 ¡Genera tus diagramas en menos de 2 minutos!**

**© 2026 FESC - Guía Rápida de Generación de Diagramas**
