import "./style.css";
import QRious from "qrious";
import { id, alby } from "./init";

const { origin, pathname, search } = window.location;
const base = `${origin}${pathname}?${new URLSearchParams({
  target: id,
})}`;

const target = new URLSearchParams(search).get("target");

const app = document.querySelector<HTMLDivElement>("#app")!;

if (target) {
  // become host
  if (import.meta.env.DEV) app.innerText = `<< ${target} >>`;

  document.body.classList.toggle("active", true);

  const channel = alby.channels.get(target);

  // channel.
  channel.publish("point", [1, 1]);

  if (import.meta.env.DEV) {
    setTimeout(() => {
      channel.publish("point", [1, 1]);
    }, 500);
  }

  window.addEventListener("click", (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    console.log([x, y]);
    channel.publish("point", [x, y]);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      channel.publish("point", [0, 0]);
    } else {
      channel.publish("point", [1, 1]);
    }
  });
} else {
  // become client
  var qr = new QRious({
    value: base,
  });

  app.innerHTML = `
    <div>
      ${import.meta.env.DEV ? `<p>${id}</p>` : ""}
      <a href="${base}" target="_blank">
        <img class="qr" src=${qr.toDataURL()} alt="QR Code for ${base}"/>
      </a>
    </div>
  `;

  const channel = alby.channels.get(id);

  // hacky mess

  let timer = -1;

  channel.subscribe("point", (message) => {
    console.log("point!", message);
    const [x, y] = message.data;

    if (x === 1 && x == 1) {
      document.body.classList.toggle("active", true);
    } else if (x === 0 && x == 0) {
      document.body.classList.toggle("active", false);
    } else {
      // animate a drop
      const drop = document.createElement("div");
      drop.className = "drop";
      document.body.appendChild(drop);
      drop.style.left = `${x * 100}%`;
      drop.style.top = `${y * 100}%`;

      setTimeout(() => {
        drop.remove();
      }, 3000);

      // make the QR code disapear

      document.body.classList.toggle("active", true);
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.body.classList.toggle("active", false);
      }, 10000);
    }
  });
}
