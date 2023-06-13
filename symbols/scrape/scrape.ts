import { Schema, Symbol } from '../../deps.ts'
import getElementsWithXpath from '../../utils/getElementsWithXpath.ts'
import evaluateQuery from '../../utils/webql.ts'

class Scrape extends Symbol {
    static isConfig = false
    static description = 'Scrape information from a DOM element on providing xpath'
    static type = 'scrape'
    static schema: Schema = {
        editorProperties: {
            category: 'Browser control',
            color: 'blue',
            icon: '',
            paletteLabel: 'scrape',
        },
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
            query: {
                allowedTypes: ['pulse', 'procedure', 'json'],
                description: 'The WebQL query for scraping',
                displayName: 'Query',
                defaultType: 'json',
                defaultValue: JSON.parse('{}'),
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
            result: {
                type: 'eval',
                description: 'The result of the scrape operation',
            },
            pageId: {
                type: 'eval',
                description: 'The page ID this procedure operated on.',
            },
            connectionId: {
                type: 'eval',
                description: 'The connection ID this procedure operated on.',
            },
        },
    }

    call: Symbol['call'] = async (vals, callback, _pulse): Promise<void> => {
        const ctx = this.runtime.context
        const { pageId, query, timeout } = vals as { pageId: number; query: string; timeout: number }
        const pages = await ctx.get(`_pages::${vals.connectionId}`) as Record<string, any>
        const page = pages[pageId]

        // const result = await evaluateQuery(page, query.value, timeout.value)
        const result = await getElementsWithXpath({ parent: undefined, page: page, xpath: query, timeout: timeout })
        return callback({ result })
    }
}

export default Scrape
