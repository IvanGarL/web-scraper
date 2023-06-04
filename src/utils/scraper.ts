import axios, { AxiosRequestConfig } from 'axios';
import { load } from 'cheerio';
import { PromiseTimeout } from './function';

const AXIOS_TIMEOUT = 15000; // 15s
const MAX_A_TAGS_TO_SCRAPE = 500;

export class WebsiteScraper {
    private aTagsMap: Map<string, string>;

    constructor() {
        this.aTagsMap = new Map<string, string>();
    }

    /**
     * Makes a GET request to the given URL
     * @param {string} baseURL the URL to make the request
     * @returns {Promise<string>} the plain html website response
     */
    private async makeAxiosGETRequest(baseURL: string): Promise<string> {
        const options: AxiosRequestConfig = {
            method: 'GET',
            baseURL,
        };

        try {
            const response = await PromiseTimeout(axios.request(options), AXIOS_TIMEOUT);
            return response.data;
        } catch (error) {
            console.error('Axios request error: ', error?.response?.data ?? error);
            throw error;
        }
    }

    /**
     * Scrapes the website and saves the <a> tags to the scraper map
     * @param {string} baseURL the URL to scrape
     */
    public async scrapeWebsite(baseURL: string): Promise<void> {
        const response = await this.makeAxiosGETRequest(baseURL);
        let linksCount = 0;
        const $ = load(response);
        $('a').each((index, element) => {
            if (linksCount <= MAX_A_TAGS_TO_SCRAPE) {
                try {
                    const tagDescription = $(element)
                        .text()
                        .trim()
                        .replace(/\s{2,}/g, '');
                    const tagUrl = $(element).attr('href');

                    if (tagDescription.length && tagUrl && tagUrl.startsWith('http')) {
                        this.aTagsMap.set(tagDescription, tagUrl);
                        linksCount++;
                    }
                } catch (error) {
                    console.error('Error inserting <a> tag to the scraper <a> tags map: ', error);
                }
            }
        });
    }

    public getLinks(): IterableIterator<[string, string]> {
        return this.aTagsMap.entries();
    }
}
