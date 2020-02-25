import xml.etree.ElementTree as ET
import json

data = {}
node_info = {}

def parse_way(way):
    nodes = []
    for w in way:
        if w.tag == 'nd':
            nodes.append(w.attrib['ref'])
    return nodes

def create_node(nodes, i):
    length = len(nodes)
    if i == 0:
        pre_node = None
        next_node = nodes[i+1]
    elif i == length-1:
        pre_node = nodes[i-1]
        next_node = None
    else:
        pre_node = nodes[i-1]
        next_node = nodes[i+1]
    return pre_node, nodes[i], next_node

def create_data_info(current_node):
    lat, lon = node_info[current_node]['lat'], node_info[current_node]['lon']
    data[current_node] = {'lat': lat, 'lon':lon,'adj':[]}

def add_nodes(nodes):
    length = len(nodes)
    for i in range(length):
        pre_node, current_node, next_node = create_node(nodes, i)
        if not data.has_key(current_node):
            create_data_info(current_node)
        if pre_node:
            data[current_node]['adj'].append(pre_node)
        if next_node:
            data[current_node]['adj'].append(next_node)

def create_nodes_info(node):
    node_id, lat, lon = node.attrib['id'], node.attrib['lat'], node.attrib['lon']
    node_info[node_id] = {'lat': float(lat), 'lon': float(lon)}

def store_json(data):
    with open('nodes.json', 'w') as f:
        f.write(json.dumps(data))


def main():
    tree = ET.ElementTree(file='map.osm')
    root = tree.getroot()

    for child_root in root:
        if child_root.tag == 'node':
            create_nodes_info(child_root) 

    for child_root in root:
        if child_root.tag == 'way':
            nodes = parse_way(child_root)
            add_nodes(nodes)
    
    store_json(data)  

if __name__ == "__main__":
    main() 
