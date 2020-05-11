import { JSDOM } from 'jsdom';
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
export declare function percySnapshot(jsdom: JSDOM, name: string, options?: any): Promise<void>;
