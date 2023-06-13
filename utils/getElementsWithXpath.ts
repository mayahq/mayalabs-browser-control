/**
 * Find all elements that correspond to a given xpath.
 * Throws error if no such elements exist or if xpath is invalid.
 *
 * @param {Object} options
 * @param {string} options.xpath - xpath for which you want to find corresponding elements
 * @param {number} options.timeout - Time (in ms) for which it waits for element to appear, before throwing error
 * @param {puppeteer.Page} options.page - puppeteer page instance on which you want to find elements
 * @param {puppeteer.ElementHandle} options.parent - puppeteer page instance on which you want to find elements
 * @returns
 */

type Parent = {
    waitForPath: (xpath: string, obj: Record<string, unknown>) => Array<unknown> | []
    $x: (xpath: string) => Array<Record<string, unknown>> | []
}

async function getElementsWithXpath(
    { parent = undefined, page, xpath, timeout }: {
        parent?: Record<string, unknown>
        page?: Record<string, unknown>
        xpath: string
        timeout: number
    },
): Promise<Array<Record<string, unknown>>> {
    if (!parent) {
        parent = page
    }

    let elements
    try {
        // @ts-ignore huh
        elements = await parent?.$x(xpath)
    } catch (e) {
        console.log('Error in evaluation:', e)
        const err = new Error('Invalid xpath')
        // @ts-ignore huh
        err!['type'] = 'INVALID_XPATH'
        throw err
    }

    if (elements.length === 0) {
        try {
            // @ts-ignore comment
            await parent.waitForXPath(xpath, { timeout })
            // @ts-ignore comment
            elements = await parent.$x(xpath)
        } catch (e) {
            console.log('xpath find err', e)
            const err = new Error('No elements found for xpath')
            // @ts-ignore comment
            err['type'] = 'NO_ELEMENTS_FOUND'
            throw err
        }
    }

    return elements
}

export default getElementsWithXpath
