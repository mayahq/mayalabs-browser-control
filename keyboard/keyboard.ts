import { OnMessageCallback, Symbol, TypedInput } from '../deps.ts'
import type { Schema, SymbolDsl } from '../deps.ts'
import { Runtime } from '../deps.ts'
import getElementsWithXpath from '../utils/getElementsWithXpath.ts'

class Keyboard extends Symbol {
    static type = 'keyboard'
    static description = 'Emulate keyboard typing in a selected xpath element'
    static schema: Schema = {
        inputSchema: {},
        outputSchema: {},
        propertiesSchema: {
            pageId: new TypedInput({ type: 'msg', allowedTypes: ["num"], label: 'Page ID', defaultValue: 'pageIds[0]' }),
            xpath: new TypedInput({
                defaultValue: '',
                type: 'str',
                allowedTypes: ['msg', 'global', 'str'],
                allowInput: true,
                label: 'URL',
            }),
            timeout: new TypedInput({
                label: 'timeout',
                type: 'num',
                allowedTypes: ['num'],
                allowInput: true,
                defaultValue: 5,
            }),
            content: new TypedInput({
                label: 'Content',
                type: 'str',
                allowedTypes: ['msg', "global", "str"],
                allowInput: true,
                defaultValue: "",
            }),
            index: new TypedInput({
                label: 'Type Index',
                type: 'num',
                allowedTypes: ["num"],
                allowInput: true,
                defaultValue: 0,
            })
        },
        editorProperties: {
            category: 'Browser Control',
            color: 'blue',
            icon: '',
            paletteLabel: 'Keyboard',
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
        const pages: Record<string, Record<string, unknown>> =_msg[`_pages::${_msg._connectionId}`]
        const pageId: number = _vals.pageId;
        const page: Record<string, unknown> = pages[pageId]
        const xpath:string = _vals.xpath;
        const timeout: number = _vals.timeout;
        const index: number = _vals.index;
        const text: string = _vals.content;
        let elements: Array<Record<string, unknown>> = [];
        try {
            elements = await getElementsWithXpath({
                parent: undefined,
                xpath, timeout, page
            })
        } catch (e) {
            _msg.__error = e
            _msg.__isError = true
            _callback(_msg)
        }

        if (elements.length - 1 < index) {
            _msg.__error = new Error(`Index out of bounds. Only ${elements.length} elements found for given xpath`)
            _msg.__isError = true
            _callback(_msg)
        }
        //@ts-ignore puppeteer function
        await elements[index].type(text, { delay })
        _callback(_msg)
    }
}

export default Keyboard
