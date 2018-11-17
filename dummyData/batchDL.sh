## 
# 
# Batch Downloader 
# Chris Malcolm 2018
#
# Download files from server using a list of urls + optional cookies file
#
##

# Adjust settings below
# ----------------------
#1 url per line of url to download
listOfUrlsTextFile="./gpxRecordings.txt"
#output folder relative to current
outputFolder="gpxFiles"
# 1 - n seconds delay wait time (for not massive pings to server)
waitSeconds=3
# we want filename based on a unique segment of url, segments are determined by slashes,
# if url = http://example.com/item/100/
# segmentIndex for '100' would be 5
segmentIndex=8
extension="gpx"

# DONT EDIT
# ----------------------
if [ -f "cookies.txt" ]
    then
        while IFS= read -r url;do
            file="$outputFolder/$(echo $url | cut -d'/' -f $segmentIndex).$extension";
                if [ -f "$file" ]
                then
                    echo "$file exists...skipping."
                else
                    # make a message
                    echo "downloading $file..."
                    # download files by id name
                    wget -x --load-cookies 'cookies.txt' -O "$file" "$url"
                    # randomize delay from 5 - 15 seconds
                    sleep $[ ( $RANDOM % waitSeconds )  + 1 ]s
                fi
        done < "./gpxRecordings.txt"
    else
        echo 
        echo "cookies.txt file must be in this same directory. It can be blank, if no cookies are needed."
        echo 
        echo "To Generate a cookies.txt file from a website, use:"
        echo "https://chrome.google.com/webstore/detail/cookiestxt/njabckikapfpffapmjgojcnbfjonfjfg/related?hl=en"
        echo 
fi