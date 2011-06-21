#!/usr/bin/env python
# coding=utf-8
import os

print 'mini css...'

# go to static dir
static_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
os.chdir(static_dir)

css_str = open(r'css/closureui.css').read() + open(r'css/cld.dev.css').read()
tmp_file = open('tmp.css', 'w')
tmp_file.write(css_str)
tmp_file.close()

command = r'java -jar ../tools/yuicompressor-2.4.6.jar tmp.css -o css/cld.min.css'
os.system(command)
os.remove('tmp.css')

print 'mini css done'
