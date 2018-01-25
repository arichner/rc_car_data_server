'use strict';

var sleep = require('sleep'),
    rc_car = require('../lib/rc_car');

const struct = require('python-struct');

(function () {
    console.log('setting motors to 0');
    rc_car.set_motors(0,0);
    rc_car.set_leds(0,0,0);
    sleep.sleep(1);
    rc_car.set_leds(1,1,1);
    sleep.sleep(1);
    rc_car.set_leds(0,0,0);
}());