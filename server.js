'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('./'));

app.get('/hello', (request, response) => {
  response.status(200).send('Hello');
});

// Request for location (lat & lng)
app.get('/location', (request,response) => {
  try{
    //queryData is what the user typed into the box
    const queryData = request.query.data;
    //make a request to the Google Geocoding API for geocoding data
    let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    superagent.get(geocodeURL)
      .end((err, googleMapsApiResponse) => {

        //turn it into a location instance
        const location = new Location(queryData, googleMapsApiResponse.body);

        //send response
        response.send(location);
      });
  } catch(error){
    console.log('There was an error with location')
    response.status(500).send('Status: , error on location');
  }
});

app.get('/weather', (request,response) => {
  try{
    //queryData is what the user typed into the box
    const queryData = request.query.data;
    //make a request to the Google Geocoding API for geocoding data
    let weatherURL = `https://api.darksky.net/forecast/${WEATHER_API_KEY}/${queryData.latitude},${queryData.longitude}`;
    superagent.get(weatherURL)
      .end((err, weatherApiResponse) => {

        //turn it into a location instance
        const weather = getWeather(weatherApiResponse);

        //send response
        response.send(weather);
      });
  } catch(error){
    console.log('There was an error with location')
    response.status(500).send('Status: , error on location');
  }
});

app.get('/weather', (request, response) => {
  try {
    const weatherData = getWeather();
    response.send(weatherData);
  }
  catch(error) {
    console.error(error);
    response.status(500).send('Status: 500. So sorry, something went wrong.');
  }
});

// Helper Functions

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}

function getWeather(response) {
  // const darkskyData = require('./data/darksky.json');

  return response.body.data.map(day => {
    return new Weather(day);
  });

}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

app.listen(PORT,() => console.log(`Listening on port ${PORT}`));

