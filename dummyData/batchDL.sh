# settings
outputFolder="gpxFiles"
waitSeconds=3

# Don't edit
if [ -f "cookies.txt" ]
    then
        while IFS= read -r url;do
            file="$outputFolder/$(echo $url | cut -d'/' -f 8).gpx";
                if [ -f "$file" ]
                then
                    echo "$file exists...skipping."
                else
                    # make a message
                    echo "downloading $(echo $url | cut -d'/' -f 8)..."
                    # download files by id name
                    # wget -x --load-cookies 'cookies.txt' -O "gpxFiles/$(echo $url | cut -d'/' -f 8).gpx" "$url"
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