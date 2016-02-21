import os                                                                            

from google.appengine.ext.webapp import template

register = template.create_template_register()

def addfilemtime(filepath):
	trimpath = filepath.rstrip('/')
	realpath = os.path.join(os.path.dirname(__file__), '..',
			                'staticsymbol', trimpath.strip('/'))
	mtime = int(os.stat(realpath).st_mtime)
	tmp = trimpath.split('/')
	tmp.insert(-1, str(mtime))
	return '/'.join(tmp)
register.filter(addfilemtime)
