// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import 'react-native';
import 'jest-enzyme';

import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

/**
 * Set up DOM in node.js environment for Enzyme to mount to
 */
const {JSDOM} = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {window} = jsdom;

function copyProps(src, target) {
    Object.defineProperties(target, {
        ...Object.getOwnPropertyDescriptors(src),
        ...Object.getOwnPropertyDescriptors(target),
    });
}

global.window = window;
global.document = window.document;
global.navigator = {
    userAgent: 'node.js',
};
copyProps(window, global);

configure({adapter: new Adapter()});

/**
 * Ignore some expected warnings
 * see: https://jestjs.io/docs/en/tutorial-react.html#snapshot-testing-with-mocks-enzyme-and-react-16
 * see https://github.com/Root-App/react-native-mock-render/issues/6
*/

const originalConsoleError = console.error;
console.error = (message) => {
    if (message.startsWith('Warning:')) {
        return;
    }

    originalConsoleError(message);
};

/* eslint-disable no-console */

jest.mock('NativeModules', () => {
    return {
        UIManager: {
            RCTView: {
                directEventTypes: {},
            },
        },
        BlurAppScreen: () => true,
        MattermostManaged: {
            getConfig: jest.fn(),
        },
        PlatformConstants: {
            forceTouchAvailable: false,
        },
        RNGestureHandlerModule: {
            State: {
                BEGAN: 'BEGAN',
                FAILED: 'FAILED',
                ACTIVE: 'ACTIVE',
                END: 'END',
            },
        },
    };
});
jest.mock('NativeEventEmitter');

jest.mock('react-native-device-info', () => {
    return {
        getVersion: () => '0.0.0',
        getBuildNumber: () => '0',
        getModel: () => 'iPhone X',
        isTablet: () => false,
    };
});

jest.mock('react-native-cookies', () => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    getInitialURL: jest.fn(),
}));

let logs;
let warns;
let errors;
beforeAll(() => {
    console.originalLog = console.log;
    console.log = jest.fn((...params) => {
        console.originalLog(...params);
        logs.push(params);
    });

    console.originalWarn = console.warn;
    console.warn = jest.fn((...params) => {
        console.originalWarn(...params);
        warns.push(params);
    });

    console.originalError = console.error;
    console.error = jest.fn((...params) => {
        console.originalError(...params);
        if (params[0].startsWith('Warning:')) {
            return;
        }
        errors.push(params);
    });
});

beforeEach(() => {
    logs = [];
    warns = [];
    errors = [];
});

afterEach(() => {
    if (logs.length > 0 || warns.length > 0 || errors.length > 0) {
        throw new Error('Unexpected console logs' + logs + warns + errors);
    }
});

jest.mock('rn-fetch-blob', () => ({
    fs: {
        dirs: {
            DocumentDir: () => jest.fn(),
            CacheDir: () => jest.fn(),
        },
        exists: jest.fn(),
        existsWithDiffExt: jest.fn(),
        unlink: jest.fn(),
        mv: jest.fn(),
    },
    fetch: jest.fn(),
    config: jest.fn(),
}));

jest.mock('rn-fetch-blob/fs', () => ({
    dirs: {
        DocumentDir: () => jest.fn(),
        CacheDir: () => jest.fn(),
    },
    exists: jest.fn(),
    existsWithDiffExt: jest.fn(),
    unlink: jest.fn(),
    mv: jest.fn(),
}));

global.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
};
