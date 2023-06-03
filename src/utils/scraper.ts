import axios, { AxiosRequestConfig } from 'axios';
import { PromiseTimeout } from './function';

const AXIOS_TIMEOUT = 15000; // 15s

export class WebsiteScraper {

    /**
     * This function makes the axios request to get the data from a website
     * @param {R} req Request API to call
     * @param {StockParams[R]} config.params Params to send if needed
     */
    private async makeAxiosGETRequest (baseURL: string): Promise<void> {

        const options: AxiosRequestConfig = {
            method: 'GET',
            baseURL,
        };

        try {
            const response = await PromiseTimeout(axios.request(options), AXIOS_TIMEOUT);
            /* return (response.data) as StooqDataResponse; */
        } catch (error) {
            console.error('STOOQ Data API error: ', error?.response?.data ?? error);
            throw error;
        }
    };
}

