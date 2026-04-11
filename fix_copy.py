import glob
import os

target_text = "Experience the ultimate fusion of cutting-edge material science and ruthless aesthetic design. Built for those who refuse to compromise."
replacement_text = "Built for those who refuse to compromise. Material science meets ruthless design."

files_to_check = glob.glob('*.html') + glob.glob('sections/*.liquid')

for f in files_to_check:
    with open(f, 'r') as file:
        content = file.read()
    if target_text in content:
        content = content.replace(target_text, replacement_text)
        with open(f, 'w') as file:
            f.write(content)

print("Updated text!")
