// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable */

const fs = require('fs');
const os = require('os');
const path = require('path');

const _ = require('lodash');
const ini = require('ini');
const _which = require('which');

function which(executable, path) {
    return _which.sync(executable, {path, nothrow: true});
}

const MISSING_SDK_ERROR = `$ANDROID_SDK_ROOT is not defined, set the path to the SDK installation directory into $ANDROID_SDK_ROOT,
Go to https://developer.android.com/studio/command-line/variables.html for more details`;

function getAndroidSDKPath() {
    return process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || '';
}

function getAndroidSDKHome() {
    return process.env['ANDROID_SDK_HOME'] || os.homedir();
}

function getEmulatorHome() {
    return (
        process.env['ANDROID_EMULATOR_HOME'] ||
        path.join(getAndroidSDKHome(), '.android')
    );
}

function getAvdHome() {
    return (
        process.env['ANDROID_AVD_HOME'] || path.join(getEmulatorHome(), 'avd')
    );
}

function getAvdDir(avdName) {
    const avdIniPath = path.join(getAvdHome(), `${avdName}.ini`);
    if (!fs.existsSync(avdIniPath)) {
        throwMissingAvdINIError(avdName, avdIniPath);
    }

    const avdIni = ini.parse(fs.readFileSync(avdIniPath, 'utf-8'));
    if (!fs.existsSync(avdIni.path)) {
        throwMissingAvdError(avdName, avdIni.path, avdIniPath);
    }

    return avdIni.path;
}

function getAndroidEmulatorPath() {
    const sdkRoot = getAndroidSDKPath();
    if (!sdkRoot) {
        return which('emulator') || throwMissingSdkError();
    }

    const defaultPath = which('emulator', path.join(sdkRoot, 'emulator'));
    if (defaultPath) {
        return defaultPath;
    }

    const legacyPath = which('emulator', path.join(sdkRoot, 'tools'));
    if (legacyPath) {
        return legacyPath;
    }

    throwSdkIntegrityError(sdkRoot, 'emulator/emulator');
}

function getAdbPath() {
    const sdkRoot = getAndroidSDKPath();
    if (!sdkRoot) {
        return which('adb') || throwMissingSdkError();
    }

    const defaultPath = which('adb', path.join(sdkRoot, 'platform-tools'));
    if (defaultPath) {
        return defaultPath;
    }

    throwSdkIntegrityError(sdkRoot, 'platform-tools/adb');
}

function throwMissingSdkError() {
    throw new Error(MISSING_SDK_ERROR);
}

function throwMissingAvdINIError(avdName, avdIniPath) {
    throw new Error(
        `Failed to find INI file for ${avdName} at path: ${avdIniPath}`
    );
}

function throwMissingAvdError(avdName, avdPath, avdIniPath) {
    throw new Error(
        `Failed to find AVD ${avdName} directory at path: ${avdPath}\n` +
            `Please verify "path" property in the INI file: ${avdIniPath}`
    );
}

function throwSdkIntegrityError(sdkRoot, relativeExecutablePath) {
    const executablePath = path.join(sdkRoot, relativeExecutablePath);
    const name = path.basename(executablePath);
    const dir = path.dirname(executablePath);

    throw new Error(
        `There was no "${name}" executable file in directory: ${dir}.\n` +
            `Check integrity of your Android SDK.`
    );
}

module.exports = {
    getAdbPath,
    getAvdHome,
    getAvdDir,
    getAndroidSDKPath,
    getAndroidEmulatorPath,
};
