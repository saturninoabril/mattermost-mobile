// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* global device, element, by, expect */

describe('Smoke tests', () => {
    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should have "select server" screen', async () => {
        const serverUrlInput = element(by.id('serverUrlInput'));
        const connectButton = element(by.id('connectButton'));

        await expect(element(by.id('selectServerScreen'))).toBeVisible();
        await expect(serverUrlInput).toBeVisible();
        await expect(connectButton).toBeVisible();

        await connectButton.tap();
        await expect(element(by.text('URL must start with http:// or https://'))).toBeVisible();
    });

    it('should show login screen after tap', async () => {
        await element(by.id('serverUrlInput')).typeText('http://localhost:8065');
        await element(by.id('connectButton')).tap();

        // causing async timeout
        await expect(element(by.id('emailInput'))).toBeVisible();
        await expect(element(by.id('passwordInput'))).toBeVisible();
        await expect(element(by.id('signinButton'))).toBeVisible();
        await expect(element(by.id('forgotPasswordButton'))).toBeVisible();
    });
});
