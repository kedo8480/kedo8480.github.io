#!/bin/bash
echo "Start converting /spec folder"
rm -rf IE_spec
mkdir IE_spec
for file in spec/*.js; do
	echo "$file"
	babel --presets env "$file" --out-file "IE_$file"
	[ -e "$file" ] || continue
done
echo "/spec folder convertion done"

echo "Start converting /src folder"
rm -rf IE_src
mkdir IE_src
for file in src/*.js; do
	echo "$file"
	babel --presets env "$file" --out-file "IE_$file"
	[ -e "$file" ] || continue
done
echo "/src folder convertion done"

echo "Creating CaseRunner for IE"
rm IE_CaseRunner.html
cp CaseRunner.html IE_CaseRunner.html
sed -i '' 's/spec\//IE_spec\//g;s/src\//IE_src\//g;' IE_CaseRunner.html
echo "IE_CaseRunner.html is created"

echo "Creating karma config for IE"
rm IE_karma.conf.js
cp karma.conf.js IE_karma.conf.js
sed -i '' 's/spec\//IE_spec\//g;s/src\//IE_src\//g;s/Chrome/IE/g;' IE_karma.conf.js
echo "IE_karma.conf.js is created"