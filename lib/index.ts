import { clientInfo } from './environment'
import { JSDOM } from 'jsdom'
import { readFileSync } from 'fs';
let { agentJsFilename, isAgentRunning, postSnapshot } = require('@percy/agent/dist/utils/sdk-utils')

/**
 * A function to take a Percy snapshot from a Puppeteer test or script. To use in your tests:
 *   const { percySnapshot } = require('@percy/puppeteer')
 *
 *   const browser = await puppeteer.launch()
 *   const jsdom = await browser.newPage()
 *   await jsdom.goto(<your.test.url>)
 *   await percySnapshot(jsdom, <your snapshot name>, <maybe options>)
 *
 * @param jsdom Puppeteer Page object that we are snapshotting. Required.
 * @param name Name of the snapshot that we're taking. Required.
 * @param options Additional options, e.g. '{widths: [768, 992, 1200]}'. Optional.
 */
export async function percySnapshot(jsdom: JSDOM, name: string, options: any = {}) {
    if (!name) {
        throw new Error("'name' must be provided. In Mocha, this.test.fullTitle() is a good default.")
    }

    await sleep(100);
    const document = jsdom.window.document;
    installPercyAgent(jsdom);

    if (! await isAgentRunning()) {
        throw new Error('Percy agent is not running');
    }

    /* Percy checks the ownerNode for stylesheets to make sure they are no already inline in the DOM.
     * JSDom does not support the ownerNode property for stylesheets.  This basically deactivates that check - the
     * downside is style could appear twice in the snapshot.
     */
    for (const stylesheet of Array.from(document.styleSheets) as CSSStyleSheet[]) {
        // @ts-ignore
        stylesheet.ownerNode = document.createElement('style');
    }

    addScript(document, `
        try {
            window._percySnapshot = undefined;
            var name = ${JSON.stringify(name)};
            var options = ${JSON.stringify(options)};
            var percyAgentClient = new PercyAgent({ handleAgentCommunication: false })
            window._percySnapshot = percyAgentClient.snapshot(name, options)
        } catch (error) {
            console.error('Failed to make snapshot', error);
        }
    `);

    const domSnapshot = await waitFor(() => jsdom.window._percySnapshot, 'percy snapshot');
    if (!domSnapshot) throw new Error('Snapshot failed');

    await postDomSnapshot(name, domSnapshot, jsdom.window.location.toString(), options)

}

function installPercyAgent(jsdom: JSDOM) {
    if (jsdom.window.PercyAgent) return;
    addScript(document, readFileSync(agentJsFilename()).toString());
}

async function postDomSnapshot(name: string, domSnapshot: any, url: string, options: any) {
    const postSuccess = await postSnapshot({
        name,
        url,
        domSnapshot,
        clientInfo: clientInfo(),
        ...options
    });
    if (!postSuccess) {
        throw new Error(`[percy] Error posting snapshot to agent.`)
    }
}

function addScript(document: Document, script: string) {
    const newScript = document.createElement("script");
    const inlineScript = document.createTextNode(script);
    newScript.appendChild(inlineScript);
    document.body.appendChild(newScript);
}

async function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function waitFor<T>(condition: () => T|undefined, description: string): Promise<T> {
    const deadline = new Date().getTime() + 30 * 60;
    while(new Date().getTime() < deadline) {
        const result = condition();
        if (result) return result;
        await sleep(100);
    }
    throw new Error(`Could not resolve ${description} in time`)
}
