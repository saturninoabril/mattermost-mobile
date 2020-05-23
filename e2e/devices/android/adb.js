// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable */

const _ = require('lodash');

const EmulatorTelnet = require('./emulator_telnet');
const {execWithRetries} = require('../utils/exec');
const {escape} = require('../utils/pipe_commands');
const {getAdbPath} = require('../utils/environment');

class ADB {
    constructor() {
        this._cachedApiLevels = new Map();
        this.adbBin = getAdbPath();
    }

    async devices() {
        const {stdout} = await this.adbCmd('', 'devices', {verbosity: 'high'});
        const devices = _.chain(stdout)
            .trim()
            .split('\n')
            .slice(1)
            .map((s) => _.trim(s))
            .map((s) =>
                s.startsWith('emulator-')
                    ? new EmulatorHandle(s)
                    : new DeviceHandle(s)
            )
            .value();

        for (const device of devices) {
            if (device.type === 'emulator') {
                assertEmulatorHasPort(device, stdout);
            }
        }

        return {devices, stdout};
    }

    async unlockScreen(deviceId) {
        const {
            mWakefulness,
            mUserActivityTimeoutOverrideFromWindowManager,
        } = await this._getPowerStatus(deviceId);

        if (mWakefulness === 'Asleep' || mWakefulness === 'Dozing') {
            await this.pressPowerDevice(deviceId);
        }

        if (mUserActivityTimeoutOverrideFromWindowManager === '10000') {
            // screen is locked
            await this.pressOptionsMenu(deviceId);
        }
    }

    async _getPowerStatus(deviceId) {
        const stdout = await this.shell(
            deviceId,
            `dumpsys power | grep "^[ ]*m[UW].*="`,
            {retries: 5}
        );
        return stdout
            .split('\n')
            .map((s) => s.trim().split('='))
            .reduce(
                (acc, [key, value]) => ({
                    ...acc,
                    [key]: value,
                }),
                {}
            );
    }

    async pressOptionsMenu(deviceId) {
        await this._sendKeyEvent(deviceId, 'KEYCODE_MENU');
    }

    async pressPowerDevice(deviceId) {
        await this._sendKeyEvent(deviceId, 'KEYCODE_POWER');
    }

    async _sendKeyEvent(deviceId, keyevent) {
        await this.shell(deviceId, `input keyevent ${keyevent}`);
    }

    async isBootComplete(deviceId) {
        try {
            const bootComplete = await this.shell(
                deviceId,
                `getprop dev.bootcomplete`,
                {silent: true}
            );
            return bootComplete === '1';
        } catch (ex) {
            return false;
        }
    }

    async apiLevel(deviceId) {
        if (this._cachedApiLevels.has(deviceId)) {
            return this._cachedApiLevels.get(deviceId);
        }

        const lvl = Number(
            await this.shell(deviceId, `getprop ro.build.version.sdk`, {
                retries: 5,
            })
        );
        this._cachedApiLevels.set(deviceId, lvl);

        return lvl;
    }

    async shell(deviceId, cmd, options) {
        return (await this.adbCmd(
            deviceId,
            `shell "${escape.inQuotedString(cmd)}"`,
            options
        )).stdout.trim();
    }

    async adbCmd(deviceId, params, options) {
        const serial = `${deviceId ? `-s ${deviceId}` : ''}`;
        const cmd = `"${this.adbBin}" ${serial} ${params}`;
        const retries = _.get(options, 'retries', 1);
        _.unset(options, 'retries');

        return execWithRetries(cmd, options, undefined, retries);
    }

    static inferDeviceType(adbName) {
        if (adbName.startsWith('emulator-')) {
            return 'emulator';
        }

        if (/^((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:)){4}[0-9]{4}/.test(adbName)) {
            return 'genymotion';
        }

        return 'device';
    }
}

function assertEmulatorHasPort(device, stdout) {
    if (device.port) {
        return;
    }

    const errorMessage = [
        `Failed to determine telnet port for emulator device '${device.adbName}'!`,
    ].join('\n');

    throw new Error(errorMessage);
}

class DeviceHandle {
    constructor(deviceString) {
        const [adbName, status] = deviceString.split('\t');
        this.type = ADB.inferDeviceType(adbName);
        this.adbName = adbName;
        this.status = status;
    }
}

class EmulatorHandle extends DeviceHandle {
    constructor(deviceString) {
        super(deviceString);

        this.port = this.adbName.split('-')[1];
    }

    queryName() {
        if (!this._name) {
            this._name = this._queryNameViaTelnet();
        }

        return this._name;
    }

    async _queryNameViaTelnet() {
        const telnet = new EmulatorTelnet();

        await telnet.connect(this.port);
        try {
            return await telnet.avdName();
        } finally {
            await telnet.quit();
        }
    }
}

module.exports = ADB;
