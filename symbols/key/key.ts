import { KeyInput, Page, Schema, Symbol } from '../../deps.ts'

class Key extends Symbol {
    static type = 'keyboardAction'
    static description = 'Perform a keyboard action on a selected xpath element'
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
                description: `The unique identifier of the page you want to perform the keyboard action on. \
                Returned by the "Open Page" node.`,
                displayName: 'Page ID',
                defaultType: 'pulse',
                defaultValue: 'pageId',
            },
            action: {
                allowedTypes: ['string', 'pulse', 'procedure'],
                description: `The type of keyboard action to perform. Can be 'KeyPress', 'KeyDown', or 'KeyUp'.`,
                displayName: 'Action',
                defaultType: 'string',
                defaultValue: 'KeyPress',
                choices: ['KeyPress', 'KeyDown', 'KeyUp'],
            },
            key: {
                allowedTypes: ['string', 'pulse', 'procedure'],
                description: `The JavaScript key code of the key to operate with.`,
                displayName: 'Key Code',
                defaultType: 'string',
                defaultValue: 'a',
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
            paletteLabel: 'Keyboard Action',
        },
    }
    static isConfig = false

    call: Symbol['call'] = async (vals, callback, _pulse) => {
        const ctx = this.runtime.context

        const pages = await ctx.get(`_pages::${vals.connectionId}`) as Record<string, Page>
        const pageId: number = vals.pageId
        const page = pages[pageId]
        const action: string = vals.action
        const key: string = vals.key

        try {
            switch (action) {
                case 'KeyPress':
                    await page.keyboard.press(key as KeyInput)
                    break
                case 'KeyDown':
                    await page.keyboard.down(key as KeyInput)
                    break
                case 'KeyUp':
                    await page.keyboard.up(key as KeyInput)
                    break
                default:
                    throw new Error(`Unsupported action: ${action}`)
            }
        } catch (e) {
            return callback({
                __error: e,
                __isError: true,
            })
        }

        callback({
            connectionId: vals.connectionId,
            pageId: vals.pageId,
        })
    }
}

export default Key
