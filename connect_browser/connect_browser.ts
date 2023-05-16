import { OnMessageCallback, Symbol, TypedInput, puppeteer } from "../deps.ts";
import type {Schema, SymbolDsl} from "../deps.ts"
import { Runtime } from "../deps.ts";

class ConnectBrowser extends Symbol {
  static type = "connect_browser";
  static description = "Connect a browser instance to control it via a websocket url";
  static schema: Schema = {
    inputSchema: {},
    outputSchema: {},
    propertiesSchema: {
      wsUrl: new TypedInput({defaultValue: "", type: "str", allowedTypes:["msg", "global", "str"], allowInput: true, label: "Websocket URL"})
    },
    editorProperties:{
      category: "Browser Control",
      color: "blue",
      icon: "",
      paletteLabel: "Connect Browser"
    }
  };
  static isConfig = false;

  constructor(runtime: Runtime, args: SymbolDsl) {
    super(runtime, args);
  }

  /**
   * 
   */
  onInit: Symbol['onInit'] = async () => {
  }

/**
 * 
 * @param _msg 
 * @param _vals 
 * @param _callback 
 */
  onMessage: Symbol['onMessage'] = async (_msg: Record<string, any>, _vals: Record<string, any>, _callback: OnMessageCallback) => {
    try {
      const browser = await puppeteer.connect({
        browserWSEndpoint: _vals?.properties?.wsUrl,
      });
      _msg._connectionId = Date.now().toString(36) +
        Math.floor(Math.random() * 10000).toString(36);
      _msg[`_browser::${_msg._connectionId}`] = browser;
    } catch (e) {
      _msg.__error = e;
      _msg.__isError = true;
    }
    _callback(_msg);
  }

}


export default ConnectBrowser;
