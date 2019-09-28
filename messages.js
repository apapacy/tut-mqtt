var client;

var connectOptions = {
  timeout: 30,
  reconnect: true,
  cleanSession: false,
  mqttVersion: 4,
  keepAliveInterval: 10,
  onSuccess: onConnect,
  onFailure: onFailure
}


function connect() {
  try {
    client = new Paho.Client('localhost', 8083, '/mqtt', document.forms.sender.client.value);
    connectOptions.userName = document.forms.sender.user.value;
    client.connect(connectOptions);
  } catch (ex) {
    console.log(ex);
  }
}

function onConnect() {
  console.log('on connect');
  client.onMessageArrived = function(message) {
    console.log("onMessageArrived: " + message.payloadString);
  }
  client.subscribe("test", { qos: 2 });
}

function onFailure(err) {
  console.log('on failure', JSON.stringify(err));
}

function send() {
   var message = new Paho.Message(document.forms.sender.message.value);
   message.destinationName = "test";
   message.qos = 2;
   client.send(message);
}
