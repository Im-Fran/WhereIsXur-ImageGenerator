const http = require('http');
const axios = require('axios');
const dayjs = require('dayjs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs')

const listener = (req, res) => {
    axios.get('https://whereisxur.com/').then(response => {
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        // Find the element that has the property 'data-end-timestamp'
        const xur = document.querySelectorAll('[data-end-timestamp]')[0];
        // Get the value of the property
        const endTimestamp = `${xur.getAttribute('data-end-timestamp')}000`;
        // Get location
        let location = (new JSDOM(xur.innerHTML).window.document).querySelectorAll('[class="title"]')[0].textContent
        // Create dayjs object
        let endTime = dayjs(endTimestamp);
        const now = dayjs();
        const alreadyArrived = now.isAfter(endTime);

        // Days until Xur
        const daysUntilXur = endTime.diff(now, 'day') > 0 ? endTime.diff(now, 'day') : 0;
        endTime = endTime.subtract(daysUntilXur, 'day');
        const hoursUntilXur = endTime.diff(now, 'hour') > 0 ? endTime.diff(now, 'hour') : 0;
        // Minutes until Xur
        endTime = endTime.subtract(hoursUntilXur, 'hour');
        const minutesUntilXur = endTime.diff(now, 'minute') > 0 ? endTime.diff(now, 'minute') : 0;
        // Seconds until Xur
        endTime = endTime.subtract(minutesUntilXur, 'minute');
        const secondsUntilXur = endTime.diff(now, 'second') > 0 ? endTime.diff(now, 'second') : 0;

        // Create the message
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Where is Xûr</title>
    <script src="https://cdn.tailwindcss.com/"></script>
    <script src="https://unpkg.com/html-to-image@1.9.0/dist/html-to-image.js"></script>
</head>
<body>
<div class="absolute block bg-black"  id="content">
<div class="p-5 flex flex-col text-gray-200">
    <h1 class="text-2xl mx-2 mb-2" id="title">${location}</h1>
    <div class="text-xl mx-5 flex flex-row">
        <!-- Days -->
        <div class="flex flex-col">
            <span class="mx-2" id="days">${daysUntilXur && daysUntilXur > 0 ? daysUntilXur : '00'}</span>
            <span class="text-sm -px-2">Day(s)</span>
        </div>

        <!-- SEPARATOR -->
        <span class="mx-3 text-3xl">:</span>

        <!-- Hours -->
        <div class="flex flex-col">
            <span class="mx-3" id="hours">${hoursUntilXur && hoursUntilXur > 0 ? hoursUntilXur : '00'}</span>
            <span class="text-sm -px-2">Hour(s)</span>
        </div>

        <!-- SEPARATOR -->
        <span class="mx-3 text-3xl">:</span>

        <!-- Minutes -->
        <div class="flex flex-col">
            <span class="mx-3" id="minutes">${minutesUntilXur && minutesUntilXur > 0 ? minutesUntilXur : '00'}</span>
            <span class="text-sm -px-2">Minute(s)</span>
        </div>

        <!-- SEPARATOR -->
        <span class="mx-3 text-3xl">:</span>

        <!-- Seconds -->
        <div class="flex flex-col">
            <span class="mx-3" id="seconds">${secondsUntilXur && secondsUntilXur > 0 ? secondsUntilXur : '00'}</span>
            <span class="text-sm -px-2">Second(s)</span>
        </div>

    </div>
</div>
</div>
<img id="img" alt="" style="display: none"/>
<script>
    const content = document.getElementById('content');
    htmlToImage.toPng(content).then(function (blob) {
        document.getElementById('img').src = blob;
        document.getElementById('img').style.display = '';
        document.getElementById('content').remove()
    }).catch(console.log);
</script>
</body>
</html>`)
    }).catch(err => {
        res.writeHead(500, 'Internal Server Error');
        res.end('Server error!');
        console.log(err)
    })
};

const port = process.env.PORT || 3000;
http.createServer(listener).listen(port, () => {
    console.log('Server started on port ' + port);
});
