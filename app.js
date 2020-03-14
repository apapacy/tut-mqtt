const express = require('express');

const expressWs = require('express-ws')


const app       = express()

expressWs(app)


app.use(express.static('static'))

const child_process = require('child_process');

// -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls index.m3u8

app.ws('/ws', (wss, req) => {

    const rtmpUrl = './test.avi';
    console.log('Target RTMP URL:', rtmpUrl);

    // Launch FFmpeg to handle all appropriate transcoding, muxing, and RTMP
    const ffmpeg = child_process.spawn('ffmpeg', [
      '-i', '-',
            '-profile:v', 'baseline', '-level', '3.0',
            '-tune', 'zerolatency', '-s', '1280x720', '-b:v', '1400k',
            '-bufsize', '1400k', '-use_timeline', '1', '-use_template', '1',
            '-init_seg_name', 'init-\$RepresentationID\$.mp4',
            '-min_seg_duration', '2000000', '-media_seg_name', 'test-\$RepresentationID\$-\$Number\$.mp4',
            '-f', 'dash',  './static/video/stream.mpd'
      ]);

    // If FFmpeg stops for any reason, close the WebSocket connection.
    ffmpeg.on('close', (code, signal) => {
      console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
      wss.terminate();
    });

    // Handle STDIN pipe errors by logging to the console.
    // These errors most commonly occur when FFmpeg closes and there is still
    // data to write.  If left unhandled, the server will crash.
    ffmpeg.stdin.on('error', (e) => {
      console.log('FFmpeg STDIN Error', e);
    });

    // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
    ffmpeg.stderr.on('data', (data) => {
      console.log('FFmpeg STDERR:', data.toString());
    });

    // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
    wss.on('message', (msg) => {
      console.log('DATA', msg);
      ffmpeg.stdin.write(msg);
    });

    // If the client disconnects, stop FFmpeg.
    wss.on('close', (e) => {
      ffmpeg.kill('SIGINT');
    });


});


app.listen(3000);
