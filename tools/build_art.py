"""Встраивает арт из art/*.js в index.html (между маркерами /*__ART_BEGIN__*/ и /*__ART_END__*/).

Запуск из корня репозитория:  python3 tools/build_art.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
page = root / 'index.html'
html = page.read_text(encoding='utf-8')
parts = []
for name in ['bg.js', 'enemies.js', 'heroes.js', 'icons.js', 'icons_extra.js']:
    f = root / 'art' / name
    if f.exists():
        parts.append(f'/* ---- art/{name} ---- */\n' + f.read_text(encoding='utf-8').strip())
block = '/*__ART_BEGIN__*/\n' + '\n'.join(parts) + '\n/*__ART_END__*/'
assert '</script>' not in block, 'в арте не должно быть </script>'
if '/*__ART__*/' in html:
    html = html.replace('/*__ART__*/', block, 1)
else:
    html, n = re.subn(r'/\*__ART_BEGIN__\*/.*?/\*__ART_END__\*/', lambda m: block, html, count=1, flags=re.S)
    assert n == 1, 'маркеры арта не найдены'
page.write_text(html, encoding='utf-8')
print(f'index.html: {len(html) // 1024} KB')
