import json
import os

START_VALUE = 100
CONSUMPTION_INPUT_FILE = 'GlobalConsumption.json'
RESERVES_INPUT_FILE = 'reserves.json'
OUTPUT_FILE = 'indexedData.json'

if os.path.exists(OUTPUT_FILE):
    os.remove(OUTPUT_FILE)

with open(CONSUMPTION_INPUT_FILE, 'r') as consumption_file:
    start_energy_dict = json.load(consumption_file)

with open(RESERVES_INPUT_FILE, 'r') as reserves_file:
    reserves_dict = json.load(reserves_file)

# Check that the start year and end year is the same for all
for item in start_energy_dict:
    if item['years'][0] != 1980 and item['years'][:-1] != 2016:
        print("The years don't match what is expected")

# Generate a dict for indexed values
indexed_energy_dict = []

# Get years
indexed_energy_dict.append({"years": []})
for year in start_energy_dict[0]['years']:
    indexed_energy_dict[0]["years"].append(year)

# In order to create the index, we need to assume a start value
# We can gather the totals for all energy sources in the first year
# and ratio that to the start value
# then we can index the rest of the values compared to their starting value

def checkDataDictType(dataDict):
    return dataDict['unit']

# Conversion functions
# take data object, and index place
# return value in Quad BTU
def convertMillionBarrelsDayToQBTU(dataDict, index):
    assert(checkDataDictType(dataDict) == "Mb/d")
    # 1 million barrel oil = .00555136 quad btu
    return round(dataDict["data"][index] * 365 * 0.00000555, 2)

def convertMillionShortTonsToQBTU(dataDict, index):
    assert(checkDataDictType(dataDict) == "Mst")
    # TODO check if ton is same as short ton.
    # 1 million ton coal = .02778 quad btu
    return round(dataDict["data"][index]  * 0.00002778, 2)

def convertBcfToQBTU(dataDict, index):
    assert(checkDataDictType(dataDict) == "bcf")
    # Billion cubicfeet gas = .001027 quad btu
    return round(dataDict["data"][index] * 0.001027, 2)

def QBTU2QBTU(dataDict, index):
    return dataDict["data"][index]

def BB2QBTU(dataDict, index):
    assert(checkDataDictType(dataDict) ==  "Billion Barrels")
    # 1 million barrel oil = .00555136 quad btu
    return round(dataDict["data"][index] * 1000 * 0.00000555, 2)

def TCF2QBTU(dataDict, index):
     assert(checkDataDictType(dataDict) == "Trillion Cubic Feet")
    # Billion cubicfeet gas = .001027 quad btu
    return round(dataDict["data"][index] * 1000 * 0.001027, 2)

switchType = {
    "Mb/d": convertMillionBarrelsDayToQBTU,
    "Mst": convertMillionShortTonsToQBTU,
    "bcf": convertBcfToQBTU,
    "quad Btu": QBTU2QBTU,
    "Billion Barrels":BB2QBTU,
    "Trillion Cubic Feet":TCF2QBTU
}

def convertDatatoQBTU(dataDict, index):
    func = switchType.get(dataDict["unit"], "error")
    return func(dataDict, index)

# First year total demand
total_demand_year_0 = 0
for item in start_energy_dict:
    total_demand_year_0 = total_demand_year_0 + convertDatatoQBTU(item, 0)

item_index = len(indexed_energy_dict)
for item in start_energy_dict:
    indexed_energy_dict.append({"type": item["type"], "data": []})
    data_index = 0
    for data_item in item["data"]:
        indexed_energy_dict[item_index]["data"].append(round(convertDatatoQBTU(item, data_index) / total_demand_year_0 * START_VALUE, 2))
        data_index = data_index + 1
    item_index = item_index + 1


THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
output = os.path.join(THIS_FOLDER, OUTPUT_FILE)
with open(output, 'w') as f:
    f.write(json.dumps(indexed_energy_dict, separators=(',', ': '), indent=4))

