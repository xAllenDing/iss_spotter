// const request = require('request');
const request = require('request-promise-native')


const fetchMyIP = function (callback) {
  // use request to fetch IP address from JSON API

  request('https://api64.ipify.org?format=json', (error, response, body) => {

    if (error) {
      return callback(error, null);
    }

    const data = JSON.parse(body);

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      return callback(Error(msg), null);
    }

    console.log('statusCode:', response && response.statusCode);
    return callback(null, data.ip);
  });
};


const fetchCoordsByIP = function (ip, callback) {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {

    if (error) {
      return callback(error, null);
    }

    const data = JSON.parse(body);

    if (!data.success) {
      const msg = `Success status was ${data.success}. Server message says: ${data.message}`;
      return callback(Error(msg), null);
    }

    return callback(error, { latitude: data.latitude, longitude: data.longitude });
  });
};

const fetchISSFlyOverTimes = function ({ latitude, longitude }, callback) {
  request(`https://iss-flyover.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`, (error, response, body) => {

    if (error) {
      return callback(error, null);
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching ISS. Response: ${body}`;
      return callback(Error(msg), null);
    }

    const data = JSON.parse(body);

    return callback(error, data.response);
  })
};

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(coords, (error, riseTime) => {
        if (error) {
          return callback(error, null);
        }
        
        callback(error, riseTime);
      })
    })
  })
}

const fetchCustomIP = () => {
  return request('https://api64.ipify.org?format=json')
  .then((body) => {
    const data = JSON.parse(body); 

    return data.ip; 
  }); 
};




module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation, fetchCustomIP };