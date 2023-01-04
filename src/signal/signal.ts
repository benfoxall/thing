import WebSocket from "./reconnecting-ws";

const BACKEND = "wss://i0eiyzqlwl.execute-api.eu-west-1.amazonaws.com/dev";
const TOKEN_KEY_PREFIX = "{{tok=>";
const TWILLIO_KEY = "{{twillio}}";

interface CallbackMap {
  data: (body: any, from: string) => void;
}

const log = (...message: any[]) => {
  console.log.apply(console, ["%c[ws]", "color:#08f"].concat(message));
};

export enum Event {
  START = "[ws] START",
  WS_OPEN = "[ws] WS_OPEN",
  WS_CLOSE = "[ws] WS_CLOSE",
  WS_MESSAGE = "[ws] WS_MESSAGE", // payload=message
  WS_SEND = "[ws] WS_SEND",
  AUTH_OK = "[ws] AUTH_OK", // payload=uuid
  AUTH_FAIL = "[ws] AUTH_FAIL", // payload=error
  TWILLIO_OK = "[ws] TWILLIO_OK",
  DISCONNECT = "[ws] DISCONNECT",
}

type Dispatch = (event: Event, payload?: any) => void;

export class SignalClient {
  public error: string | null = null;
  public twillio = new Defer();
  public auth = new Defer<string>();

  private ws: WebSocket;
  private dataListeners = new Set<CallbackMap["data"]>();

  constructor(public readonly uuid: string, private dispatch?: Dispatch) {
    this.notify(Event.START);

    this.ws = new WebSocket(BACKEND);

    const ping = () => {
      setTimeout(() => {
        this._send({ type: "ping" }, 0);

        ping();
      }, 5 * 60 * 1000);
    };
    ping();

    const token = sessionStorage.getItem(TOKEN_KEY_PREFIX + uuid);
    const twillio = sessionStorage.getItem(TWILLIO_KEY);

    if (twillio) {
      try {
        this.twillio.resolve(JSON.parse(twillio));

        this.notify(Event.TWILLIO_OK);
      } catch (e) {}
    }

    const open = () => {
      this.notify(Event.WS_OPEN);

      this.ws.send(
        JSON.stringify({
          type: "setup",
          uuid: uuid,
          token,
        })
      );

      // todo - or created at is hours old
      if (!twillio) {
        this.ws.send(
          JSON.stringify({
            type: "twillio",
          })
        );
      }
    };

    const message = (m: MessageEvent) => {
      this.notify(Event.WS_MESSAGE, m.data);
      try {
        const data = JSON.parse(m.data);

        if (data.type === "setup") {
          if (data.token) {
            log("Token updated");
            sessionStorage.setItem(TOKEN_KEY_PREFIX + uuid, data.token);

            this.notify(Event.AUTH_OK, uuid);

            this.auth.resolve(uuid);
          }

          if (data.error) {
            this.error = data.error;

            this.notify(Event.AUTH_FAIL, data.error);

            this.auth.reject(new Error(data.error));
          }
        }

        if (data.type === "twillio" && data.token) {
          sessionStorage.setItem(TWILLIO_KEY, JSON.stringify(data.token));

          // twRes(data.token);
          this.twillio.resolve(data.token);
        }

        if (data.type === "send" && data.to === this.uuid) {
          this.dataListeners.forEach((cb) => {
            cb(data.body, data.from);
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    const close = () => {
      this.notify(Event.WS_CLOSE);
      log("CLOSE");
    };

    this.ws.addEventListener("message", message);
    this.ws.addEventListener("open", open);
    this.ws.addEventListener("close", close);
  }

  // this could be better
  on<T extends keyof CallbackMap>(data: T, callback: CallbackMap[T]) {
    if (data === "data") {
      this.dataListeners.add(callback);
    }
  }

  send(target: string, message: any) {
    // need to be authed before we can send messages to others
    this.auth.then(() => {
      this._send(
        {
          type: "send",
          from: this.uuid,
          to: target,
          body: message,
        },
        0
      );
    });
  }

  disconnect() {
    log("disconnect");
    this.notify(Event.DISCONNECT);
    this.ws.close();
  }

  /** Try and send to the underlying connection */
  private _send(message: any, retries = 3) {
    this.notify(Event.WS_SEND, message);

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    } else if (retries > 0) {
      log("Retrying");

      setTimeout(this._send.bind(this), 1500, message, retries - 1);
    }
  }

  private notify(type: Event, payload?: any) {
    if (this.dispatch) {
      this.dispatch(type, payload);
    } else {
      log(type, payload);
    }
  }
}

class Defer<T> extends Promise<T> {
  resolve: (value: T | PromiseLike<T>) => void = () => {};
  reject: (err: any) => void = () => {};

  constructor() {
    super((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
