import getElementsWithXpath from './getElementsWithXpath.ts'

type WebQLQueryObject = {
    [key: string]: string | WebQLQueryObject | WebQLQueryObject[] | string[]
}

function appendTextFn(xpath:string) {
    xpath = xpath.trim()
    if (xpath.endsWith('text()')) {
        return xpath
    }

    // Checking if property to be accessed is an attribute,
    // like @href, @src, etc
    const comps = xpath.split('/')
    if (comps[comps.length-1][0] === '@') {
        return xpath
    }

    if (xpath[xpath.length-1] === '/') {
        return `${xpath}text()`
    } else {
        return `${xpath}/text()`
    }
}

/**
 * 
 * @param {puppeteer.ElementHandle | puppeteer.Page} parent 
 * @param {string} xpath 
 * @returns {Array<puppeteer.ElementHandle>}
 */
const getXpathElems = async (parent:Record<string, unknown>, xpath:string, timeout = 0): Promise<Array<Record<string, unknown>> | []> => {
    try {
        const elems: Array<Record<string, unknown>> = await getElementsWithXpath({ parent, xpath, timeout })
        // console.log('getXpathElems elems', elems)
        return elems
    } catch (e) {
        // console.log('getXpathElems error', e)
        switch (e.type) {
            case 'INVALID_XPATH': throw e
            case 'NO_ELEMENTS_FOUND': return []
            default: return []
        }
    }
}

// I'm using OG for-loops everywhere so I don't have to rack my head
// with async functions in iterators. Don't edit.
/**
 * 
 * @param {puppeteer.ElementHandle | puppeteer.Page} parent 
 * @param {string} query 
 * @param {number} timeout 
 * @returns 
 */
async function resolveXpathQuery(parent:Record<string, unknown>, query: WebQLQueryObject, timeout = 0): Promise<Array<Record<string, unknown>> | Record<string, unknown> | null> {
    // console.log('resolveXpathQuery', query)
    if (Array.isArray(query)) {
        if (query.length === 0) {
            return null
        }

        const tempRes = []
        for (let i = 0; i < query.length; i++) {
            const nspec = query[i]
            if (typeof nspec === 'string') {
                const xpath = appendTextFn(nspec)
                const elems = await getXpathElems(parent, xpath, timeout)
                // console.log('da elems', elems)
                
                for (let j = 0; j < elems.length; j++) {
                    const elem = elems[j]
                    //@ts-ignore javascript
                    const tc = await elem.evaluate(el => el.textContent)
                    if (tc) {
                        tempRes.push(tc.trim())
                    } else {
                        // tempRes.push(tc)
                        tempRes.push('')
                    }

                    // console.log('tempres', tempRes)
                }
                continue
            }
    
            if (!nspec._xpath) {
                const err = new Error('Must specify _xpath for array of nodes')
                const error = {
                    error: err,
                    type: 'INVALID_QUERY_SPEC',
                    description: 'Must specify _xpath for array of nodes'
                }
                throw error
            }
    
            const elems = await getXpathElems(parent, nspec._xpath, timeout)
            for (let j = 0; j < elems.length; j++) {
                const elem = elems[j]
                const result = await resolveXpathQuery(elem, nspec, timeout)
                tempRes.push(result)
            }
        }

        return tempRes
    }

    const result: Record<string, unknown> | null = {}
    const queryKeys = Object.keys(query)
    for (let i = 0; i < queryKeys.length; i++) {
        const key: string = queryKeys[i]
        const val: string | WebQLQueryObject | WebQLQueryObject[] | string[] = query[key]

        if (key[0] === '_') { // Hehe that looks like a poker face
            continue
        }
    
        if (typeof val === 'string') {
            // const xpath = appendTextFn(val)
            let ele = null
            try {
                const res = await getXpathElems(parent, val, timeout)
                ele = res[0]
            } catch (e) {
                console.log('error here', e)
                const err = new Error(`Invalid xpath: "${val}"`)
                const error = {
                    error: err,
                    type: 'SYNTAX_ERROR',
                    description:  `Invalid xpath: "${val}"`
                }
                throw error
            }
    
            if (!ele) {
                result[key] = null
                continue
            }
            //@ts-ignore javascript function
            const tc = await ele.evaluate(e => e.textContent || '', ele)
            result[key] = tc.trim()
            // result[key] = ele.textContent ? ele.textContent.trim() : ele
            continue
        }
    
        if (typeof val !== 'object') {
            const err = new Error('Query spec can either be xpath string or object')
            const error = {
                error: err,
                type: 'INVALID_QUERY_SPEC',
                description: 'Query spec can either be xpath string or object'
            }
            throw error
        }
    
        if (!Array.isArray(val)) {
            if (!val._xpath) {
                result[key] = await resolveXpathQuery(parent, val, timeout)
                continue
            }
            const tempElems = await getXpathElems(parent, val._xpath as string)
            if (tempElems.length === 0) {
                result[key] = null
                continue
            }
            result[key] = await resolveXpathQuery(tempElems[0], val, timeout)
            continue
        }
    
        result[key] = await resolveXpathQuery(parent, val as unknown as WebQLQueryObject, timeout)

    }

    return result
}

async function evaluateQuery(page: Record<string, unknown>, query: WebQLQueryObject, timeout: number) {
    console.log('evaluateQuery', query)
    return await resolveXpathQuery(page, query, timeout)
}


export default evaluateQuery;