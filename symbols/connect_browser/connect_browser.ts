import { puppeteer, Schema, Symbol } from '../../deps.ts'
import { getSmallRandomId } from '../../utils/misc.ts'

class ConnectBrowser extends Symbol {
    static type = 'connect_browser'
    static description = 'Connect a browser instance to control it via a websocket url'
    static schema: Schema = {
        inputSchema: {
            wsUrl: {
                allowedTypes: ['string', 'pulse', 'procedure'],
                description: 'The WebSocket URL of the running browser instance to control.',
                displayName: 'Websocket URL',
                defaultType: 'string',
                defaultValue: 'ws://example.com',
            },
        },
        outputSchema: {
            connectionId: {
                type: 'eval',
                description: `A unique identifier that corresponds to Maya's connection to the browser.`,
                displayName: 'Connection ID',
            },
        },
        editorProperties: {
            category: 'Browser Control',
            color: 'blue',
            icon: '',
            paletteLabel: 'Connect Browser',
        },
    }
    static isConfig = false

    call: Symbol['call'] = async (vals, callback, _pulse) => {
        try {
            const browser = await puppeteer.connect({
                browserWSEndpoint: vals.wsUrl,
            })
            const connectionId = getSmallRandomId()

            this.runtime.context.set(`_browser::${connectionId}`, browser)
            this.runtime.context.set(`_pages::${connectionId}`, [])

            callback({ connectionId })
        } catch (e) {
            callback({
                __error: e,
                __isError: true,
            })
            throw e
        }
    }
}

export default ConnectBrowser
