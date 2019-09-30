
var map = L.map('map').setView([51.555,45.8],7);
var popup_text = new Map();
var line_color = new Map();
var circle_radius = new Map();

var template = '<div id="marker"><input type="text" placeholder="Описание объекта" name="email"></div>';
osm = L.tileLayer('osm/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);

 
var geojsonMarkerOptions = {
	//icon: nup,
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
var nup = L.Icon.extend({
				options: {
								shadowUrl: null,
								iconAnchor: new L.Point(12, 12),
								iconSize: new L.Point(60, 62),
								iconUrl: 'images/nup2.png'
				}
});

//var geojsonMarkerOptions = {
//radius: 8,
//fillColor: "#ff7800",
//color: "#000",
//weight: 1,
//opacity: 1,
//fillOpacity: 0.8
//};
//function onEachFeature(feature, layer) {
				//if(feature.hasOwnProperty('popupContent'))
								//layer.bindPopup(feature.popupContent);
//}
function pointToLayer(feature, latlng) {
				if(feature.properties.RAD > "0"){
								return L.circle(latlng,feature.properties.RAD);}
												else {
								return L.marker(latlng);}       
}
// Would benefit from https://github.com/Leaflet/Leaflet/issues/4461
function addNonGroupLayers(sourceLayer, targetGroup) {
				if (sourceLayer instanceof L.LayerGroup) {
								sourceLayer.eachLayer(function(layer) {
												addNonGroupLayers(layer, targetGroup);

											
												if (layer.getPopup().getContent() != "undefined") {
												popup_text[layer._leaflet_id] = layer.getPopup().getContent();
												}
												if (drawnItems._layers[layer._leaflet_id]._mRadius != "undefined") {
												circle_radius[layer._leaflet_id] = drawnItems._layers[layer._leaflet_id]._mRadius;
											}
								});
				} else {
								targetGroup.addLayer(sourceLayer);
				}
}  

// FeatureGroup is to store editable layers
var drawnItems = new L.FeatureGroup();
$.getJSON("json/data.geojson",function(data){
				// add GeoJSON layer to the map once the file is loaded
				var datalayer = L.geoJson(data ,{
								//onEachFeature: onEachFeature,
								pointToLayer: pointToLayer,
								featureGroup: drawnItems,
								onEachFeature: function(feature, featureLayer) {
												featureLayer.bindPopup(feature.properties.NAME);
												if(feature.properties.RAD != "undefined"){
													console.log(feature.properties.RAD);
												}
												}
				});
				addNonGroupLayers(datalayer, drawnItems);
});

map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
				edit: {
								featureGroup: drawnItems
				},
				draw: {
								marker: {
											//	icon: new nup()
								},
								circle: {
									shapeOptions: {
										color: '#0f0f0f'
										}
								}
				}
});



 

map.on(L.Draw.Event.CREATED, function (e) {
				var type = e.layerType,
								layer = e.layer;
								flag = 1;
				if (type === 'marker') {
								layer.bindPopup(template);
								layer.on('popupopen', function(e) {
								var name1 = popup_text[layer._leaflet_id];
												if(flag === 0){
																
																layer.bindPopup('<div id="marker">' + name1 + '</div>');}
													else {
													if(name1){
													layer.bindPopup('<div id="marker"><input type="text" placeholder=' + name1 + '></div>');}
											
													else {
													layer.bindPopup(template);}
													
													}

								});
								layer.on('popupclose', function(e) {
												
												if(flag === 1){
												//json.features.NAME = document.getElementById('marker').childNodes[0].value;
												var NAME = document.getElementById('marker').childNodes[0].value;
												popup_text[layer._leaflet_id] = NAME;}
										flag = 0;
								});

				}
				if (type === 'circle') {
					layer.on('add', function(e) {
						layer_id = layer._leaflet_id;
						var RADIUS = drawnItems._layers[layer_id]._mRadius;	
						circle_radius[layer._leaflet_id] = RADIUS;
						var COLOR = drawnItems._layers[layer_id].options.color;
						line_color[layer._leaflet_id] = COLOR;
					});
				}
				drawnItems.addLayer(layer);
});

map.on(L.Draw.Event.EDITED, function (e) {
		
				var layers = e.layers;
				var countOfEditedLayers = 0;
				layers.eachLayer(function (layer) {
								countOfEditedLayers++;
				});

				console.log("Edited " + countOfEditedLayers + " layers");
});

map.on(L.Draw.Event.EDITSTART, function (e) {
flag = 1;				
				
});

L.control.layers({
				'OSM': osm.addTo(map)
}, { 'Рисование': drawnItems }, { position: 'topright', collapsed: false }).addTo(map);  

map.addControl(drawControl);  
  L.control.mouseCoordinate().addTo(map);  
//Сфокусировать экран  
//map.fitBounds(datalayer.getBounds());  

//Экспорт в файл на сервере
document.getElementById('export').onclick = function(e) { 
				var json = {
					"type": "FeatureCollection",
					"features": []
				};
				drawnItems.eachLayer(function(data) {
					var jsoon = data.toGeoJSON();
					jsoon.properties.NAME = popup_text[data._leaflet_id];
					jsoon.properties.COLOR = line_color[data._leaflet_id];
					jsoon.properties.RAD = circle_radius[data._leaflet_id];
					json.features.push(jsoon);
				});   
				
				
//				
//				json.features.NAME = hashMap
				var convertedData = JSON.stringify(json);
				// Create export
				// document.getElementById('export').setAttribute('href', 'data:' + convertedData);
				// document.getElementById('export').setAttribute('download','data.geojson');
				$.ajax({
								url: 'save.php',
								data : {'jsonString':convertedData},
								type: 'POST'
				});

}

