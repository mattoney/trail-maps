#!/usr/bin/env python3
# Builds ../index.html from template.html by inlining Leaflet + trail data.
# Run from this directory: python3 build.py
import base64, pathlib
here = pathlib.Path(__file__).parent
tpl = (here / 'template.html').read_text()
css = (here / 'leaflet.css').read_text()
for name in ('layers.png', 'layers-2x.png'):
    b64 = base64.b64encode((here / name).read_bytes()).decode()
    css = css.replace(f'url(images/{name})', f'url(data:image/png;base64,{b64})')
out = (tpl.replace('__LEAFLET_CSS__', css)
          .replace('__LEAFLET_JS__', (here / 'leaflet.js').read_text())
          .replace('__TRAIL_JSON__', (here / 'trail.json').read_text()))
(here.parent / 'index.html').write_text(out)
print('built', len(out), 'bytes ->', here.parent / 'index.html')
