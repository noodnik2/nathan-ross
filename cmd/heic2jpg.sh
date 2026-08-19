

input_file="$1.heic"
output_file="$1.jpg"

fatal() {
  echo "fatal: $*" >&2
  exit 1
}

[ -e "$output_file" ] && fatal "output file already exists: $output_file"
[ ! -f "$input_file" ] && fatal "input file does not exist: $input_file"


magick "$input_file" -resize 2048x2048 -quality 85 -strip "$output_file"

