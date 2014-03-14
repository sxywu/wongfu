import json
from pprint import pprint

# clean nodes.json
f = open('raw/nodes.json', 'r')
nodes = json.load(f)

cleaned = []
for node in nodes:
	clean = {}
	clean['author'] = node['author'][0]['name']['$t']
	clean['category'] = node['category'][1]['term'] if len(node['category']) > 1 else None
	clean['content'] = node['content']['$t']
	clean['index'] = node['index']
	clean['image'] = node['media$thumbnail']['url']
	clean['joined'] = node['published']['$t']
	clean['title'] = node['title']['$t']
	clean['youtuber'] = node['youtuber']
	clean['statistics'] = node['yt$statistics']
	cleaned.append(clean)
f.close()

f = open('data/nodes.json', 'w')
f.write(json.dumps(cleaned))
f.close()

# clean youtubers json
youtubers = ["wongfuproductions", "davidchoimusic", "kevjumba", "pauldateh", "kinagrannis", "nigahiga", "lilcdawg", "funemployed", "frmheadtotoe", "lanamckissack", "victorvictorkim"]

for youtuber in youtubers:
	print youtuber
	f = open('raw/' + youtuber + '.json')
	videos = json.load(f)

	cleaned = []
	for video in videos:
		clean = {}
		clean['associations'] = video['associations']
		clean['content'] = video['content']['$t']
		try:
			clean['comments'] = video['gd$comments']['gd$feedLink']['countHint']
		except KeyError, e:
			print e
		try:
			clean['rating'] = {'average': video['gd$rating']['average'], 'count': video['gd$rating']['numRaters']}
		except KeyError, e:
			print e
		clean['images'] = []
		for image in video['media$group']['media$thumbnail']:
			clean['images'].append(image['url'])
		clean['published'] = video['published']['$t']
		clean['title'] = video['title']['$t']
		try:
			clean['views'] = video['yt$statistics']['viewCount']
		except KeyError, e:
			print e
		cleaned.append(clean)

	f.close()
	f = open('youtubers/' + youtuber + '.json', 'w')
	f.write(json.dumps(cleaned))
	f.close()