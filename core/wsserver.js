const EventEmitter = require('events');
const WebSocket = require('ws');
const crypto = require('crypto');
let History = {
  position:[],
  locate:[],
  players:[]
}
class WSServer extends WebSocket.Server {
    constructor (port, processor) {
        super({ port: port });
        this.sessions = new Set();
        this.on('connection', onConnection);
        if (processor) this.on('client', processor);
    }
}

class Session extends EventEmitter {
    constructor (server, socket) {
        super();
        this.server = server;
        this.socket = socket;
        this.eventListeners = new Map();
        this.responsers = new Map();
        socket.on('message', onMessage.bind(this))
        socket.on('close', onClose.bind(this));
    }

    subscribe (event, callback) {
        let listeners = this.eventListeners.get(event);
        if (listeners == undefined) {
            listeners = new Set();
            this.eventListeners.set(event, listeners);
            this.socket.send(JSON.stringify({
                header: buildHeader('subscribe'),
                body: {
                    eventName: String(event)
                }
            }));
        }
        listeners.add(callback);
    }

    unsubscribe (event, callback) {
        let listeners = this.eventListeners.get(event);
        if (listeners == undefined) {
            return;
        }
        listeners.delete(callback);
        if (listeners.size == 0) {
            this.eventListeners.delete(event);
            this.socket.send(JSON.stringify({
                header: buildHeader('unsubscribe'),
                body: {
                    eventName: String(event)
                }
            }));
        }
    }

    sendCommand (command, callback) {
        let json = {
            header: buildHeader('commandRequest'),
            body: {
                version: 1,
                commandLine: command
            }
        };
        this.responsers.set(json.header.requestId, callback);
        this.socket.send(JSON.stringify(json));
        return json.header.requestId;
    }

    getHistory(type, key){
      if(key == 'last'){
        switch (type) {
          case 'position':
          return History.position[History.position.length - 1];
          break;
          case 'locate':
          return History.locate[History.locate.length - 1];
          break;
          case 'players':
          return History.players[History.players.length -1];
          break;
          default:break;
        }
      }
      else{
        switch (type) {
          case 'position':
          return History.position[key];
          break;
          case 'locate':
          return History.locate[key];
          break;
          case 'players':
          return History.players[key];
          break;
          default:break;
        }
      }
    }

	killHistory(type, key){
      if(key == 'last'){
        switch (type) {
          case 'position':
          History.position[History.position.length - 1]=null;
          break;
          case 'locate':
          History.locate[History.locate.length - 1]=null;
          break;
          case 'players':
          History.players[History.players.length -1]=null;
          break;
          default:break;
        }
      }else{throw new Error("killHistory only can kill last.");}
    }
}

module.exports = WSServer;

function onConnection(socket, req) {
    let session = new Session(this, socket);
    this.sessions.add(session);
    this.emit('client', session, req);
}

function onMessage(message) {
    let json = JSON.parse(message);
    let header = json.header;
    let body = json.body;
    switch (header.messagePurpose) {
        case 'event':
            let listeners = this.eventListeners.get(json.body.eventName);
            if (listeners) {
                listeners.forEach(function(e) {
                    try {
                        e(json.body, json);
                    } catch(err) {
                        this.emit('error', err);
                    }
                }, this);
            }
            break;

        case 'commandResponse':
            let callback = this.responsers.get(header.requestId);
            this.responsers.delete(header.requestId);
            if (callback) {
                try {
                    callback(json.body, json);
                } catch(err) {
                    this.emit('error', err);
                }
            }
            break;

        case 'error':
            this.emit('mcerror', new Error(json.body.statusMessage), json);
            break;
    }
}

function onClose() {
    this.server.sessions.delete(this);
}


const UUIDGeneratorNode = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  );

function buildHeader(purpose) {
    return {
        version: 1,
        requestId: UUIDGeneratorNode(),
        messagePurpose: purpose,
        messageType: 'commandRequest'
    };
}

function toArray(str){
  if(!!str.split(',')){
    return str;
  }
  return arr = str.split(',');
}
