window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
}

async function init() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("video").srcObject = stream;
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
}


function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    // FIX: Wait for ICE gathering to complete before sending the payload
    // Without this, the server gets an SDP without network info
    const iceGatheringPromise = new Promise((resolve) => {
        if (peer.iceGatheringState === 'complete') {
            resolve();
        } else {
            const checkState = () => {
                if (peer.iceGatheringState === 'complete') {
                    peer.removeEventListener('icegatheringstatechange', checkState);
                    resolve();
                }
            };
            peer.addEventListener('icegatheringstatechange', checkState);
        }
    });

    await iceGatheringPromise;

    const payload = {
        sdp: peer.localDescription
    };

    // Make sure your server.js is also updated to wait for ICE!
    const { data } = await axios.post('/broadcast', payload); // or '/consumer'
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}



