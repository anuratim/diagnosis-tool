#!/usr/bin/env python

# Takes in CSV file of disease hierarchy
#   and writes out json file of disease hierarchy.
#
# Translates this:
#   Acne,67548,Derm
#   Anemia,160481,Blood
#
# To this:
# {
#  "name": "Derm",
#  "children": [
#   {"name": "Acne", "size": 67548}
#  ]
# },
# {
#  "name": "Blood",
#  "children": [
#   {"name": "Anemia", "size": 160481}
#  ]
# },

import json
from operator import itemgetter, attrgetter
from collections import defaultdict

lookup = defaultdict(list)
emptySet = []

diseases = []

# lookup = {
# }
# }
# }
# }
# Abrasion and/or friction burn of skin,12313,Derm
with open('diag_cat.csv', 'rU') as f:
    for line in f:
        line = line.rstrip()
        disease_name, disease_num, disease_category = line.split('|')
        disease_name = disease_name.replace('"', '').rstrip(' ')
        if disease_category == '':
            disease_category = 'No category'
        disease_entry = [disease_name, disease_num]
        lookup[disease_category].append(disease_entry)
        #print "creating new class:", a[2]

with open('disease_tree.json', 'w') as f:
    f.write('{\n \"name\": \"diseases\",\n \"children\": [\n')
    count = 0
    for k in lookup.keys():
        count += 1
        print "key: ", k
        f.write('{\n')
        f.write(' \"name\": \"' + k + '\"' + ',\n')
        f.write(' \"children\": [\n')
        countInner = 0
        for i in lookup[k]:
            countInner += 1
            f.write('    {\"name\": \"' + i[0] + '\", \"size\": ' + i[1])

            f.write ('}')
            if countInner != len(lookup[k]):
                f.write(',')
            f.write('\n')
        f.write('  ]\n')
        f.write('}')
        if count != len(lookup):
            f.write(',')
        f.write('\n')
    f.write(']\n}')
