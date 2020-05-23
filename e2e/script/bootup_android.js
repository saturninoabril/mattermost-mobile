// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

const ADB = require('../devices/android/adb');
const EmulatorDriver = require('../devices/drivers/emulator_driver');

async function main() {
    const adb = new ADB();
    const {devices} = await adb.devices();

    if (devices.length) {
        console.log('Will use currently opened:', devices[0]);
        return;
    }

    const emulatorDriver = new EmulatorDriver();
    const adbName = await emulatorDriver.acquireFreeDevice();

    console.log('Successfully open emulator:', adbName);
}

main();
