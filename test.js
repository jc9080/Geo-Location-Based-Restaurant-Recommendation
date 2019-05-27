const fullurl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&key=AIzaSyAUAaYODAySdg0ICAX4u9ganJ7gQGFz834"
const lat = 40.7233
const lng = -74.0030
const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&key=AIzaSyAUAaYODAySdg0ICAX4u9ganJ7gQGFz834`
console.log(url);
const request = require('request');

request(url, { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.results[0].name);
});
