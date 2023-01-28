import "./style.css";
import QRious from "qrious";
import { Session } from "./Session";

const session = new Session();

const { origin, pathname } = window.location;
const base = `${origin}${pathname}?${new URLSearchParams({
  to: session.id,
})}`;

console.log(import.meta.env.VITE_ABLY_KEY);

var qr = new QRious({
  value: base,
});

const u = qr.toDataURL();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <p>${session.id}</p>
    <a href="${base}" target="_blank">
      <img class="qr" src=${u} alt="QR Code for ${base}"/>
    </a>
  </div>
`;
