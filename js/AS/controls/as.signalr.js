var as = as || {};

as.signalR = {
    hub : null,
    options: {
        hubName: null,
        userData: new Object(),
        callbacks: new Object(),
        dataReceived: null,
        connected: null,

    },
    init: function (options) {
        
        as.signalR.options = $.extend(as.signalR.options, options);
        var opts = as.signalR.options;

        as.signalR.hub = $.connection[opts.hubName];
        as.signalR.hub.client.dataReceived = function(data) {
            if (opts.dataReceived) opts.dataReceived(data);
        }

        as.signalR.hub.client.connectionsReceived = function (data) {
            if (opts.connectionsReceived) opts.connectionsReceived(data);
        }

        as.signalR.hub.client.commandReceived = function (command, data) {
            if (opts.callbacks[command]) opts.callbacks[command](data);            
        }

        $(window).unload(function () {            
            as.signalR.disconnect();
        });
    },
    connect: function (userData) {
        var opts = as.signalR.options;
        $.connection.hub.qs = { userData: userData || opts.userData }
        $.connection.hub.start().done(function() {            
            if (opts.connected) opts.connected();
        });
    },
    disconnect: function() {
        $.connection.hub.stop();
    },
    getClientProxy: function() {
        return as.signalR.hub.client;
    },
    getServerProxy: function () {
        return as.signalR.hub.server;
    },
    getConnections: function() {
        as.signalR.hub.server.getConnections();
    },
    sendData: function(connectionId, data) {
        as.signalR.hub.server.sendData(connectionId, data);
    },
    sendDataAll: function(data) {
        as.signalR.hub.server.sendDataAll(data);
    },
    sendCommand: function(connectionId, command, data) {
        as.signalR.hub.server.sendCommand(connectionId, command, data);
    },
    sendCommandAll: function(command, data) {
        as.signalR.hub.server.sendCommandAll(command, data);
    },    
}