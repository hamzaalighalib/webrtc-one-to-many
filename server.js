const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const wrtc = require('@roamhq/wrtc'); // Use wrtc consistently

let senderStream;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/consumer", async (req, res) => {
    const { body } = req;
    const peer = new wrtc.RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
    });
    
    const desc = new wrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    
    if (senderStream) {
        senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    }
    
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    
    res.json({ sdp: peer.localDescription });
});

app.post('/broadcast', async (req, res) => {
    const { body } = req;
    const peer = new wrtc.RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
    });
    
    peer.ontrack = (e) => {
        senderStream = e.streams[0];
    };

    const desc = new wrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    
    res.json({ sdp: peer.localDescription });
});

// FIX: Use 'app.listen' instead of 'server.listen'
const port = process.env.PORT || 8000; 

app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on port ${port}`);
});
