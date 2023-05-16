import { OnMessageCallback, Symbol, TypedInput } from '../deps.ts'
import type { Schema, SymbolDsl } from '../deps.ts'
import { Runtime } from '../deps.ts'

class OpenPage extends Symbol {
    static type = 'open_page'
    static description = 'Open a page from URL in a connected browser window'
    static schema: Schema = {
        inputSchema: {},
        outputSchema: {},
        propertiesSchema: {
            pageUrl: new TypedInput({
                defaultValue: '',
                type: 'str',
                allowedTypes: ['msg', 'global', 'str'],
                allowInput: true,
                label: 'URL',
            }),
            waitFor: new TypedInput({
                label: 'timeout',
                type: 'num',
                allowedTypes: ['num'],
                allowInput: true,
                defaultValue: 5,
            }),
            viewportV: new TypedInput({
                label: 'Vertical Viewport',
                type: 'num',
                allowedTypes: ['num'],
                allowInput: true,
                defaultValue: 150,
            }),
            viewportH: new TypedInput({
                label: 'Horizontal Viewport',
                type: 'num',
                allowedTypes: ['num'],
                allowInput: true,
                defaultValue: 180,
            }),
        },
        editorProperties: {
            category: 'Browser Control',
            color: 'blue',
            icon: '',
            paletteLabel: 'Open Page',
        },
    }
    static isConfig = false

    constructor(runtime: Runtime, args: SymbolDsl) {
        super(runtime, args)
    }

    /** */
    onInit: Symbol['onInit'] = async () => {
    }

    /**
     * @param _msg
     * @param _vals
     * @param _callback
     */
    onMessage: Symbol['onMessage'] = async (
        _msg: Record<string, any>,
        _vals: Record<string, any>,
        _callback: OnMessageCallback,
    ) => {
        try {
            const browser = _msg[`_browser::${_msg._connectionId}`]

            if (!browser) {
                throw new Error('No connect node at flow beginning')
            }

            const page = await browser.newPage()
            _msg._connectionId = Date.now().toString(36) +
                Math.floor(Math.random() * 10000).toString(36)
            _msg[`_browser::${_msg._connectionId}`] = browser

            const width = _vals.viewportH || 1600
            const height = _vals.viewportV || 900
            await page.setViewport({ width, height })

            await page.goto(_vals.pageUrl, {
                waitUntil: _vals.waitFor,
            })

            const pages = _msg[`_pages::${_msg._connectionId}`]
            const pageId = pages.length
            const newPages = [...pages].concat(page)
            _msg[`_pages::${_msg._connectionId}`] = newPages
            _msg.pageIds = [pageId]
        } catch (e) {
            _msg.__error = e
            _msg.__isError = true
        }
        _callback(_msg)
    }
}

export default OpenPage
