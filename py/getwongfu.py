#!/usr/bin/python
import os
import json
import re
import pprint

from apiclient.discovery import build

# build youtube API service
DEVELOPER_KEY = open('key.txt', 'r').read()
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"
youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION,
  developerKey=DEVELOPER_KEY)

# read from youtubers file
# if file is empty, set youtubers to empty dictionary
# else set youtubers to contents of file
YOUTUBER_FILE_PATH = "raw/youtubers.json"
if not os.path.exists(YOUTUBER_FILE_PATH):
  youtubers = {}
else:
  youtubers = json.load(open(YOUTUBER_FILE_PATH, 'r'))

def getYoutuber(name):
  if name not in youtubers:
    # if we don't have information on channel yet
    # then go get it from youtube and save it to file
    response = youtube.channels().list(
      forUsername=name,
      part="snippet,statistics"
    ).execute()

    youtuber = response["items"][0]
    youtubers[name] = youtuber
    pprint.pprint(youtuber["id"])
    # save to file
    youtubersFile = open(YOUTUBER_FILE_PATH, 'w')
    youtubersFile.write(json.dumps(youtubers))
    youtubersFile.close()

def getVideosForYoutuber(youtuber):
  # first go get the file for this youtuber's videos
  VIDEO_FILE_PATH = "raw/" + youtuber + ".json"
  if not os.path.exists(VIDEO_FILE_PATH):
    youtuberVideos = {}
  else:
    youtuberVideos = json.load(open(VIDEO_FILE_PATH, 'r'))

  # then set up the variables we need to hit the API with
  channelId = youtubers[youtuber]["id"]
  afterDate = youtuberVideos.get("latestDate")
  allAssociations = youtuberVideos["associations"] = youtuberVideos.get("associations")
  videos = youtuberVideos["videos"] = youtuberVideos.get("videos")

  if not allAssociations:
    allAssociations = youtuberVideos["associations"] = {}
  if not videos:
    videos = youtuberVideos["videos"] = {}

  def getVideoSnippets(nextPageToken=None):
    response = youtube.search().list(
      channelId=channelId,
      publishedAfter=afterDate,
      pageToken=nextPageToken,
      part="snippet",
      type="video",
      order="date",
      maxResults=50
    ).execute()

    if not nextPageToken:
      # remember latest video date so that next time we can start from there
      youtuberVideos["latestDate"] = response["items"][0]["snippet"]["publishedAt"]

    # save the videos
    for video in response["items"]:
      videoId = video["id"]["videoId"]
      videos[videoId] = {"id": video["id"]}

    nextPageToken = response.get("nextPageToken")
    pprint.pprint(nextPageToken)
    if nextPageToken:
      # if there is still a next page, then get it
      getVideoSnippets(nextPageToken)

  def getAdditionalVideoInfo(video, videoId):
    part = "statistics"
    if "snippet" not in video:
      part += ",snippet"
    response = youtube.videos().list(
      part=part,
      id=videoId
    ).execute()

    videoResponse = response["items"][0]
    video["statistics"] = videoResponse["statistics"]
    if "snippet" not in video:
      video["snippet"] = videoResponse["snippet"]
      # also calculate the associated youtubers
      video["associations"] = re.findall('youtube.com\/([\w\d]*)\s', video["snippet"]["description"])
      for association in video["associations"]:
        association = association.lower()
        if association == youtuber:
          continue
        if association not in allAssociations:
          allAssociations[association] = 0
        allAssociations[association] += 1

  # get any new videos
  getVideoSnippets()
  # get additional video info
  for videoId,video in videos.iteritems():
    getAdditionalVideoInfo(video, videoId)

  # save video
  videosFile = open(VIDEO_FILE_PATH, 'w')
  videosFile.write(json.dumps(youtuberVideos))
  videosFile.close()

  return youtuberVideos

getYoutuber("wongfuproductions")
wongfuAssociations = getVideosForYoutuber("wongfuproductions")["associations"]

sortedAssociations = sorted(wongfuAssociations.items(), key=lambda x: x[1], reverse=True)
sortedAssociations = sortedAssociations[:7]

for association,count in sortedAssociations:
  getYoutuber(association)
  getVideosForYoutuber(association)

associationFile = open("raw/associations.json", 'w')
associationFile.write(json.dumps(sortedAssociations))
associationFile.close()
