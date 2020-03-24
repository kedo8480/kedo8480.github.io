#!/bin/bash

# THIS SCRIPT CONVERTS EVERY MP4 (IN THE CURRENT FOLDER AND SUBFOLDER) TO A MULTI-BITRATE VIDEO IN MP4-DASH
# For each file "videoname.mp4" it creates a folder "dash_videoname" containing a dash manifest file "stream.mpd" and subfolders containing video segments.
# Explanation: 
# https://rybakov.com/blog/

# Validation tool:
# http://dashif.org/conformance.html

# MDN reference:
# https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources

# Add the following mime-types (uncommented) to .htaccess:
# AddType video/mp4 m4s
# AddType application/dash+xml mpd

# Use type="application/dash+xml" 
# in html when using mp4 as fallback:
#                <video data-dashjs-player loop="true" >
#                    <source src="/walking/walking.mpd" type="application/dash+xml">
#                    <source src="/walking/walking.mp4" type="video/mp4">
#                </video>

# DASH.js
# https://github.com/Dash-Industry-Forum/dash.js

MYDIR=$(dirname $(readlink -f ${BASH_SOURCE[0]}))
SAVEDIR=$(pwd)

# Check programs
if [ -z "$(which ffmpeg)" ]; then
    echo "Error: ffmpeg is not installed"
    exit 1
fi

if [ -z "$(which MP4Box)" ]; then
    echo "Error: MP4Box is not installed"
    exit 1
fi

cd "$MYDIR"

TARGET_FILES=$(find ./ -maxdepth 1 -type f \( -name "*.mov" -or -name "*.mp4" \))
for f in $TARGET_FILES
do
  fe=$(basename "$f") # fullname of the file
  f="${fe%.*}" # name without extension

  if [ ! -d "${f}" ]; then #if directory does not exist, convert
    echo "Converting \"$f\" to multi-bitrate video in MPEG-DASH"

    mkdir "${f}"

    ffmpeg -i "${f}" -s 640x360 -c:v libx264 -b:v 650k -r 24 -x264opts keyint=48:min-keyint=48:no-scenecut -profile:v main -preset fast -movflags +faststart -c:a libfdk_aac -b:a 128k -ac 2 out-low.mp4
    ffmpeg -i "${f}" -s 960x540 -c:v libx264 -b:v 1400k -r 24 -x264opts keyint=48:min-keyint=48:no-scenecut -profile:v main -preset fast -movflags +faststart -c:a libfdk_aac -b:a 128k -ac 2 out-med.mp4
   
    rm -f ffmpeg*log*
    # if audio stream does not exist, ignore it

    MP4Box -dash 4000 -rap -bs-switching no -profile live -out manifest.mpd out-low.mp4#audio out-low.mp4#video out-med.mp4#video out-high.mp4#video

 fi
done

cd "$SAVEDIR"