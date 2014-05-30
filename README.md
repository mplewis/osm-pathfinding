# OSM Pathfinding

## About

This is a final project for UMN CSCI 4511W. We are making a pathfinding algorithm visualization. It shows how pathfinding algorithms like A* behave in real world scenarios like finding directions on a map in real time.

## Tools used

### [Mapbox](https://www.mapbox.com/) & [OpenStreetMap](http://www.openstreetmap.org/about)

>With Mapbox, design and then publish maps that tell stories, integrate with apps, and represent brands.

Our background maps are provided by Mapbox, which creates maps based on data obtained from OpenStreetMap.

>OpenStreetMap is built by a community of mappers that contribute and maintain data about roads, trails, cafés, railway stations, and much more, all over the world.

We are obtaining raw node information such as gps coordinates directly from OpenStreetMap. This data is pre-processed by the [osm-redis-processor](https://github.com/mplewis/osm-redis-processor) and loaded into the redis database. To save time we have created a database dump of  node information for the UMN East Bank campus area.

### [Leaflet](http://leafletjs.com/)

>An Open-Source JavaScript Library for Mobile-Friendly Interactive Maps

We use leaflet to display beautiful markers during the pathfinding process.

### [Bootstrap](http://getbootstrap.com/)

>Bootstrap makes front-end web development faster and easier. It's made for folks of all skill levels, devices of all shapes, and projects of all sizes.

We are using Boostrap to create a responsive front-end for the visualizations. Whether a user has a 3 inch or 3 foot screen, our app should still look good.

## Installation

1.  Clone the osm-pathfinding repo to your computer.

		$ git clone https://github.com/mplewis/osm-pathfinding.git
		$ cd osm-pathfinding

2. Start an http server in the `osm-pathfinding` folder. Any server will work, we're using python's built-in server for ease of use.

		$ python -m SimpleHTTPServer

3. In a web browser, navigate to `osm.html` (`http://localhost:8000/osm.html` when using the python server)
