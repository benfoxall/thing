import "./style.css";
import QRious from "qrious";
import { Session } from "./Session";

const session = new Session();

const { origin, pathname } = window.location;
const base = `${origin}${pathname}${new URLSearchParams({
  session: session.id,
})}`;

var qr = new QRious({
  value: base,
});

const u = qr.toDataURL();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Thing</h1>
    <p>${session.id}</p>
    <img class="qr" src=${u} alt="QR Code for ${base}"/>
  </div>
`;
