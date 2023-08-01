import dotenv from 'dotenv/config';

export const isTestEnv = (): boolean => process.env.IS_TEST === 'test';