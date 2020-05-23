// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-process-env */

const wd = require('wd');
const path = require('path');
const test = require('tape');

require('dotenv').config();

const localServerConfig = {host: 'localhost', port: 4723};
const androidApp = '../../Mattermost.apk';
const localCapabilities = {
    platformName: 'Android',
    deviceName: 'Android Emulator',
    autoGrantPermissions: true,
    app: path.resolve(__dirname, androidApp),
    automationName: 'UiAutomator2',
    appActivity: '.MainActivity',
    appWaitActivity: 'com.mattermost.rn.MainActivity',
};

let driver;

test('Setup and open Android app', (t) => {
    const serverConfig = localServerConfig;
    const capabilities = localCapabilities;

    driver = wd.promiseChainRemote(serverConfig);
    driver.init(capabilities).setImplicitWaitTimeout(1000).then(() => {
        t.end();
    });
});

test('...', (t) => {
    require('../../e2e/android/smoke.js')(driver, t);
    t.end();
});

test('Teardown', (t) => {
    driver.quit().then(() => {
        t.end();
    });
});
