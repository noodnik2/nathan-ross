#!/bin/bash

maxs_letter_pipeline() {
	magick "$1" -level 2%,88%  -contrast-stretch 5%x50% "$2"
}

nathans_letter_pipeline() {
        magick "$1" -level 2%,87% -contrast-stretch 5%x50% -morphology Dilate Square:1 "$2"
}

# Ensure at least one file was provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 file1.jpg file2.jpg ... or $0 *.jpg"
    exit 1
fi

# Create an output directory to keep things organized
OUTPUT_DIR="processed_pages"
mkdir -p "$OUTPUT_DIR"

echo "Starting batch processing..."

# Loop through all arguments passed to the script
for FILE in "$@"; do
    # Check if the file actually exists
    if [ -f "$FILE" ]; then
        FILENAME=$(basename "$FILE")
        echo "Processing: $FILENAME"
        
        # Apply your exact custom pipeline
	# nathans_letter_pipeline "$FILE" "$OUTPUT_DIR/$FILENAME"
	maxs_letter_pipeline "$FILE" "$OUTPUT_DIR/$FILENAME"
    else
        echo "Warning: File not found -> $FILE"
    fi
done

echo "Done! Processed images are in the '$OUTPUT_DIR' folder."

