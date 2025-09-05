#!/usr/bin/env python3
import re
import sys
import html
from pathlib import Path
from typing import Tuple, Dict, Callable

class HTMLFixer:
    def __init__(self):
        self.changes_made = False
        self.icon_label_map = {
            "arrows-angle-expand": "Expand",
            "x-lg": "Close",
            # Agregar más mapeos según necesites
        }
        
        # Definir todas las reglas de corrección
        self.rules = [
            self._fix_self_closing_tags,
            self._fix_button_types,
            self._fix_icon_button_aria_labels,
            self._fix_header_aria_labels,
        ]
    
    def _log_fix(self, message: str):
        """Helper para logging consistente"""
        print(f"🔧 Fixed: {message}")
        self.changes_made = True
    
    def _fix_self_closing_tags(self, content: str) -> str:
        """Fix 1: Replace '/ />' with '/>'"""
        fixed = re.sub(r'/\s*/>', '/>', content)
        if fixed != content:
            self._log_fix("Replaced '/ />' with '/>'")
        return fixed
    
    def _fix_button_types(self, content: str) -> str:
        """Fix 2: Add type='button' to buttons without type"""
        fixed = re.sub(
            r'(<button(?![^>]*type=)([^>]*?)>)',
            r'<button type="button"\2>',
            content,
            flags=re.IGNORECASE
        )
        if fixed != content:
            self._log_fix("Added type=\"button\" to <button> tags")
        return fixed
    
    def _fix_icon_button_aria_labels(self, content: str) -> str:
        """Fix 3: Add aria-label to iconic buttons"""
        pattern = re.compile(
            r'<button((?![^>]*aria-label=)[^>]*?)>\s*'
            r'<i\s+class="bi\s+bi-([a-zA-Z0-9-]+)"[^>]*></i>\s*'
            r'</button>',
            re.IGNORECASE | re.DOTALL
        )
        
        def replacer(match):
            button_attrs, icon_class = match.groups()
            
            # Determinar label del icono
            label = self._get_icon_label(icon_class, button_attrs)
            encoded_label = html.escape(label, quote=True)
            
            # Limpiar title existente si lo hay
            clean_attrs = re.sub(r'\s*title="[^"]*"', '', button_attrs)
            
            self._log_fix(f'Added aria-label="{encoded_label}" to button with icon bi-{icon_class}')
            
            return f'<button{clean_attrs} aria-label="{encoded_label}"><i class="bi bi-{icon_class}"></i></button>'
        
        return pattern.sub(replacer, content)
    
    def _get_icon_label(self, icon_class: str, button_attrs: str) -> str:
        """Obtener label para un icono específico"""
        # Primero verificar si hay un title existente
        title_match = re.search(r'title="([^"]*)"', button_attrs)
        if title_match:
            return title_match.group(1)
        
        # Usar mapeo predefinido o generar uno por defecto
        return self.icon_label_map.get(
            icon_class, 
            f"{icon_class.replace('-', ' ').title()} button"
        )
    
    def _fix_header_aria_labels(self, content: str) -> str:
        """Fix 4: Add aria-label to headers without accessible names"""
        fixed = re.sub(
            r'<header((?![^>]*aria-label=)(?![^>]*aria-labelledby=)[^>]*)>',
            r'<header\1 aria-label="Header">',
            content,
            flags=re.IGNORECASE | re.MULTILINE
        )
        if fixed != content:
            self._log_fix("Added aria-label=\"Header\" to <header> tags")
        return fixed
    
    def fix_content(self, content: str) -> Tuple[str, bool]:
        """Aplicar todas las correcciones al contenido"""
        self.changes_made = False
        
        # Resetear contadores para cada archivo
        self.counters = {
            'header': 0,
            'button': 0,
        }
        
        for rule in self.rules:
            content = rule(content)
        
        return content, self.changes_made
    
    def add_rule(self, rule_func: Callable[[str], str]):
        """Permitir agregar nuevas reglas dinámicamente"""
        self.rules.append(rule_func)
    
    def add_icon_mapping(self, icon_class: str, label: str):
        """Agregar nuevo mapeo de icono a label"""
        self.icon_label_map[icon_class] = label

def process_file(file_path: Path, fixer: HTMLFixer) -> bool:
    """Procesar un archivo individual"""
    try:
        original_content = file_path.read_text(encoding="utf-8")
        new_content, has_changed = fixer.fix_content(original_content)
        
        if has_changed:
            print(f"🔧 Applying fixes to: {file_path}")
            file_path.write_text(new_content, encoding="utf-8")
            return True
        else:
            print(f"✅ No changes needed for: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing file {file_path}: {e}", file=sys.stderr)
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 fix_html_errors.py <file1.html> [file2.html] ...")
        sys.exit(1)
    
    fixer = HTMLFixer()
    
    # Ejemplo de cómo agregar mapeos personalizados
    # fixer.add_icon_mapping("custom-icon", "Custom Action")
    
    files_processed = 0
    files_changed = 0
    
    for file_arg in sys.argv[1:]:
        file_path = Path(file_arg)
        if file_path.is_file():
            if process_file(file_path, fixer):
                files_changed += 1
            files_processed += 1
        else:
            print(f"Skipping non-file argument: {file_arg}", file=sys.stderr)
    
    print(f"\n📊 Summary: {files_changed}/{files_processed} files changed")

if __name__ == "__main__":
    main()