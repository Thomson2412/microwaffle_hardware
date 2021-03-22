const utils = require('../utils/Utils');
const timer = require('./Timer');
const hardwareState = require('../hardware/HardwareState');
const config = require('../config.json');
const Gpio = require('onoff').Gpio;
const TAG = 'HardwareController';
let relay = null;
let tm = null;
let statusUpdateCallbacks = {};
let state = hardwareState.IDLE;

module.exports = {

    init: function(){
        if(tm == null)
            tm = new timer(timerDone, timerUpdate);
        if(relay == null)
            initRelay();
    },

    start: function(timeInSeconds){
        if(tm == null) {
            utils.log(TAG,"No timer found, forgot init?");
            return;
        }
        tm.reset()
        tm.set(timeInSeconds);
        setRelay(1);
        state = hardwareState.RUNNING;

        for(let key in statusUpdateCallbacks){
            statusUpdateCallbacks[key](module.exports.getStatus());
        }
        tm.start();
    },

    pause: function(){
        if(tm == null) {
            utils.log(TAG,"No timer found, forgot init?");
            return;
        }
        setRelay(0);
        tm.pause();
        state = hardwareState.PAUSED;

        for(let key in statusUpdateCallbacks){
            statusUpdateCallbacks[key](module.exports.getStatus());
        }
    },

    stop: function(){
        if(tm == null) {
            utils.log(TAG,"No timer found, forgot init?");
            return;
        }
        setRelay(0);
        tm.reset();
        state = hardwareState.IDLE;

        for(let key in statusUpdateCallbacks){
            statusUpdateCallbacks[key](module.exports.getStatus());
        }
    },

    addTime: function(timeInSeconds){
        if(tm == null) {
            utils.log(TAG,"No timer found, forgot init?");
            return;
        }
        if(state === hardwareState.IDLE) {
            utils.log(TAG,"Not running");
            return;
        }
        tm.add(timeInSeconds);
    },

    cleanUp: function (){
        if(relay != null){
            relay.unexport();
        }
    },

    getStatus: function () {
        return {
            "state": state,
            "timeInSeconds": tm.getCurrentTime()
        };
    },

    addStatusUpdateCallback: function(id, callback){
        if (typeof callback == "function"){
            statusUpdateCallbacks[id] = callback;
        }
        else {
            utils.log(TAG, "Callback not a function");
        }
    },

    removeStatusUpdateCallback: function(id){
        if (statusUpdateCallbacks[id] === undefined){
            utils.log(TAG, "No callback set");
        }
        else {
            delete statusUpdateCallbacks[id];
        }
    }
};

function timerUpdate(timeInSeconds) {
    utils.log(TAG,"Timer seconds left: " + timeInSeconds);
    // for(let key in statusUpdateCallbacks){
    //     statusUpdateCallbacks[key](module.exports.getStatus());
    // }
}

function timerDone() {
    module.exports.stop()
    // for(let key in statusUpdateCallbacks){
    //     statusUpdateCallbacks[key](module.exports.getStatus());
    // }
}

function setRelay(value) {
    if(value !== 0 && value !== 1) {
        utils.log(TAG,"invalid value, need 0 or 1");
        return;
    }
    if(relay == null) {
        utils.log(TAG,"No relay found, forgot init?");
        return;
    }

    relay.writeSync(value ^ 1);
}

function initRelay() {
    if(config.hardware.relay_pin < 0) {
        utils.log(TAG,"invalid pin");
        return;
    }

    if (Gpio.accessible) {
        relay = new Gpio(config.hardware.relay_pin, "out");
    } else {
        relay = {
            writeSync: value => {
                utils.log(TAG, 'virtual relay now uses value: ' + value);
            }
        };
    }
    setRelay(0);
}