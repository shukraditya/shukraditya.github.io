import os
import re
from pathlib import Path
from markdown import Markdown

MARKDOWN_ROOT = Path("markdowns")
PAGES_ROOT = Path("pages")
TEMPLATE_PATH = PAGES_ROOT / "template.html"
TEMPLATE_PLACEHOLDER = "{{CONTENT}}"

def load_template():
    """Loads the master HTML template file."""
    try:
        with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
            template = f.read()
        if TEMPLATE_PLACEHOLDER not in template:
            print(f"Warning: Template {TEMPLATE_PATH} is missing the required placeholder: '{TEMPLATE_PLACEHOLDER}'.")
        return template
    except FileNotFoundError:
        print(f"Error: Template file {TEMPLATE_PATH} not found.")
        return f"<html><body><main>{TEMPLATE_PLACEHOLDER}</main></body></html>"

def preprocess_markdown(text):
    """
    Converts Obsidian/GitHub style callouts to Python-Markdown Admonition format.
    
    Input:
    > [!note] Title
    > Content here
    
    Output:
    !!! note "Title"
        Content here
    """
    lines = text.split('\n')
    new_lines = []
    in_admonition = False
    
    for line in lines:
        # Check for the start of a callout: > [!type] Title
        match = re.match(r'^>\s*\[!(.*?)\]\s*(.*)$', line)
        
        if match:
            type_name = match.group(1).lower()
            title = match.group(2) if match.group(2) else type_name.capitalize()
            # Convert to Admonition syntax: !!! type "Title"
            new_lines.append(f'!!! {type_name} "{title}"')
            in_admonition = True
        elif in_admonition and line.startswith('>'):
            # If inside a callout, replace the '>' with 4 spaces indentation
            content = line.lstrip('>').lstrip(' ')
            new_lines.append(f'    {content}')
        elif in_admonition and line.strip() == '':
            # Empty lines inside admonition need indentation too
            new_lines.append('')
        else:
            # Normal line, breaks the admonition block
            in_admonition = False
            new_lines.append(line)
            
    return '\n'.join(new_lines)

def convert_markdown_to_html(markdown_content):
    """Converts Markdown content into an HTML body fragment."""
    
    # 1. Pre-process to fix callout syntax
    processed_content = preprocess_markdown(markdown_content)

    # 2. Configure Markdown with extensions
    # Added 'codehilite' for the code block colors
    md = Markdown(
        extensions=[
            'fenced_code',
            'tables',
            'admonition',
            'sane_lists',
            'codehilite' 
        ]
    )
    return md.convert(processed_content)

def calculate_css_path(current_path):
    if current_path == Path(""):
        return "../style.css"
    else:
        depth = len(current_path.parts) + 1
        return "../" * depth + "style.css"

def calculate_components_path(current_path):
    if current_path == Path(""):
        return "../components/components.js"
    else:
        depth = len(current_path.parts) + 1
        return "../" * depth + "components/components.js"

def calculate_script_path(current_path):
    if current_path == Path(""):
        return "../script.js"
    else:
        depth = len(current_path.parts) + 1
        return "../" * depth + "script.js"

def process_directory(current_path, template_content):
    """Recursively traverses the markdowns directory and generates HTML files."""
    markdown_dir = MARKDOWN_ROOT / current_path
    pages_dir = PAGES_ROOT / current_path

    if not markdown_dir.exists():
        return

    pages_dir.mkdir(parents=True, exist_ok=True)

    for entry in markdown_dir.iterdir():
        if entry.is_dir():
            process_directory(current_path / entry.name, template_content)

        elif entry.is_file() and entry.suffix == '.md':
            try:
                with open(entry, 'r', encoding='utf-8') as f:
                    markdown_content = f.read()

                converted_html_body = convert_markdown_to_html(markdown_content)

                css_path = calculate_css_path(current_path)
                components_path = calculate_components_path(current_path)
                script_path = calculate_script_path(current_path)

                final_html = template_content.replace(TEMPLATE_PLACEHOLDER, converted_html_body)
                final_html = final_html.replace('{{CSS_PATH}}', css_path)
                final_html = final_html.replace('{{COMPONENTS_PATH}}', components_path)
                final_html = final_html.replace('{{SCRIPT_PATH}}', script_path)

                output_filename = entry.stem + '.html'
                output_path = pages_dir / output_filename

                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(final_html)

                print(f"Converted: {entry} -> {output_path}")

            except Exception as e:
                print(f"Error processing file {entry}: {e}")

def main():
    print("--- Starting Markdown to HTML Conversion (Python) ---")
    PAGES_ROOT.mkdir(exist_ok=True)
    
    template_content = load_template()
    if TEMPLATE_PLACEHOLDER not in template_content:
        print("Stopping: Template is invalid.")
        return

    process_directory(Path(""), template_content)
    print("--- Conversion Complete! ---")

if __name__ == "__main__":
    main()