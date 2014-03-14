import urllib2
import json
import re
import time

youtubers = ["pauldateh", "kinagrannis", "nigahiga", "lilcdawg", "funemployed", "frmheadtotoe", "lanamckissack", "victorvictorkim"]

def getVideos(start, youtuber, videos):

	url = 'https://gdata.youtube.com/feeds/api/videos?&author=' + youtuber + '&alt=json&fields=entry(id)&max-results=50&start-index=' + str(start * 50 + 1)
	print url
	response = urllib2.urlopen(url).read()
	json_resp = json.loads(response)

	if 'entry' not in json_resp['feed']:
		return False

	for entry in json_resp['feed']['entry']:
		video_url = entry['id']['$t'] + '?alt=json&fields=published,title,content,gd:comments,media:group(media:thumbnail),gd:rating,yt:statistics'
		# print video_url
		video_response = urllib2.urlopen(video_url).read()
		video_json = json.loads(video_response)

		result = re.findall('youtube.com\/([\w\d]*)\s', video_json['entry']['content']['$t'])
		video_json['entry']['associations'] = result
		video_json['entry']['id'] = re.findall('videos\/(.*)', entry['id']['$t'])[0]
		videos.append(video_json['entry'])
	return start + 1

for youtuber in youtubers:
	videos = []
	exists = 0
	while True:
		print youtuber
		print 'loop'
		exists = getVideos(exists, youtuber, videos)
		if not exists:
			break
		time.sleep(60)

	print json.dumps(videos)
	f = open('raw/' + youtuber + '.json', 'w')
	f.write(json.dumps(videos))