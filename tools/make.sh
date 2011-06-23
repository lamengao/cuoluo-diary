#!/bin/bash
cd /Users/yibing/developer/projects/GAE/cldiary/newyear/tools
/Users/yibing/developer/projects/GAE/cldiary/newyear/closure-library/closure/bin/build/closurebuilder.py \
	--root=../closure-library/ \
	--root=../static/js/src/ \
	--namespace="cld.App" \
	--output_mode=compiled \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--define=goog.userAgent.ASSUME_IE=true" \
	--compiler_jar=/Users/yibing/developer/libs/closuretools/compiler/compiler.jar > ../static/js/cld.ie.min.js

/Users/yibing/developer/projects/GAE/cldiary/newyear/closure-library/closure/bin/build/closurebuilder.py \
	--root=../closure-library/ \
	--root=../static/js/src/ \
	--namespace="cld.App" \
	--output_mode=compiled \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--define=goog.userAgent.ASSUME_GECKO=true" \
	--compiler_jar=/Users/yibing/developer/libs/closuretools/compiler/compiler.jar > ../static/js/cld.gecko.min.js

/Users/yibing/developer/projects/GAE/cldiary/newyear/closure-library/closure/bin/build/closurebuilder.py \
	--root=../closure-library/ \
	--root=../static/js/src/ \
	--namespace="cld.App" \
	--output_mode=compiled \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--define=goog.userAgent.ASSUME_WEBKIT=true" \
	--compiler_jar=/Users/yibing/developer/libs/closuretools/compiler/compiler.jar > ../static/js/cld.webkit.min.js

/Users/yibing/developer/projects/GAE/cldiary/newyear/closure-library/closure/bin/build/closurebuilder.py \
	--root=../closure-library/ \
	--root=../static/js/src/ \
	--namespace="cld.App" \
	--output_mode=compiled \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--define=goog.userAgent.ASSUME_OPERA=true" \
	--compiler_jar=/Users/yibing/developer/libs/closuretools/compiler/compiler.jar > ../static/js/cld.opera.min.js

/Users/yibing/developer/projects/GAE/cldiary/newyear/closure-library/closure/bin/build/closurebuilder.py \
	--root=../closure-library/ \
	--root=../static/js/src/ \
	--namespace="cld.App" \
	--output_mode=compiled \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--warning_level=VERBOSE" \
	--compiler_jar=/Users/yibing/developer/libs/closuretools/compiler/compiler.jar > ../static/js/cld.min.js

#./minicss.py
