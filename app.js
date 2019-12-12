const express = require('express');

const expressWs = require('express-ws')


const app       = express()

expressWs(app)

const fs = require('fs')
let i = 0;
app.ws('/ws', (ws, req) => {
    ws.on('message', msg => {
        console.log(msg)
        fs.writeFile(`./mp4/${i++}.mpeg`, msg, function(err) {console.log(err)})
    })

    ws.on('close', () => {
        console.log('WebSocket was closed')
    })
})




app.use(express.static('static'));

app.listen(3000);
