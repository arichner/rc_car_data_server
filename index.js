/*

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

'use strict';

var socket = require('socket.io'),
    http = require('http'),
    rc_car = require('./lib/rc_car'),
    sleep = require('sleep'),
    server = http.createServer(),
    socket = socket.listen(server),
    pitch = 0,
    roll = 0,
    dt = 0.1, // 10 Hz, this is our time sample
    init = 0,
    calibrated = false,
    rollTot = 0,
    rollHome = 0;

const m_pi = 3.14159265359;


/**
*
* initialize socket and listen for connections
*
*/
server.listen(3000, function(){
    console.log('Server started');
    rc_car.set_leds(0,0,0);
    sleep.sleep(1);
    rc_car.set_leds(1,1,1);
    sleep.sleep(1);
    rc_car.set_leds(0,0,0);
});


/**
*
* handle a connection to the socket
*
*/
socket.on('connection', function(connect) {
    console.log('User Connected');
    connect.on('data', function(data){
        if(!calibrated) 
        {
            calibrate(data);
        }
        else
        {
            complementaryFilter(data);
            rc_car.makeCarGo(roll, pitch);
        }
    });

    // stop the motors if/when a client disconnects
    connect.on('disconnect', function() {
      console.log('User Disconnected');
      rc_car.set_motors(0,0);
   });
});


/**
*
* Ported to js based on math explained at http://www.pieter-jan.com/node/11
* 
* This filter combines accelerometer data with gyro data to provide accurate (ish?)
* roll and pitch of the devices 
*
* @param data
*
*/
function complementaryFilter(data){

    var pitchAcc, rollAcc;

    pitch += (data.gx) * dt;   // Angle around the X-axis
    roll -= (data.gy) * dt;    // Angle around the Y-axis

    // Turning around the X axis results in a vector on the Y-axis
    pitchAcc = Math.atan2(data.ay, data.az) * 180 / m_pi;
    pitch = pitch * 0.75 + pitchAcc * 0.25;

    // Turning around the Y axis results in a vector on the X-axis
    rollAcc = Math.atan2(data.ax, data.az) * 180 / m_pi;
    roll = roll * 0.75 + rollAcc * 0.25;

}

/**
*
* sets the initial angle for roll
*
* @param data
*
*/
function calibrate(data){
    complementaryFilter(data);
    rollTot += roll;
    init++;

    if(init > 10){
        rollHome = rollTot / init;
        socket.emit('calibrated', rollHome);
        calibrated = true;
    }
}