import os
from PIL import Image

src_path = r"C:\Users\mohit\Documents\company\staffing-site\icon\Averion Career Icon.png"
dest_ico = r"c:\Users\mohit\Documents\company\Proxy_tool\assets\icon.ico"
dest_png = r"c:\Users\mohit\Documents\company\Proxy_tool\assets\icon.png"

# Ensure assets directory exists
os.makedirs(os.path.dirname(dest_ico), exist_ok=True)

print("Loading original image...")
img = Image.open(src_path)

# Convert to RGBA if not already
if img.mode != "RGBA":
    img = img.convert("RGBA")

# Resize to standard sizes for .ico (largest first so electron-builder reads 256x256 first)
sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (24, 24), (16, 16)]
icon_images = []

for size in sizes:
    # Use LANCZOS (high quality resampling)
    resized_img = img.resize(size, Image.Resampling.LANCZOS)
    icon_images.append(resized_img)

print("Saving as ICO...")
# Save ICO containing all these sizes
icon_images[0].save(
    dest_ico,
    format="ICO",
    sizes=sizes,
    append_images=icon_images[1:]
)
print(f"Successfully saved ICO to {dest_ico}")

# Save a standard 256x256 PNG version for Electron
print("Saving 256x256 PNG...")
png_256 = img.resize((256, 256), Image.Resampling.LANCZOS)
png_256.save(dest_png, format="PNG")
print(f"Successfully saved PNG to {dest_png}")
