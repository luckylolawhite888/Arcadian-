import re

pairs = [
    ('/var/www/toolstack.uk/public/index.html', '<h1>\U0001f6e0\ufe0f ToolStack UK \u2014 Free Online Calculators</h1>'),
    ('/var/www/pdfoomph.com/public/index.html', '<h1>\U0001f4c4 PDFoomph \u2014 Free PDF Tools Online</h1>'),
    ('/var/www/cheapfind.uk/public/index.html', '<h1>\U0001f911 CheapFind \u2014 UK Deals & Discounts</h1>'),
    ('/var/www/isitdownrightnow.co.uk/public/index.html', '<h1>\U0001f50d Is It Down Right Now? \u2014 Website Status Checker</h1>'),
]

for path, new_h1 in pairs:
    with open(path) as f:
        h = f.read()
    h = re.sub(r'<h1[^>]*>[^<]*</h1>', new_h1, h)
    with open(path, 'w') as f:
        f.write(h)
    print('Fixed: ' + path.split('/')[4])
