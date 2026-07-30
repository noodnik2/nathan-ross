

input_file="static/images/$1.png"
output_file="static/images/$1.webp"

fatal() {
  echo "fatal: $*" >&2
  exit 1
}

[ -e "$output_file" ] && fatal "output file already exists: $output_file"
[ ! -f "$input_file" ] && fatal "input file does not exist: $input_file"

cwebp -q 75 -resize 1920 0 "$input_file" -o "$output_file"

