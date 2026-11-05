import os

path = os.path.join(os.path.dirname(__file__), 'schema.prisma')
with open(path, 'r', newline='') as f:
    content = f.read()

old = '  image       String\r\n  categoryId  Int'
new_line = '  images      String     @default("[]") // JSON array of image URLs for gallery'
new = '  image       String\r\n' + new_line + '\r\n  categoryId  Int'
content = content.replace(old, new)

with open(path, 'w', newline='') as f:
    f.write(content)
print('schema.prisma updated successfully')
