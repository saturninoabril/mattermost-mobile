// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable */

const path = require('path');

const chalk = require('chalk');
const _ = require('lodash');

const Emulator = require('../android/emulator');
const ADB = require('../android/adb');
const environment = require('../utils/environment');
const retry = require('../utils/retry');

const EmulatorsPortRange = {
    min: 10000,
    max: 20000,
};

class EmulatorDriver {
    constructor() {
        this.adb = new ADB();

        this.emulator = new Emulator();
        this.pendingBoots = {};
        this._name = 'Unspecified Emulator';
    }

    get name() {
        return this._name;
    }

    async acquireFreeDevice(name) {
        console.log(chalk.cyan('Acquiring free device', name));

        let avdName = await this._getFirstAvd();

        const adbName = await this._createDevice();

        console.log(chalk.cyan(`Settled on ${adbName}`));

        await this._boot(avdName, adbName);

        const apiLevel = await this.adb.apiLevel(adbName);
        await this.adb.unlockScreen(adbName);

        this._name = `${adbName} (${avdName})`;
        return {adbName, apiLevel, name: this._name};
    }

    async _boot(avdName, adbName) {
        const coldBoot = !!this.pendingBoots[adbName];

        if (coldBoot) {
            const port = this.pendingBoots[adbName];
            await this.emulator.boot(avdName, {port});
            delete this.pendingBoots[adbName];
        }

        await this._waitForBootToComplete(adbName);
    }

    async _validateAvd(avdName) {
        const avds = await this.emulator.listAvds();
        if (!avds) {
            const avdmanagerPath = path.join(
                environment.getAndroidSDKPath(),
                'tools',
                'bin',
                'avdmanager'
            );

            throw new Error(`Could not find any configured Android Emulator. 
      Try creating a device first, example: ${avdmanagerPath} create avd --force --name Pixel_2_API_26 --abi x86 --package 'system-images;android-26;google_apis_playstore;x86' --device "pixel"
      or go to https://developer.android.com/studio/run/managing-avds.html for details on how to create an Emulator.`);
        }

        if (_.indexOf(avds, avdName) === -1) {
            throw new Error(`Can not boot Android Emulator with the name: '${avdName}',
      make sure you choose one of the available emulators: ${avds.toString()}`);
        }
    }

    async _getFirstAvd() {
        const avds = await this.emulator.listAvds();
        if (!avds) {
            const avdmanagerPath = path.join(
                environment.getAndroidSDKPath(),
                'tools',
                'bin',
                'avdmanager'
            );

            throw new Error(`Could not find any configured Android Emulator. 
      Try creating a device first, example: ${avdmanagerPath} create avd --force --name Pixel_2_API_26 --abi x86 --package 'system-images;android-26;google_apis_playstore;x86' --device "pixel"
      or go to https://developer.android.com/studio/run/managing-avds.html for details on how to create an Emulator.`);
        }

        return avds[0];
    }

    async _waitForBootToComplete(deviceId) {
        console.log('_waitForBootToComplete')
        await retry({retries: 240, interval: 2500}, async () => {
            const isBootComplete = await this.adb.isBootComplete(deviceId);

            if (!isBootComplete) {
                throw new Error(
                    `Android device ${deviceId} has not completed its boot yet.`
                );
            }
        });
    }

    async _createDevice() {
        const {min, max} = EmulatorsPortRange;
        let port = Math.random() * (max - min) + min;
        port = port & 0xfffffffe; // Should always be even

        const adbName = `emulator-${port}`;
        this.pendingBoots[adbName] = port;

        console.log(chalk.cyan(`Created device: ${adbName}`));
        return adbName;
    }
}

module.exports = EmulatorDriver;
