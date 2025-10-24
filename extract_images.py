from docx import Document
import os
from PIL import Image
from io import BytesIO
import re

input_docx = r"C:\Users\ththomps\Documents\PowerPlatConference\mcs-labs\labs\proactive-contract-alerts-in-teams-and-azure-ai-search-and-speech-to-text\PPC Lab 2.docx"
output_dir = r"C:\Users\ththomps\Documents\PowerPlatConference\mcs-labs\labs\proactive-contract-alerts-in-teams-and-azure-ai-search-and-speech-to-text\images"
os.makedirs(output_dir, exist_ok=True)

doc = Document(input_docx)
step_pattern = re.compile(r"^\s*(\d+[A-Za-z]*\.\d+)\s+(.*)")
current_step = None
current_step_desc = None
image_counter = {}

for block in doc.element.body:
    if block.tag.endswith('p'):
        text = block.text.strip()
        if text:
            match = step_pattern.match(text)
            if match:
                current_step = match.group(1).lower().replace('.', '-')
                current_step_desc = match.group(2).strip().lower()
                current_step_desc = re.sub(r'[^a-z0-9]+', '-', current_step_desc)
                image_counter[current_step] = 0

for rel in doc.part.rels.values():
    if "image" in rel.target_ref:
        img_data = rel.target_part.blob
        if current_step:
            image_counter[current_step] += 1
            suffix = chr(96 + image_counter[current_step])  # a, b, c...
            filename = f"{current_step}{suffix}-{current_step_desc}.png"
        else:
            filename = f"image-{len(image_counter)+1}.png"
        output_path = os.path.join(output_dir, filename)
        image = Image.open(BytesIO(img_data))
        image.save(output_path, format="PNG")

print(f"Images extracted and saved to {output_dir}")