import axios, { AxiosRequestConfig } from 'axios';
import { PromiseTimeout } from './function';

const STOCK_TIMEOUT = 15000; // 15s

/**
 * This function makes the request to STOOQ API. 
 * @param {R} req Request API to call
 * @param {StockParams[R]} config.params Params to send if needed
 */
export const makeStooqAPIRequest = async (symbol: string): Promise<void> => {

    const options: AxiosRequestConfig = {
        method: 'GET',
        baseURL: 'https://stooq.com/q/l',
        headers: { accept: 'application/json' },
        params: { s: symbol, f: 'sd2t2ohlcvn', e: 'json' },
    };

    try {
        const response = await PromiseTimeout(axios.request(options), STOCK_TIMEOUT);
        /* return (response.data) as StooqDataResponse; */
    } catch (error) {
        console.error('STOOQ Data API error: ', error?.response?.data ?? error);
        throw error;
    }
};
