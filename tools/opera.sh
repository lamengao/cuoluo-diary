#!/bin/bash
cd /Users/yibing/developer/projects/GAE/cldiary/newyear/tools
/Users/yibing/developer/projects/GAE/cldiary/newyear/closure-library/closure/bin/build/closurebuilder.py \
	--root=../closure-library/ \
	--root=../static/js/src/ \
	--namespace="cld.App" \
	--output_mode=compiled \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--define=goog.userAgent.ASSUME_OPERA=true" \
	--compiler_flags="--warning_level=VERBOSE" \
	--compiler_jar=/Users/yibing/developer/libs/closuretools/compiler/compiler.jar > ../static/js/cld.gecko.min.js
	#--compiler_flags="--create_source_map=/Users/yibing/sharewithvmware/cld.gecko.map" \
