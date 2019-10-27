import csv
import json

with open('MER_T01_03.csv') as csvfile:
	readCSV = csv.reader(csvfile, delimiter=',')
	newset= []
	tobecsv = []
	lastdesc = ''
	years = ['type']
	for row in readCSV:
		year = row[1]
		value = row[2]
		desc = row[4]
		if year[-2:] == '13':
			year = year[:-2]
			if value == 'Not Available':
				value = 0
			if desc != lastdesc:
				try: 
					newset.append(newrow)
				except:
					pass
				newrow = []
				newrow.append(desc)
				newrow.append(float(value))
			else:
				newrow.append(float(value))
			if year not in years:
				years.append(year)
		lastdesc = desc
	tobecsv.append(years)
	newset.append(newrow)
	for e in newset:
		tobecsv.append(e)

	resultfile = csv.writer(open ('out.csv', 'w'), delimiter=',', lineterminator='\n')
	for x in tobecsv:
		resultfile.writerow(x)
	jsonData = {}
	jsonData['years'] = years[1:]
	for x in newset:
		label = x[0]
		jsonData[label] = x[1:]
	with open('out.js', 'w') as outfile:
		json.dump(jsonData, outfile)