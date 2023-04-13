
//Define access token
mapboxgl.accessToken = 'pk.eyJ1Ijoiemd5NjY3NyIsImEiOiJjbGRtMHNzd2owNHJ1M3hxZmw0MTFkNnY3In0.G3OzgVvqC8WutLmLNhjGXw'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

//Initialize map
const map = new mapboxgl.Map({
    container: 'map', 
    // style: 'mapbox://styles/mapbox/outdoors-v12',  //stylesheet location we created for bakcup
    style: 'mapbox://styles/robeemre/clg036rqs000r01rz8n9rv2so',
    center: [-79.39, 43.65],  // starting point, longitude/latitude 43.652652, -79.393014 for toronto
    zoom: 12 // starting zoom level
});

//Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
// add geocoder check demo 
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);


// fetch method to read data from github and save as vars

let pntgeojson;

// Fetch GeoJSON from URL and store response
fetch('https://raw.githubusercontent.com/zgy6677/472finalmap/main/GGR472update.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response); //Check response in console
        pntgeojson = response; //Store geojson as variable using URL from fetch response
    });

//=====================
// add pop-up window
//=====================

map.on('click', 'torontosites', (e) => {
    new mapboxgl.Popup() 
        .setLngLat(e.lngLat) 
        .setHTML("<b>Name: </b> " + e.features[0].properties.Name + "<br>" +
            "<b>Address: </b> " + e.features[0].properties.Address + "<br>" +
            "<b>Rating: </b>" + e.features[0].properties.Rating + "<br>" +
            "<b>Description: </b>" + e.features[0].properties.Description) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
})

//====================
// add drop down list filter
//====================
let dropfilter = {
    'type': 'FeatureCollections',
    'features': []
};

let sitevalue;

document.getElementById("category").addEventListener('change',() => {   
    myselect = document.getElementById('detail');
    sitevalue = document.getElementById('category').value;
    
    console.log(sitevalue);

    // if (sitevalue == 'Parks') {
    //     // myselect.remove(1);
    //     // myselect.remove(2);
    //     // myselect.remove(3);
    //     // myselect.remove(6);
    //     // myselect.remove(7);
    //     // myselect.remove(8);
    //     // myselect.remove(9);
    //     // myselect.remove(10)
    // };
    // if (sitevalue == 'Attractions') {
    //     myselect.remove(4);
    //     myselect.remove(5);
    //     myselect.remove(6);
    //     myselect.remove(7);
    //     myselect.remove(8);
    //     myselect.remove(9);
    //     myselect.remove(10)
    // };        
    // if (sitevalue == 'Restaurants') {
    //     myselect.remove(1);
    //     myselect.remove(2);
    //     myselect.remove(3);
    //     myselect.remove(4);
    //     myselect.remove(5)
    // };

    if (sitevalue == 's') {
        map.setFilter(
            'torontosites',
            ['has', 'Category'] //returns all sites
        );
    } else {
        map.setFilter(
             'torontosites',
            ['==', ['get', 'Category'], sitevalue] //returns selected points
         );

        // pntgeojson.features.forEach((feature) => {
        //     if (feature.properties.Category == sitevalue) {
        //         dropfilter.features.push(feature); 
        //     }
        // });
        // console.log(dropfilter)

    };
});


let sitevalue1;
document.getElementById("detail").addEventListener('change',() => {   
    sitevalue1 = document.getElementById('detail').value;
    // pntgeojson.features.forEach((feature) => {
    //     if (feature.properties.Details == sitevalue1) {
    //         dropfilter.features.push(feature); 
    //     }
    // });

    // console.log(dropfilter)

    map.setFilter(
        'torontosites',
        ['==', ['get', 'Details'], sitevalue1] //returns selected points
    );   
});

//======================================================
//   Add Clicked Point
//======================================================
// Create empty GeoJSON objects to hold point features
let geojson = {
    'type': 'FeatureCollection',
    'features': []
};

let nearpnt = []

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

     //Use GeoJSON file as vector tile creates non-unique IDs for features which causes difficulty when highlighting polygons
     map.addSource('toronto', {
        type: 'geojson',
        data: pntgeojson
    });

    //Add layer only once using case expression and feature state for opacity
    map.addLayer({
        'id': 'torontosites',
        'type': 'circle',
        'source': 'toronto',
        'paint': {
            'circle-radius': 4,
            'circle-color': ["match", ["get", "Category"],
                ["Parks"],"green",["Attractions"],"purple",
                "red"
            ]
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

    var nearest = turf.nearestPoint(geojson.features[0], pntgeojson);
    console.log(nearest)
    
    document.getElementById("nearestn").innerHTML = nearest.properties.Name;
    document.getElementById("nearesta").innerHTML = nearest.properties.Address;
    document.getElementById("nearestd").innerHTML = nearest.properties.Description;
    // console.log(nearest) 

//=================
// Add Jump To the Nearest Function
//=================

    document.getElementById('jumpto').addEventListener('click',() => {
        map.flyTo ({
            center: nearest.geometry.coordinates,
            zoom: 15,
            essential: true
        });
    });



});


//=================
// add buffer
//=================


document.getElementById('buffbutton').addEventListener('click', () => {

    //Create empty featurecollection for buffers
    buffresult = {
        "type": "FeatureCollection",
        "features": []
    };

    // check if array is empty
    // if (buffresult.features.length === 0) { console.log("Array is empty!") }

    //Loop through each point in geojson and use turf buffer function to create 0.5km buffer of input points
    //Add buffer polygons to buffresult feature collection

    geojson.features.forEach((feature) => {
        buffresult.features.push(turf.buffer(feature, 0.5));
        buffresult.features.push(turf.buffer(feature, 1));
        buffresult.features.push(turf.buffer(feature, 2)); // adding
    });

    console.log(buffresult)

    if (map.getSource('buff')) {
        map.removeLayer('inputpointbuff')
        map.removeSource('buff')
    }


    map.addSource('buff', {
        "type": "geojson",
        "data": buffresult
      //use buffer geojson variable as data source
    })

    // let nearest = turf.nearestPoint(geojson.features[0], pntgeojson.features);

    //Show buffers on map using styling
    map.addLayer({
        "id": "inputpointbuff",
        "type": "fill",
        "source": "buff",
        "paint": {
            'fill-color': "orange",
            'fill-opacity': 0.2,
            'fill-outline-color': "white"
        }
    }); 

});


//=================
// select by buffer
//=================


document.getElementById('selection').addEventListener('click', () => {

    //Create empty featurecollection for selected points
    selected = {
        "type": "FeatureCollection",
        "features": []
    };

    mask = turf.buffer(geojson.features[0], 2); // create mask 

    pntgeojson.features.forEach((feature) => {
        if (turf.booleanPointInPolygon(feature, mask)) {
            selected.features.push(feature); 
        }
    });

    if (map.getSource('hlight')) {
        map.removeLayer('highlighted')
        map.removeSource('hlight')
    }


    map.addSource('hlight', {
        "type": "geojson",
        "data": selected
      //use selected as source
    })
    //add selected on map
    map.addLayer({
        "id": "highlighted",
        'type': 'circle',
        'source': 'hlight',
        'paint': {
            'circle-radius': 4,
            'circle-color': 'yellow'
        }
    }); 

});


//===============================
//intialize geojson == BACK UP
//===============================

//Add data source and draw initial visiualization of layer change geojson
// map.on('load', () => {

//     // //Use GeoJSON file as vector tile creates non-unique IDs for features which causes difficulty when highlighting polygons
//     // map.addSource('toronto', {
//     //     type: 'geojson',
//     //     data: 'https://raw.githubusercontent.com/zgy6677/472finalmap/main/GGR472update.geojson', //Link to raw github files when in development stage. Update to pages on deployment
//     // });

//     // //Add layer only once using case expression and feature state for opacity
//     // map.addLayer({
//     //     'id': 'torontosites',
//     //     'type': 'circle',
//     //     'source': 'toronto',
//     //     'paint': {
//     //         'circle-radius': 4,
//     //         'circle-color': 'green',
//     //         // if (e.features[0].properties.Category === "Parks") {
//     //         //     'circle-color': 'green',
//     //         // }

//     //         'circle-color': 'yellow'
//     //     }
//     // });

// });


//====================
// add drop down list filter
//====================

// let sitevalue;

// document.getElementById("category").addEventListener('change',() => {   
//     myselect = document.getElementById('detail');
//     sitevalue = document.getElementById('category').value;
    
//     console.log(sitevalue);

//     // if (sitevalue == 'Parks') {
//     //     myselect.remove(1);
//     //     myselect.remove(2);
//     //     myselect.remove(3);
//     //     myselect.remove(6);
//     //     myselect.remove(7);
//     //     myselect.remove(8);
//     //     myselect.remove(9);
//     //     myselect.remove(10)
//     // };
//     // if (sitevalue == 'Attractions') {
//     //     myselect.remove(4);
//     //     myselect.remove(5);
//     //     myselect.remove(6);
//     //     myselect.remove(7);
//     //     myselect.remove(8);
//     //     myselect.remove(9);
//     //     myselect.remove(10)
//     // };        
//     // if (sitevalue == 'Restaurants') {
//     //     myselect.remove(1);
//     //     myselect.remove(2);
//     //     myselect.remove(3);
//     //     myselect.remove(4);
//     //     myselect.remove(5)
//     // };

//     if (sitevalue == 's') {
//         map.setFilter(
//             'torontosites',
//             ['has', 'Category'] //returns all
//         );
//     } else {
//         map.setFilter(
//             'torontosites',
//             ['==', ['get', 'Category'], sitevalue] //returns selected points
//         );

//     };
// });

// let sitevalue1;

// document.getElementById("detail").addEventListener('change',() => {   
//     sitevalue1 = document.getElementById('detail').value;
//     map.setFilter(
//         'torontosites',
//         ['==', ['get', 'Details'], sitevalue1] //returns selected points
//     );   
// });



// add legend
//Declare arrayy variables for labels and colours
const legendlabels = [
    'Parks',
    'Attractions',
    'Restaurants'
];

const legendcolours = [
    'green',
    'purple',
    'red'
];

//Declare legend variable using legend div tag
const legend = document.getElementById('legend');

//For each layer create a block to put the colour and label in
legendlabels.forEach((label, i) => {
    const color = legendcolours[i];

    const item = document.createElement('div'); //each layer gets a 'row' - this isn't in the legend yet, we do this later
    const key = document.createElement('span'); //add a 'key' to the row. A key will be the color circle

    key.className = 'legend-key'; //the key will take on the shape and style properties defined in css
    key.style.backgroundColor = color; // the background color is retreived from teh layers array

    const value = document.createElement('span'); //add a value variable to the 'row' in the legend
    value.innerHTML = `${label}`; //give the value variable text based on the label

    item.appendChild(key); //add the key (color cirlce) to the legend row
    item.appendChild(value); //add the value to the legend row

    legend.appendChild(item); //add row to the legend
});
