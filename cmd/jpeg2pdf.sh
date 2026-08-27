
file_list=~/tmp/scans-nathan-letter.lst
output_file=~/repos/noodnik2/nathan-ross/static/nathan-ross/images/1948-jul31-letter-to-anne2.pdf
# file_list=~/tmp/scans-maxs-letter.lst
# output_file=~/repos/noodnik2/nathan-ross/static/nathan-ross/images/1950-april4-letter-from-max.pdf

magick $(cat $file_list) -compress jpeg -quality 60 "$output_file"
