#!/usr/bin/env python3
"""Assemble index.html from template.html + engine.js + ui.js."""
t = open('template.html', encoding='utf8').read()
t = t.replace('/*ENGINE*/', open('engine.js', encoding='utf8').read())
t = t.replace('/*UI*/', open('ui.js', encoding='utf8').read().replace('/*EXTRAS*/', open('extras.js', encoding='utf8').read()))
t = t.replace('footer{', '.edu h4{margin:14px 0 4px;color:var(--gold);font-size:16px}.edu p{margin:4px 0}.edu{line-height:1.9}\nfooter{', 1)
open('index.html', 'w', encoding='utf8').write(t)
print('index.html', len(t), 'bytes')
