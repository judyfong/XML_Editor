#!/bin/bash

grep -Eho '(\w+_\w+)+\(' *.js | uniq | while read -r line ; do
  orig=$line # ${line::-1}
  replace=$(echo $orig | sed -r "s/_(\w)/\U\1/g")
  echo "$orig -> $replace"
  sed -i "s/$orig/$replace/g" *.js
done

