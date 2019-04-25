// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* global device */

/* eslint-env jasmine */
/* eslint-disable no-console */

const detox = require('detox');
const config = require('../package.json').detox;
const adapter = require('detox/runners/jest/adapter');

// Set the default timeout
jest.setTimeout(30000);
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
    await detox.init(config, {launchApp: false});
    await device.launchApp({permissions: {notifications: 'YES'}});
});

beforeEach(async () => {
    await adapter.beforeEach();
});

afterAll(async () => {
    await adapter.afterAll();
    await detox.cleanup();
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
