import { listener } from "thing";

const host = listener("foobar-id");

host.on("message", (data) => {
  // hello
});

///

import { connect } from "thing";

const peer = connect("foobar-id");

peer.send("Hello");

// const foo = test("Hello", () => {

//     yield;

// })

// * function testFoo () {

//     const times =

// }

//
// Sync -
// -
//
// PeerJS
// - doesn't have websocket fallback
// - awkward avoiding video/
//
// Ably/Pusher
// - only websocket
