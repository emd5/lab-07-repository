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
    handleError(error, 'location');
  }
});

// Weather Darksky API
app.get('/weather', (request,response) => {
  try{
    //make a request to the Google Geocoding API for geocoding data
    let weatherURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
    superagent.get(weatherURL)
      .end((err, weatherURL) => {

        //turn it into a location instance
        const weather = getWeather(weatherURL.body);

        //send response
        response.send(weather);
      });
  } catch(error){
    handleError(error, 'weather');
  }
});

// Eventbrite  API
app.get('/events', (request,response) => {
  try{
    //make a request to the Google Geocoding API for geocoding data
    let eventURL = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${request.query.data.longitude}&location.latitude=${request.query.data.latitude}&expand=venue`;
    superagent.get(eventURL)
      .set('Authorization', `Bearer ${process.env.EVENTBRITE_API_KEY}`)
      .end((err, eventURL) => {

        //turn it into a location instance
        const event = getEvents(eventURL.body.events);

        //send response
        response.send(event);
      });
  } catch(error){
    handleError(error, 'events');
  }
});

// Constructors
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Event(eventInfo){
  this.link = eventInfo.url;
  this.name = eventInfo.name.text;
  this.event_date = new Date(eventInfo.start.local).toDateString();
  this.summary = eventInfo.summary;

}

// Helper Functions
function getWeather(weatherResponse) {
  return weatherResponse.daily.data.map(day => {
    return new Weather(day);
  });
}

function getEvents(eventResponse){
  let result = eventResponse.map(event => new Event(event));
  return result.splice(0,20);
}

//Error handling

function handleError(response, endpoint){
  response.status(500).send({status: 500 , responseText: `Error on ${endpoint}`});
  
}


app.listen(PORT,() => console.log(`Listening on port ${PORT}`));

