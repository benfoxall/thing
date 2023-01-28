import Ably from "ably";

const sessionkey = "🥳";

let _key = sessionStorage.getItem(sessionkey);

if (!_key) {
  _key = crypto.randomUUID();
  sessionStorage.setItem(sessionkey, _key);

  console.log("Generated new key");
}

export const id = _key;

export const alby = new Ably.Realtime(
  "xVLyHw.A-pwh7wmgd5ki0_0D6OZMegAtzO97Wx-TK48_XVaxv6GT3QuKI"
);
