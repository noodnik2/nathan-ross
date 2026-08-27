#! /bin/bash

error() {
  echo "$@" >&2
}

fatal() {
  error "fatal: $*"
  exit 1
}

process() {
  [ $# -ne 1 ] && fatal "invalid number of arguments specified"

  input_file="$1"
  output_file="${input_file%.*}.webp"

  if [ -e "$output_file" ]; then
    error "output file already exists: $output_file"
    return
  fi

  if [ ! -f "$input_file" ]; then
    error "input file does not exist: $input_file"
    return
  fi

  cwebp -q 75 -resize 1920 0 "$input_file" -o "$output_file"
}

for file in "$@"; do
  process "$file"
done
