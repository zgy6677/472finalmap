
//Define access token
mapboxgl.accessToken = 'pk.eyJ1Ijoiemd5NjY3NyIsImEiOiJjbGRtMHNzd2owNHJ1M3hxZmw0MTFkNnY3In0.G3OzgVvqC8WutLmLNhjGXw'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

//Initialize map
const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/outdoors-v12',  //stylesheet location creat our own style
    center: [-79.39, 43.65],  // starting point, longitude/latitude 43.652652, -79.393014 change to toronto
    zoom: 12 // starting zoom level
});

//Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
// add geocoder check demo 



// fetch method to read data from github and save as vars

let pntgeojson;

// Fetch GeoJSON from URL and store response
fetch('https://raw.githubusercontent.com/zgy6677/472finalmap/main/GGR472update.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response); //Check response in console
        pntgeojson = response; // Store geojson as variable using URL from fetch response
    });



//======================================================
//   Add Clicked Point
//======================================================
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
            'circle-color': 'green',
            // if (e.features[0].properties.Category === "Parks") {
            //     'circle-color': 'green',
            // }

            'circle-color': 'yellow'
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


    let targetpnt = geojson.features 
    let pnts = pntgeojson.features
    console.log(targetpnt)
    console.log(pnts)

    let nearest = turf.nearestPoint(targetpnt, pnts);
    console.log(nearest) 


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
    if (buffresult.features.length === 0) { console.log("Array is empty!") }

    //Loop through each point in geojson and use turf buffer function to create 0.5km buffer of input points
    //Add buffer polygons to buffresult feature collection

    geojson.features.forEach((feature) => {
        let buff = turf.buffer(feature, 0.5); // creating features
        let buff1 = turf.buffer(feature, 1);
        let buff2 = turf.buffer(feature, 2);

        buffresult.features.push(buff);
        buffresult.features.push(buff1);
        buffresult.features.push(buff2); // adding
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
            'fill-color': "orange",
            'fill-opacity': 0.2,
            'fill-outline-color': "white"
        }
    }); 

});



// add 


//===============================
//intialize geojson 
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

//=====================
// ad pop-up window
//=====================

map.on('click', 'torontosites', (e) => {
    new mapboxgl.Popup() 
        .setLngLat(e.lngLat) 
        .setHTML("<b>Name:</b> " + e.features[0].properties.Name + "<br>" +
            "<b>Address:</b> " + e.features[0].properties.Address + "<br>" +
            "<b>Rating:</b>" + e.features[0].properties.Rating + "<br>" +
            "<b>Description:</b>" + e.features[0].properties.Description) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
})

//====================
// add drop down list filter
//====================

let sitevalue;

document.getElementById("interests").addEventListener('change',() => {   
    sitevalue = document.getElementById('site').value;
    
    console.log(sitevalue);

    if (sitevalue == 's') {
        map.setFilter(
            'torontosites',
            ['has', 'Category'] //returns all
        );
    } else {
        map.setFilter(
            'torontosites',
            ['==', ['get', 'Category'], sitevalue] //returns selected points
        );
    }

});

let sitevalue1;

document.getElementById("interests1").addEventListener('change',() => {   
    // sitevalue1 = document.getElementById('site1').value;
    catevalue = document.getElementById('site').value;
    if (catevalue === 'Parks') {
        document.getElementById('all1').style.visibility = 'hidden';
        document.getElementById('hist1').style.visibility = 'hidden';
        document.getElementById('restro1').style.visibility = 'hidden';
        parkvalue1 = document.getElementById('park1').value;  
        
    console.log(catevalue);
    map.setFilter(
        'torontosites',
        ['==', ['get', 'Details'], park1] //returns selected points
    );   
    }
    








    // console.log(sitevalue1);
    //     map.setFilter(
    //         'torontosites',
    //         ['==', ['get', 'Details'], sitevalue1] //returns selected points
    //     );
});




//==================
// add nearest point
//==================

// let targetpnt = geojson
// let pnts = pntgeojson
// let near = turf.nearestPoint(targetpnt, pnts)

// console.log(near.properties(0).Name)


// 1. geocoder not showing
// 2. seperate colors by categories 
// 3. buffer can only do one time 

// 4. can not select by buffer (Extra)


// 5. how to show nearest point
//       print the result on html
// 6. can not import all geo-points into array
// 7. change points to symbols?