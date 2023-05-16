import { OnMessageCallback, Symbol, TypedInput } from '../deps.ts'
import type { Schema, SymbolDsl } from '../deps.ts'
import { Runtime } from '../deps.ts'
import evaluateQuery from '../utils/webql.ts';

class Scrape extends Symbol {
    static isConfig = false;
    static description = "Scrape information from a DOM element on providing xpath";
    static type = "browser-scrape";
    static schema: Schema = {
        editorProperties: {
            category: "Browser control",
            color: "blue",
            icon: "",
            paletteLabel: "browser-scrape"
        },
        propertiesSchema: {
            pageId: new TypedInput({ type: 'str', allowedTypes: ['msg', 'global', 'str'], defaultValue:'pageIds[0]', label: 'Page ID'}),
            query: new TypedInput({ type: 'json', allowedTypes: ['json', 'msg', 'global', 'str'], label: 'Query' }),
            timeout: new TypedInput({ type: 'num', allowedTypes: ['msg', 'global', 'num'], defaultValue: 2000, label: 'Timeout' })
        }
    }

    constructor(runtime: Runtime, args: SymbolDsl) {
        super(runtime, args)
    }

    onInit: Symbol['onInit'] = async (_callback: OnMessageCallback): Promise<void> => {
        
    }

    onMessage: Symbol['onMessage'] = async (_msg: Record<string, any>, _vals: Record<string, any>, _callback: OnMessageCallback): Promise<void> => {
        // const context = this._node.context()
        const { pageId, query, timeout } = _vals
        const pages = _msg.get(`_pages::${_msg._connectionId}`)
        const page = pages[pageId]
        
        const result = await evaluateQuery(page, query, timeout)
        
        _msg.result = result
        return _callback(_msg)
    }
}

export default Scrape;