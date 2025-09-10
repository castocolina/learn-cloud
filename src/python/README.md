# Python AI Prompt Management System

A comprehensive suite of Python tools for managing, executing, and maintaining AI prompts with advanced state management, real-time execution metrics, and intelligent content processing.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Main Entry Points](#main-entry-points)
- [Quick Start Guide](#quick-start-guide)
- [Advanced Features](#advanced-features)
- [Utility Scripts](#utility-scripts)
- [Configuration](#configuration)
- [State Management](#state-management)
- [Contributing](#contributing)

## Overview

This Python system provides a complete solution for managing AI prompts across multiple AI agents (Claude, Gemini) with sophisticated features including:

- **Intelligent Prompt Execution**: Context-aware execution with scope management (single vs per-unit)
- **Real-time Progress Tracking**: Live execution metrics with time estimation
- **State Persistence**: Resume execution from where it left off
- **Multi-agent Support**: Seamless integration with Claude and Gemini APIs
- **Content Processing**: Automated HTML/CSS validation and Mermaid diagram cleaning
- **YAML Management**: Advanced YAML formatting with multiline support

## Key Features

### 🚀 Enhanced Execution Engine
- **Real-time Metrics**: Live progress bars with time estimation
- **Scope-aware Execution**: Differentiate between single and per-unit prompts
- **Stateful Resumption**: Automatically resume from partial executions
- **Rate Limit Handling**: Intelligent handling of API rate limits
- **Fallback Models**: Automatic model switching when limits are reached

### 🎮 Advanced User Interface
- **Enhanced TUI**: Modern terminal interface with rich interactions
- **Interactive Menus**: Intuitive prompt selection and management
- **Progress Visualization**: Real-time execution progress with detailed metrics
- **Text Wrapping**: Optimized display for long content in terminal

### 💾 Robust State Management
- **Persistent States**: Execution state preserved across sessions
- **Granular Tracking**: Unit-level progress tracking for per-unit prompts
- **Metadata Storage**: Results stored in YAML prompt metadata
- **Recovery Options**: Multiple resumption strategies (restart, resume, skip)

### 📄 Advanced YAML Processing
- **Multiline Support**: Intelligent YAML formatting with folded style optimization
- **Text Preprocessing**: Automatic text wrapping and formatting
- **Configuration Management**: Centralized configuration with validation

## System Architecture

```
src/python/
├── prompt_executor.py          # 🚀 Main execution entry point
├── prompt_manager.py           # 🤖 Complete prompt management system
├── prompt_utils/               # 📦 Core utilities package
│   ├── __init__.py             #   Package initialization
│   ├── config_manager.py       #   ⚙️ YAML configuration management
│   ├── yaml_utils.py           #   📄 YAML processing utilities
│   ├── state_manager.py        #   💾 State persistence and management
│   ├── execution_engine.py     #   ⚡ Advanced execution engine
│   ├── enhanced_tui.py         #   🎮 Enhanced terminal interface
│   ├── tui_interface.py        #   📱 Base TUI components
│   ├── agent_handlers.py       #   🤖 Agent-specific handlers
│   ├── unified_schema.py       #   🔄 Unified data schemas
│   └── utils.py                #   🔧 General utilities
├── clean_mermaid_scripts.py    # 🧹 Mermaid diagram cleaner
├── fix_html_errors.py          # 🔧 HTML error fixer
├── fix_code_entities.py        # 📝 Code entity fixer
├── remove_duplicate_modals.py  # 🗑️ Modal deduplicator
└── restore_mermaid_entities.py # 🔄 Mermaid entity restorer
```

## Main Entry Points

### 1. `prompt_executor.py` - AI Prompt Execution Engine

The primary entry point for executing AI prompts with advanced features.

```bash
# Run the enhanced prompt executor
python src/python/prompt_executor.py

# Or using the Makefile
make prompt-executor
```

**Features:**
- Real-time execution metrics with progress bars
- Intelligent resumption from partial executions
- Multi-agent support (Claude, Gemini)
- Scope-aware execution (single vs per-unit)
- Rate limit handling with automatic retries

### 2. `prompt_manager.py` - Comprehensive Prompt Management

Complete CLI tool for prompt lifecycle management.

```bash
# Interactive prompt management
python src/python/prompt_manager.py

# List existing prompts
python src/python/prompt_manager.py --list

# Show specific prompt details
python src/python/prompt_manager.py --show PROMPT_ID

# Format YAML configuration
python src/python/prompt_manager.py --format
```

**Features:**
- Interactive prompt generation with AI agents
- YAML configuration management
- Prompt validation and formatting
- Advanced text wrapping for terminal display
- Comprehensive prompt editing capabilities

## Quick Start Guide

### 1. Setup Environment

```bash
# Navigate to the project root
cd /path/to/learn-cloud

# Ensure Python virtual environment (if using)
source .venv/bin/activate  # or your preferred method

# Install dependencies (if needed)
pip install pyyaml  # Core dependency
```

### 2. Configure Prompts

Edit your prompt configuration in `src/conf/agent_prompts.yaml`:

```yaml
prompts:
- id: EXAMPLE
  prompt: "Your AI prompt text here..."
  agent_name: claude
  model: sonnet
  execution_scope: single  # or 'per-unit'
  status: enabled
  metadata:
    execution: {}  # Automatically populated
```

### 3. Execute Prompts

```bash
# Run the prompt executor
python src/python/prompt_executor.py

# Follow the interactive menu:
# 1. Select agent (Claude/Gemini)
# 2. Choose scope (All/Single/Per-unit)
# 3. Select prompts to execute
# 4. Monitor real-time progress
```

### 4. Manage Prompts

```bash
# Launch prompt manager
python src/python/prompt_manager.py

# Use interactive menu for:
# - Creating new prompts
# - Editing existing prompts
# - Formatting YAML files
# - Validating configurations
```

## Advanced Features

### Real-time Execution Metrics

The system provides comprehensive real-time feedback during execution:

```
🚀 [████████████████░░░░░░░░░░░░░░░░░░░░░░░░] 60.0% | ⏱️  2m 30s elapsed | ⏳ 1m 45s remaining | ✅ 6/10 | 📋 AI Teaching Tool | 🎯 unit7
```

Features include:
- **Progress Bar**: Visual representation of completion status
- **Time Tracking**: Elapsed time and intelligent remaining time estimation
- **Task Counter**: Completed vs total tasks
- **Current Context**: Shows active prompt and unit being processed

### Stateful Resumption

The system automatically tracks execution state and offers resumption options:

```
🔄 Resumption Options for [PROMPT_ID]:
   📊 Current status: partial
   📈 Progress: 8 completed, 1 failed, 2 pending

Choose action:
  1. 🔄 Restart (clear all state and start fresh)
  2. ▶️  Resume (continue from last state)
  3. ⏭️  Skip (skip this prompt)
```

### YAML Optimization

Advanced YAML processing ensures clean, readable configuration files:

- **Multiline Formatting**: Intelligent use of folded (`>`) and literal (`|`) styles
- **Text Wrapping**: Automatic text wrapping at 120 characters
- **Blank Line Optimization**: Reduces excessive whitespace
- **Consistent Formatting**: Maintains readability across large files

## Utility Scripts

The system includes specialized utility scripts for content maintenance:

### `clean_mermaid_scripts.py`
Cleans and optimizes Mermaid diagram scripts in HTML files.

```bash
python src/python/clean_mermaid_scripts.py path/to/file.html
```

### `fix_html_errors.py`
Automatically fixes common HTML validation errors.

```bash
python src/python/fix_html_errors.py path/to/file.html
```

### `fix_code_entities.py`
Fixes HTML entity encoding issues in code blocks.

```bash
python src/python/fix_code_entities.py path/to/file.html
```

### `remove_duplicate_modals.py`
Removes duplicate modal definitions from HTML files.

```bash
python src/python/remove_duplicate_modals.py path/to/file.html
```

### `restore_mermaid_entities.py`
Restores proper HTML entities in Mermaid diagrams.

```bash
python src/python/restore_mermaid_entities.py path/to/file.html
```

## Configuration

### Main Configuration File: `src/conf/agent_prompts.yaml`

The system uses a unified YAML schema for prompt configuration:

```yaml
prompts:
- id: UNIQUE_ID
  short_name: "Brief descriptive name"
  short_description: "One-line description"
  prompt: "Complete AI prompt text..."
  agent_name: claude  # or gemini
  model: sonnet      # or specific model
  execution_scope: single  # or per-unit
  status: enabled    # enabled, draft, disabled
  framework: "CoT"   # Chain of Thought, Plan-and-Solve, etc.
  fallback_model: flash  # Optional fallback
  metadata:
    execution: {}    # Automatically managed
    edit: {}         # Edit history
```

### Execution Scopes

- **`single`**: Execute once for the entire project
- **`per-unit`**: Execute separately for each unit directory (`src/book/unit*`)

### Agent Configuration

- **Claude**: 5-hour rate limits with automatic reset detection
- **Gemini**: Daily rate limits with midnight reset
- **Fallback Models**: Automatic switching when primary models hit limits

## State Management

### Persistent State Files

The system maintains state in the `tmp/states/` directory:

- `{agent}_state.json`: Agent-specific rate limit state
- `{agent}_executions.json`: Detailed execution history
- `progress_state.json`: Current execution progress

### Metadata Storage

Execution results are stored directly in the prompt's YAML metadata:

```yaml
metadata:
  execution:
    claude:
      last_executed: "2024-01-15T10:30:00"
      status: "completed"  # completed, failed, partial, never_run
      executions:
        unit1:
          status: "completed"
          timestamp: "2024-01-15T10:30:00"
          duration: 45.2
          result_summary: "Successfully processed..."
```

### Recovery Strategies

- **Restart**: Clear all state and begin fresh execution
- **Resume**: Continue from the last saved state
- **Skip**: Skip the current prompt and move to the next

## Contributing

### Code Style
- Follow PEP 8 Python style guidelines
- Use type hints where appropriate
- Include comprehensive docstrings
- Maintain backward compatibility

### Testing
```bash
# Run system tests (when available)
python tmp/test_system.py

# Test specific components
python -m unittest discover -s src/python/prompt_utils -p "*test*.py"
```

### Documentation
- Update this README when adding new features
- Document new configuration options
- Include usage examples for new utilities

---

**Note**: This system is designed to work within the learn-cloud project structure and expects the presence of `src/book/unit*` directories for per-unit execution and `src/conf/agent_prompts.yaml` for configuration.
```
🚀 [████████████████░░░░░░░░░░░░░░░░░░░░░░░░] 60.0% | ⏱️  2m 30s elapsed | ⏳ 1m 45s remaining | ✅ 6/10 | 📋 AI Teaching Tool | 🎯 unit7
```

### Opciones de Reanudación
```
🔄 Resumption Options for [EATT]:
   📊 Current status: partial
   📈 Progress: 8 completed, 1 failed, 2 pending

Choose action:
  1. 🔄 Restart (clear all state and start fresh)
  2. ▶️  Resume (continue from last state)
  3. ⏭️  Skip (skip this prompt)
```

## 📊 Métricas en Tiempo Real Enhanced v2.0

### Características de las Métricas
- **⏱️ Tiempo Transcurrido**: Tiempo total desde el inicio de la ejecución
- **⏳ Tiempo Estimado Restante**: Calculado dinámicamente basado en:
  - Promedio de duración de las últimas 5 tareas completadas
  - Número de tareas restantes
  - Actualización continua conforme se completan tareas
- **📈 Barra de Progreso Visual**: Representación gráfica del progreso
- **🎯 Estado Actual**: Muestra el prompt y unidad siendo procesados
- **✅ Contador de Progreso**: Tareas completadas vs total

### Ejemplo de Progreso en Tiempo Real
```
Durante la ejecución se muestra:
🚀 [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25.0% | ⏱️  45s elapsed | ⏳ 2m 15s remaining | ✅ 3/12 | 📋 Code Analyzer | 🎯 unit3

Al completar:
🏁 Execution Complete!
   ⏱️  Total time: 3m 42s
   📊 Total executions: 12
   ✅ Completed: 11
   ❌ Failed: 1
   🎯 Success rate: 91.7%
```o estimado restante
- **⏱️ Estimación Inteligente**: Cálculo dinámico basado en el promedio de tareas completadas
- **📈 Barras de Progreso**: Visualización en tiempo real del progreso de ejecución
- **🎯 Flujo de Menú Mejorado**: 'Todos los Alcances' como opción por defecto
- **🔄 Ejecución con Reanudación**: Resume automáticamente desde el último estado
- **📊 Seguimiento de Estado Avanzado**: Tracking granular de execuciones por unidad
- **🎯 Detección Dinámica de Unidades**: Escaneo automático de `src/book/unit*`
- **⚡ Re-ejecución Inteligente**: Opciones de restart, resume, o skip por prompt
- **💾 Resultados Persistentes**: Almacenamiento en metadatos YAML del prompt
- **🧠 Ejecución Consciente de Alcance**: Single vs per-unit con resumption Enhanced Version

Sistema Python avanzado para ejecutar prompts de IA con gestión inteligente de límites, estados persistentes, reanudación automática, y capacidades de re-ejecución.

## 🚀 Uso Rápido

```bash
# Ejecutar el sistema unificado con capacidades mejoradas
make prompt-executor

# Editor YAML con formato multiline
make agent-prompts-edit list      # Listar prompts
make agent-prompts-edit format    # Formatear YAML
make agent-prompts-edit show EATT # Mostrar prompt específico

# Ejecutar tests del sistema
python3 tmp/test_system.py
```

## 🎯 Características Principales

### ✨ Nuevas Características Enhanced

- **� Ejecución con Reanudación**: Resume automáticamente desde el último estado
- **📊 Seguimiento de Estado Avanzado**: Tracking granular de execuciones por unidad
- **🎯 Detección Dinámica de Unidades**: Escaneo automático de `src/book/unit*`
- **⚡ Re-ejecución Inteligente**: Opciones de restart, resume, o skip por prompt
- **💾 Resultados Persistentes**: Almacenamiento en metadatos YAML del prompt
- **🧠 Ejecución Consciente de Alcance**: Single vs per-unit con resumption

### 🏗️ Características Base

- **Multi-agente**: Soporte para Claude y Gemini con lógicas específicas
- **Gestión de límites**: Claude (5h) vs Gemini (diario) con espera automática
- **Estados persistentes**: Resume desde donde se quedó cada agente
- **TUI moderna**: Interface amigable con opciones de reanudación
- **Ejecución robusta**: Retry automático y manejo de errores
- **Editor YAML**: Formato multiline amigable con `>-` style
- **Integración Makefile**: Comandos simplificados desde make

## 🎯 Flujo de Uso Enhanced v2.0

1. **Selección de Agente**: Elige Claude o Gemini (modo exclusivo)
2. **Filtro de Alcance Mejorado**: Selecciona el alcance de ejecución:
   - 🌐 **Todos los Prompts** (opción por defecto - presiona Enter)
   - 🎯 **Solo Ejecución Simple**: Prompts de alcance single
   - 📋 **Solo Per-Unidad**: Prompts que se ejecutan por unidad
3. **Vista de Estados**: Muestra prompts con estado de ejecución detallado
4. **Opciones de Reanudación**: Para prompts con ejecuciones previas:
   - 🔄 **Restart**: Reiniciar desde cero
   - ▶️ **Resume**: Continuar desde último estado
   - ⏭️ **Skip**: Omitir este prompt
5. **Selección Múltiple**: Elige qué prompts ejecutar
6. **Ejecución con Métricas en Tiempo Real**:
   - 📊 Barra de progreso visual en tiempo real
   - ⏱️ Tiempo transcurrido y estimado restante
   - 🎯 Estado actual del prompt y unidad
   - ✅ Contador de tareas completadas/totales
7. **Resumen Final**: Estadísticas completas con métricas de tiempo
7. **Resultados Detallados**: Estadísticas completas por prompt y unidad

## 📁 Arquitectura Organizada Enhanced

```
src/python/
├── prompt_executor.py          # 🚀 Punto de entrada principal
├── prompt_manager.py           # 🤖 Complete prompt management system
├── [utility scripts...]        # Various utility scripts
└── prompt_utils/               # 📦 Enhanced prompt utilities package
    ├── __init__.py             #   Package initialization
    ├── config_manager.py       #   ⚙️ YAML configuration management
    ├── yaml_utils.py           #   📄 Shared YAML utilities
    ├── state_manager.py        #   💾 Enhanced state management with resumption
    ├── execution_engine.py     #   ⚡ Advanced execution engine with scope awareness
    ├── enhanced_tui.py         #   🎮 Enhanced terminal interface with resumption
    ├── utils.py                #   🔧 General utilities
    └── agent_handlers/         #   🤖 Agent-specific handlers
        ├── base_handler.py     #     Clase base
        ├── claude_handler.py   #     Handler Claude + límites 5h
        └── gemini_handler.py   #     Handler Gemini + límites diarios
```

## 💾 Estados Persistentes Enhanced

### Archivos de Estado
- `tmp/states/{agent}_state.json`: Estado de límites por agente
- `tmp/states/{agent}_executions.json`: Historial detallado de ejecuciones
- `tmp/states/progress_state.json`: Estado de progreso actual

### Metadatos YAML
Los resultados se almacenan persistentemente en los metadatos del prompt:

```yaml
prompts:
- id: EXAMPLE
  prompt: "Your prompt text here..."
  # ... campos del prompt
  metadata:
    execution:
      claude:
        last_executed: "2024-01-15T10:30:00"
        status: "completed" # completed, failed, partial
        executions:
          unit1:
            status: "completed"
            timestamp: "2024-01-15T10:30:00"
            duration: 45.2
            result_summary: "Successfully processed..."
```

## 🔄 Capacidades de Reanudación

### Para Prompts de Scope `per-unit`
- **Estado Granular**: Track por cada unidad individual
- **Resumption Inteligente**: Continúa solo desde unidades no completadas
- **Re-ejecución Selectiva**: Opción de re-ejecutar unidades específicas

### Para Prompts de Scope `single`
- **Estado Único**: Track de ejecución individual
- **Opciones Flexibles**: Restart completo o skip basado en estado previo
- **Historial Completo**: Mantiene historial de todas las ejecuciones

## 🎮 Interface de Usuario Enhanced

### Visualización de Estado
```
📝 Prompts for Claude (Per-Unit Execution):
──────────────────────────────────────────────────────────────────────
  1. ✅ [EATT] Enhanced AI Teaching Tool 🔄 (resumable)
     📋 Scope: per-unit (8✅/1❌/2⏳ of 11) | 🎯 Model: sonnet | 📅 Created: 2024-01-15
     💡 Create comprehensive teaching materials
     🕒 Last executed: 2024-01-15 10:30:15
```

### Opciones de Reanudación
```
� Resumption Options for [EATT]:
   📊 Current status: partial
   📈 Progress: 8 completed, 1 failed, 2 pending

Choose action:
  1. 🔄 Restart (clear all state and start fresh)
  2. ▶️  Resume (continue from last state)
  3. ⏭️  Skip (skip this prompt)
```

## ⚙️ Configuración Enhanced

El sistema lee prompts de `src/conf/agent_prompts.yaml` con formato extendido:

```yaml
prompts:
- id: EXAMPLE
  prompt: "Your prompt text here..."
  agent_name: claude
  model: sonnet
  execution_scope: single  # o per-unit
  execution_command: "claude --model sonnet -a -p \"{prompt}\""
  metadata:  # ← Nuevo: metadatos persistentes
    execution: {}  # Se llena automáticamente
  # ... más campos
```

## 🚦 Manejo de Límites Enhanced

### Claude (5 horas)
- **Detección Avanzada**: "5-hour limit reached" + fallback models
- **Reset Inteligente**: Parsing automático de tiempo de reset
- **Resumption**: Continúa automáticamente después del reset

### Gemini (Diario)
- **Detección Múltiple**: Varios patrones de error de límites
- **Reset Automático**: Medianoche (00:00) con state management
- **Fallback Inteligente**: Modelos alternativos con resumption

## 📊 Estadísticas Enhanced

El sistema trackea con granularidad mejorada:

### Métricas por Prompt
- Estado general (completed, failed, partial, never_run)
- Progreso por unidad (para scope per-unit)
- Tiempo de última ejecución
- Duración total y promedio
- Tasa de éxito granular

### Métricas por Ejecución
- Resultado individual por unidad
- Modelo utilizado (incluyendo fallbacks)
- Timestamps detallados
- Resumen de resultados

### Métricas de Sistema
- Success rate global y por agente
- Tiempo total de ejecución
- Hits de límites y recuperación
- Estadísticas de reanudación

## 🧪 Testing Enhanced v2.0

```bash
# Tests del sistema enhanced completo
python3 tmp/test_enhanced_system.py

# Test específico de métricas en tiempo real
python3 tmp/test_real_time_metrics.py

# Test específico de resumption
python3 tmp/test_resumption.py

# Validación de state management
python3 tmp/test_state_manager.py
```
python3 tmp/test_state_manager.py
```

## 🔄 Plan-and-Solve Framework

Este sistema implementa el framework Plan-and-Solve solicitado:

### Phase 1: Enhanced State Management ✅
- StateManager con métodos de resumption
- ExecutionEngine con scope-aware execution
- Persistent result storage en YAML metadata

### Phase 2: Enhanced User Interface ✅
- Enhanced TUI con visualización de estado
- Resumption choice dialogs
- Re-execution capabilities

### Phase 3: Configuration Integration
- Enhanced ConfigManager para metadata handling
- YAML persistence improvements

### Phase 4: Documentation & Testing
- README.md actualizado
- Test scripts comprehensivos
- Validación completa del sistema

## 🛠️ Dependencias

```bash
# Opcional para TUI moderna
pip install textual rich

# Core (incluidas en Python estándar)
# - yaml, json, datetime, pathlib, subprocess, asyncio
```

## 📝 Logs Enhanced

- **Archivos**: `tmp/prompt_executor.log`
- **Niveles**: INFO, WARNING, ERROR con contexto de resumption
- **Por agente**: Separación automática con state tracking
- **Granularidad**: Log detallado de resumption decisions