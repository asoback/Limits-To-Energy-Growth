import csv

with open('DataSources/MER_T01_01.csv') as csv_file:
    with open('DataSources/newData.csv', mode='w') as out_file:
        csv_writer = csv.writer(out_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            if row['YYYYMM'][-2:] == '13':
                csv_writer.writerow([row['YYYYMM'][:-2], row['Description'], row['Value'], row['Unit']])