var sdk = require("matrix-js-sdk");
const myUserId = "@jmcknight14:matrix.org";
const myAccessToken = "syt_am1ja25pZ2h0MTQ_EFkGqSPhZbdMLHTTkclj_3NQzQ8";
const matrixClient = sdk.createClient({
    baseUrl: "localhost:8008",
    accessToken: myAccessToken,
    userId: myUserId,
});

matrixClient.once("sync", function (state, prevState, res) {
    if (state === "PREPARED") {
        console.log("prepared");
    } else {
        console.log(state);
        process.exit(1);
    }
});

var content = {
    body: "message text",
    msgtype: "m.text",
};
matrixClient.sendEvent("Random", "m.room.message", content, "", (err, res) => {
    console.log(err);
});

matrixClient.on("Room.timeline", function (event, room, toStartOfTimeline) {
    if (event.getType() !== "m.room.message") {
        return; // only use messages
    }
    console.log(event.event.content.body);
});

matrixClient.on("Room.timeline", function (event, room, toStartOfTimeline) {
    if (toStartOfTimeline) {
        return; // don't print paginated results
    }
    if (event.getType() !== "m.room.message") {
        return; // only print messages
    }
    console.log(
        // the room name will update with m.room.name events automatically
        "(%s) %s :: %s",
        room.name,
        event.getSender(),
        event.getContent().body,
    );
});

matrixClient.startClient();

