import { Schema, Symbol } from '../../deps.ts'
import getElementsWithXpath from '../../utils/getElementsWithXpath.ts'

class Click extends Symbol {
    static type = 'click'
    static description = 'Click on a selected xpath element'
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
            pageId: {
                allowedTypes: ['string', 'pulse', 'procedure'],
                description: `The unique identifier of the page you want to perform the click operation on. \
                Returned by the "Open Page" node.`,
                displayName: 'Page ID',
                defaultType: 'pulse',
                defaultValue: 'pageId',
            },
            xpath: {
                allowedTypes: ['string', 'pulse', 'procedure'],
                description: `Xpath of the element to click on.`,
                displayName: 'XPath',
                defaultType: 'string',
                defaultValue: '',
            },
            timeout: {
                allowedTypes: ['number', 'pulse', 'procedure'],
                description: 'Time (in ms) to wait for an element with given xpath to appear on the page.',
                displayName: 'Timeout',
                defaultType: 'number',
                defaultValue: 10_000,
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
            paletteLabel: 'Click',
        },
    }
    static isConfig = false

    call: Symbol['call'] = async (vals, callback, _pulse) => {
        const ctx = this.runtime.context

        const pages = await ctx.get(`_pages::${vals.connectionId}`) as Record<string, Record<string, unknown>>
        const pageId: number = vals.pageId
        const page: Record<string, unknown> = pages[pageId]
        const xpath: string = vals.xpath
        const timeout: number = vals.timeout
        let elements: Array<Record<string, unknown>> = []
        try {
            elements = await getElementsWithXpath({
                parent: undefined,
                xpath,
                timeout,
                page,
            })
        } catch (e) {
            return callback({
                __error: e,
                __isError: true,
            })
        }
        //@ts-ignore puppeteer function
        await elements[0].click()

        callback({
            connectionId: vals.connectionId,
            pageId: vals.pageId,
        })
    }
}

export default Click
