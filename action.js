
//Define access token
mapboxgl.accessToken = 'pk.eyJ1Ijoiemd5NjY3NyIsImEiOiJjbGRtMHNzd2owNHJ1M3hxZmw0MTFkNnY3In0.G3OzgVvqC8WutLmLNhjGXw'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

//Initialize map
const map = new mapboxgl.Map({
    container: 'map', //container id in HTML
    style: 'mapbox://styles/robeemre/clg036rqs000r01rz8n9rv2so',  //stylesheet location creat our own style
    center: [-79.39, 43.65],  // starting point, longitude/latitude 43.652652, -79.393014 change to toronto
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
    geojson.features.pop(0)
    geojson.features.push(clickedpoint);
    //Update the datasource to include clicked points
    map.getSource('inputgeojson').setData(geojson);

    console.log(geojson.features)

});

// /*--------------------------------------------------------------------
// STORE USER INPUT FEATURES AS GEOJSON
// --------------------------------------------------------------------*/

document.getElementById('buffbutton').addEventListener('click', () => {

    //Create empty featurecollection for buffers
    buffresult = {
        "type": "FeatureCollection",
        "features": []
    };

    //Loop through each point in geojson and use turf buffer function to create 0.5km buffer of input points
    //Add buffer polygons to buffresult feature collection
    geojson.features.forEach((feature) => {
        let buff = turf.buffer(feature, 1); // creating features
        buffresult.features.pop(0)
        buffresult.features.push(buff); // adding
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

    // document.getElementById('buffbutton').disabled = true; //disable  button after click


});



//intialize geojson 
//Add data source and draw initial visiualization of layer change geojson
map.on('load', () => {

    //Use GeoJSON file as vector tile creates non-unique IDs for features which causes difficulty when highlighting polygons
    map.addSource('toronto', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/zgy6677/newlab3/main/Newmap3.geojson', //Link to raw github files when in development stage. Update to pages on deployment
    });

    //Add layer only once using case expression and feature state for opacity
    map.addLayer({
        'id': 'toronto-fill',
        'type': 'fill',
        'source': 'toronto',
        'paint': {
            'fill-color': '#fbb03b',
            'fill-opacity': 0.5, //CASE and FEATURE STATE expression sets opactity as 0.5 when hover state is false and 1 when updated to true
            'fill-outline-color': 'blue'
        }
       
    });

});

// ad pop-up window modify filed names

map.on('mouseenter', 'toronto-fill', () => {
    map.getCanvas().style.cursor = 'pointer'; //Switch cursor to pointer when mouse is over provterr-fill layer
});

map.on('mouseleave', 'toronto-fill', () => {
    map.getCanvas().style.cursor = ''; //Switch cursor back when mouse leaves provterr-fill layer
    //map.setFilter("provterr-hl",['==', ['get', 'PRUID'], '']);
});


map.on('click', 'toronto-fill', (e) => {
    new mapboxgl.Popup() 
        .setLngLat(e.lngLat) 
        .setHTML("<b>Part of Toronto:</b> " + e.features[0].properties.PART + "<br>" +
            "Population: " + e.features[0].properties.POP + "<br>" +
            "EU Origin:" + e.features[0].properties.EU + "<br>" +
            "Asia Origin:" + e.features[0].properties.ASIA) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
})


// add drop down list 
let boundaryvalue;

document.getElementById("boundaryfieldset").addEventListener('change',() => {   
    boundaryvalue = document.getElementById('boundary').value;
    
    console.log(boundaryvalue);

    if (boundaryvalue == 'All') {
        map.setFilter(
            'toronto-fill',
            ['has', 'PART'] //returns all polygons from layer that have a value in PRENAME field
        );
    } else {
        map.setFilter(
            'toronto-fill',
            ['==', ['get', 'PART'], boundaryvalue] //returns polygon with PRENAME value that matches dropdown selection
        );
    }

});


// add buffer by using turf







// // define buffer, points defined by click event 
// var buffered = turf.buffer(point, 2, {units: 'kilometers'});
