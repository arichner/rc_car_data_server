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

A few notes:

* i2c-bus will only run on specific architectures, primarily the Raspberry Pi.
* i2c-bus will throw an error upon init if there is no device connected to 
  the Pi's I2C bus (EIO Input/Output Error)
* if you wish to demo this app without installing on a Raspberry Pi coupled to
  an A-Star 32U4 Arduino board, comment out references to i2c in the code below
  and log data to the console instead, if desired.

*/


const struct = require('python-struct');
var sleep = require('sleep'),
    i2c = require('i2c-bus')
    i2c1;

i2c1 = i2c.openSync(1);

module.exports = that = { 

    /**
    *
    * set each LED to the corresponding value
    * @param red
    * @param yellow
    * @param green 
    *
    */
    set_leds: function (red, yellow, green) {
        var leds = [];   
        leds.push(red);
        leds.push(yellow);
        leds.push(green);
       
        write_pack(0, 'BBB', leds);
    },

    /**
    *
    * simple algorithm to process incoming data to drive values
    * @param roll
    * @param pitch
    *
    */
    makeCarGo: function (roll, pitch) {    
        var drive = 0,
            steer = 0;
        
        if(roll < 25) {
            // use the absolute value of roll in case someone tilts their phone WAY forward
            // 4800 is an arbitrary constant chosen to get a reasonable acceleration profile
            // considering the weakness of the toy motors in this RC Car
            drive = inRange(4800/Math.abs(roll));
        } 
        else if (roll > 50) {
            // 1.43 is another arbitrary constant chosen to get a reasonable acceleration profile
            drive = inRange(Math.pow(roll, 1.43) * -1);
        } else {
            drive = 0;
        }

        // the front motor is too weak to turn the front wheels with less than 100% power
        if(pitch > 25) {
            steer = 400;
        } else if (pitch < -25) {
            steer = -400;
        }

        that.set_motors(drive, steer);
    },

    /**
    *
    * set speed of each motor controller for A-Star
    * @param drive
    * @param steer
    *
    */
    set_motors: function (drive, steer) {
        var motors = [];
        motors.push(drive);
        motors.push(steer);
        write_pack(6, 'hh', motors);
    }
}

/**
*
* send data from raspberry pi to A-Star
* @param cmd
* @param format
* @param data
*
*/
function write_pack(cmd, format, data) {
    var buffer = new Buffer(struct.pack(format, data, false));
    i2c1.writeI2cBlockSync(20, cmd, buffer.length, buffer);
    // console.log(cmd, data);
    sleep.usleep(100);
}


/**
*
* ensure motor drive values are within the
* integer range for A-Star motor controller input
* @param num
* 
*/
function inRange(num)
{
    if(num > 400)
    {
        num = 400;
    }

    if(num < -400)
    {
        num = -400
    }

    return num;
}
