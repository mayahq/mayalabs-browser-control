import { Browser, Schema, Symbol } from '../../deps.ts'

const waitOptions: string[] = [
    'networkidle0',
    'networkidle2',
    'load',
    'domcontentloaded',
]
class OpenPage extends Symbol {
    static type = 'open_page'
    static description = 'Open a page from URL in a connected browser window'
    static schema: Schema = {
        inputSchema: {
            connectionId: {
                allowedTypes: ['pulse', 'procedure', 'string'],
                description: `A unique identifier that corresponds to Maya's connection to the browser. \
                    This is returned by the "Connect Browser node".`,
                displayName: 'Connection ID',
                defaultType: 'pulse',
                defaultValue: 'connectionId',
            },
            pageUrl: {
                allowedTypes: ['pulse', 'procedure', 'string'],
                description: 'URL of the page to open',
                displayName: 'URL',
                defaultType: 'string',
                defaultValue: 'https://google.com',
            },
            waitUntil: {
                allowedTypes: ['string'],
                description: 'What the procedure should wait for, before considering the page-open operation complete.',
                choices: waitOptions,
                allowLink: false,
                defaultType: 'string',
                defaultValue: 'networkidle2',
            },
        },
        outputSchema: {
            pageId: {
                type: 'eval',
                description: 'The page ID this procedure operated on.',
            },
            connectionId: {
                type: 'eval',
                description: 'The connection ID this procedure operated on.',
            },
        },
        editorProperties: {
            category: 'Browser Control',
            color: 'blue',
            icon: '',
            paletteLabel: 'Open Page',
        },
    }
    static isConfig = false

    call: Symbol['call'] = async (vals, callback, _pulse) => {
        const ctx = this.runtime.context
        try {
            const browser = await ctx.get(`_browser::${vals.connectionId}`) as Browser

            if (!browser) {
                throw new Error('No connect node at flow beginning')
            }

            const page = await browser.newPage()
            const pages = await ctx.get(`_pages::${vals.connectionId}`) as string[]

            const pageId = pages.length

            await page.goto(vals.pageUrl, {
                waitUntil: vals.waitUntil,
            })
            const newPages = [...pages, page]

            ctx.set(`_pages::${vals.connectionId}`, newPages)
            return callback({
                connectionId: vals.connectionId,
                pageId,
            })
        } catch (e) {
            callback({
                __error: e,
                __isError: true,
            })
            throw e
        }
    }
}

export default OpenPage
