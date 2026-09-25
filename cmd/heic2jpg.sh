#! /bin/bash

error() {
  echo "$@" >&2
  exit 1
}

fatal() {
  error "fatal: $@"
  exit 1
}

process() {
  [ $# -ne 1 ] && fatal "invalid number of arguments specified"

  input_file="$1" # e.g., "<filename>.heic"
  output_file="$1.jpg"

  if [ -e "$output_file" ]; then
    error "output file already exists: $output_file"
    return
  fi

  if [ ! -f "$input_file" ]; then
    error "input file does not exist: $input_file"
    return
  fi

  magick "$input_file" -resize 2048x2048 -quality 85 -strip "$output_file"
}

for file in "$@"; do
  process "$file"
done
