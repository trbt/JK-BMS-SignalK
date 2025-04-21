
const { parseParam, JKCAN } = require("./parser");
const can = require("socketcan");

let channel;

module.exports = function (app) {
    var plugin = {};

    plugin.id = "jk-bms-signalk";
    plugin.name = "JK BMS to Signalk";
    plugin.description = "Converts JK BMS CAN data to Signalk";

    plugin.start = function (options, restartPlugin) {

        app.debug("Plugin starting");

        var channel = can.createRawChannel(options.canInterface, true);

        //Create filter on can port to receive only relevant CAN ID's        
        channel.setRxFilters([
            { id: 0x02F4, mask: 0xffff, invert: false },
            { id: 0x04F4, mask: 0xffff, invert: false },
            { id: 0x05F4, mask: 0xffff, invert: false }, 
            { id: 0x07F4, mask: 0xffff, invert: false },
            { id: 0x18E028F4, mask: 0x18E0FFFF, invert: false }
        ]);

        channel.addListener("onMessage", function (msg) {            

            let canData = msg.data.readBigUInt64LE();

            for (const paramDef of JKCAN[msg.id].data) {
                let param = parseParam(paramDef, canData);
                app.debug(param);
                app.handleMessage("jk-bms-signalk", {
                    updates: [
                        {
                            values: [
                                {
                                    path: options.pathPrefix + "." + param.path,
                                    value: param.value,
                                },
                            ],
                            meta: [
                                {
                                    path: options.pathPrefix + "." + param.path,
                                    value: {
                                        description: paramDef.description,
                                        units: paramDef.units
                                    }
                                }
                            ]
                        },
                    ],
                });                
            }
        });

        channel.start();
    };

    plugin.stop = function () {
        if (channel) {
            channel.stop();
        }
        channel = undefined;
        app.debug("Plugin stopped");
    };

    plugin.schema = {
        type: "object",
        required: ["canInterface", "battName"],
        properties: {
            canInterface: {
                type: "string",
                title: "CAN Interface",
                description: "Name of CAN interface, e.g. can0",
            },
            pathPrefix: {
                type: "string",
                title: "Path prefix",
                description: "Signalk path prefix for the battery, e.g. 'electrical.batteries.house'"
            }
        },
    };

    return plugin;
};