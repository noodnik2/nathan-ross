
input_file="$1.m4a"
output_file="$1-mono.m4a"

fatal() {
  echo "fatal: $*" >&2
  exit 1
}

[ -e "$output_file" ] && fatal "output file already exists: $output_file"
[ ! -f "$input_file" ] && fatal "input file does not exist: $input_file"

ffmpeg -i "$input_file" -c:a aac_at -b:a 96k -ac 1 "$output_file"