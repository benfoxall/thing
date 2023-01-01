import "./style.css";
import QRious from "qrious";

const sessionID = crypto.randomUUID();

console.log(sessionID);

const { origin, pathname } = window.location;
const base = `${origin}${pathname}${new URLSearchParams({
  session: sessionID,
})}`;

var qr = new QRious({
  value: base,
});

const u = qr.toDataURL();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Thing</h1>
    <img class="qr" src=${u} alt="QR Code for ${base}"/>
  </div>
`;
