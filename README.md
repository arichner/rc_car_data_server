# NODE.js RcCar Motor Controller and Data Server

This application is written to run on a Raspberry Pi 3 coupled to an [A-Star 32U4 Robot Controller](http://www.pololu.com/product/3117/), an Arduino motor controller that has I/O pins to fit to a Raspberry Pi.

### A note about compatability
The [i2c-bus](https://github.com/fivdi/i2c-bus) node module will only run on specific architectures, primarily the Raspberry Pi. If attempting to run this application on a different OS, this module will throw the following error `Error: Module did not self-register`. See [Testing without Raspberry Pi / A-Star 32U4](#no_pi) section below for more information.

## Description

This application is part of a system that allows a user to control a RC Car using a mobile device. A standard, toy-quality RC Car is modified to accommodate the Raspberry Pi / A-Star. The motors from the RC Car should be wired directly to the A-Star motor controller. 

Video is streamed from the Raspberry Pi to the mobile device using the [UV4L](https://www.linux-projects.org/uv4l/) library. 

This application receives raw accelerometer and gyroscopic data from a mobile device connected using [Socket.io](https://socket.io). This data is filtered and combined to provide a reasonably accurate approximation of the mobile device's roll and pitch (x and y movement). This roll and pitch data is translated to drive commands for the motors connected to the Raspberry Pi and sent to the A-Star using the [I2C-bus node module](https://github.com/fivdi/i2c-bus).


## Dependencies

* Raspberry Pi 3 or Raspberry Pi Zero W
* [UV4L](https://www.linux-projects.org/uv4l/) installed on Pi
* [A-Star 32U4 Robot Controller](http://www.pololu.com/product/3117/)
* [RcCar Android/iOS Application](https://github.com/arichner/RcCar) & device to control vehicle
* An appropriately modified RC Car, configured so the Pi/A-Star controls the drive and steering motors.
* [Pololu RPI Slave Arduino Library](https://github.com/pololu/pololu-rpi-slave-arduino-library) installed on the A-Star 32U4


## Usage

Clone this repository to a suitable location on the Raspberry Pi. Install dependencies via `npm install`. 

Configure the Raspberry Pi to boot with wlan0 set to access point mode and the uv4l service running. Run `node index.js` to start the server. This many be done via SSH connection or the Pi may be configured to run this on boot.

Once the server has launched, the LED lights on the A-Star will blink once to indicate initialization complete. At this point, the system is ready to recieve incoming connections from the [RcCar mobile application](https://github.com/arichner/RcCar). 


## Utilities

`util/set_motors.js` -- Stops the motors. During initial development, connection interruptions with the mobile device would occasionally cause the motors to continue spinning with no way to stop them. This utility was created to do so. In subsequent versions, motors are now set to 0 when the mobile device disconnects.


## Testing without Raspberry Pi / A-Star 32U4 <a id="no_pi"></a>

* The i2c-bus node module will only run on specific architectures, primarily the Raspberry Pi.
* The i2c-bus module will throw an error upon init if there is no device connected to 
  the Pi's I2C bus (EIO Input/Output Error)

If you wish to demo this app without installing on a Raspberry Pi coupled to an A-Star 32U4 Arduino board, comment out references to i2c in lib/rc_car.js and log data to the console instead, if desired.
