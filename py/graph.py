import json
import urllib2

youtubers = ["wongfuproductions", "davidchoimusic", "kevjumba", "pauldateh", "kinagrannis", "nigahiga", "lilcdawg", "funemployed", "frmheadtotoe", "lanamckissack", "victorvictorkim"]
allLinks = {}

for youtuber in youtubers:
	f = open('../youtubers/' + youtuber + '.json')
	videos = json.load(f)
	l = {}

	for video in videos:
		for association in video['associations']:
			association = association.lower()
			if association in l:
				l[association].append(video['published'])
			else:
				l[association] = [video['published']]

	f.close()

	allLinks[youtuber] = l

youtubers = {}
links = []
for source, l in allLinks.items():
	for target, weight in l.items():
		if len(weight) > 5:
			if source not in youtubers:
				youtubers[source] = len(youtubers)
			if target not in youtubers:
				youtubers[target] = len(youtubers)
			i = 1
			for date in weight:
				links.append({'source':youtubers[source], 'target':youtubers[target], 'weight': i, 'date': date})
				i += 1

# nodes = []
# for youtuber, index in youtubers.items():
# 	url = "https://gdata.youtube.com/feeds/api/users/" + youtuber + "?&alt=json&fields=id,published,title,author,content,category,yt:statistics,media:thumbnail"
# 	print url
# 	try:
# 		response = urllib2.urlopen(url).read()
# 	except urllib2.HTTPError, e:
# 		print e

# 	json_resp = json.loads(response)

# 	json_resp['entry']['youtuber'] = youtuber
# 	json_resp['entry']['index'] = index

# 	nodes.append(json_resp['entry'])
	
print json.dumps(links)
# print json.dumps(nodes)

# f = open('../raw/nodes.json', 'w')
# f.write(json.dumps(nodes))
# f.close()

f = open('../data/links.json', 'w')
f.write(json.dumps(links))
f.close()