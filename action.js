/*--------------------------------------------------------------------
GGR472 WEEK 9: Introduction to Turf.js
ii) Working with user input data
--------------------------------------------------------------------*/

//Define access token
mapboxgl.accessToken = ''; //****ADD YOUR PUBLIC ACCESS TOKEN*****

//Initialize map
const map = new mapboxgl.Map({
    container: 'map', //container id in HTML
    style: 'mapbox://styles/mapbox/streets-v12',  //stylesheet location
    center: [-79.39, 43.65],  // starting point, longitude/latitude 43.652652, -79.393014
    zoom: 12 // starting zoom level
});

//Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


/*--------------------------------------------------------------------
STORE USER INPUT FEATURES AS GEOJSON
--------------------------------------------------------------------*/

// Create empty GeoJSON objects to hold point features
let geojson = {
    'type': 'FeatureCollection',
    'features': []
};

//Set data source and style on map load
map.on('load', () => {
    //Add datasource using GeoJSON variable
    map.addSource('inputgeojson', {
        type: 'geojson',
        data: geojson
    });

    //Set style for when new points are added to the data source
    map.addLayer({
        'id': 'input-pnts',
        'type': 'circle',
        'source': 'inputgeojson',
        'paint': {
            'circle-radius': 5,
            'circle-color': 'blue'
        }
    });

});

//Add input features to data source based on mouse click and display in map
map.on('click', (e) => {
    //Store clicked point as geojson feature
    const clickedpoint = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [e.lngLat.lng, e.lngLat.lat]
        }
    };

    //Add clicked point to previously empty geojson FeatureCollection variable
    geojson.features.push(clickedpoint);

    //Update the datasource to include clicked points
    map.getSource('inputgeojson').setData(geojson);

});

/*--------------------------------------------------------------------
STORE USER INPUT FEATURES AS GEOJSON
--------------------------------------------------------------------*/

document.getElementById('buffbutton').addEventListener('click', () => {

    //Create empty featurecollection for buffers
    buffresult = {
        "type": "FeatureCollection",
        "features": []
    };

    //Loop through each point in geojson and use turf buffer function to create 0.5km buffer of input points
    //Add buffer polygons to buffresult feature collection
    geojson.features.forEach((feature) => {

        //YOUR CODE HERE
        //  --> 1. Create variable for buffer and use turf.buffer function
        //  --> 2. Use features.push (as in map click event above) to add the buffer feature to the empty featureclass

    });

    map.addSource('buffgeojson', {
        "type": "geojson",
        "data": buffresult  //use buffer geojson variable as data source
    })

    //Show buffers on map using styling
    map.addLayer({
        "id": "inputpointbuff",
        "type": "fill",
        "source": "buffgeojson",
        "paint": {
            'fill-color': "blue",
            'fill-opacity': 0.5,
            'fill-outline-color': "black"
        }
    });

    document.getElementById('buffbutton').disabled = true; //disable  button after click


});
