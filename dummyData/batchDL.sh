while IFS= read -r url;do
    # make a message
    echo "downloading $(echo $url | cut -d'/' -f 8)..."
    # download files by id name
    wget -O "gpxFiles/$(echo $url | cut -d'/' -f 8).gpx" "$url"
    # randomize delay from 1 - 2 seconds
    sleep $[ ( $RANDOM % 2 )  + 1 ]s
done < "./gpxRecordings_test.txt"