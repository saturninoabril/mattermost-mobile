// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable */

const fs = require('fs');
const os = require('os');

const _ = require('lodash');
const spawn = require('child-process-promise').spawn;
const Tail = require('tail').Tail;

const exec = require('../utils/exec').execWithRetries;
const {getAndroidEmulatorPath} = require('../utils/environment');
const argparse = require('../utils/argparse');
const retry = require('../utils/retry');

const isUnknownEmulatorError = (err) =>
    (err.message || '').includes('failed with code null');

class Emulator {
    constructor() {
        this.emulatorBin = getAndroidEmulatorPath();
    }

    async listAvds() {
        const output = await this.exec(`-list-avds --verbose`);
        const avds = output.trim().split('\n');
        return avds;
    }

    async exec(cmd) {
        return (await exec(`"${this.emulatorBin}" ${cmd}`)).stdout;
    }

    async boot(emulatorName, options = {port: undefined}) {
        const emulatorArgs = this._getEmulatorArgs(emulatorName, options);

        return await retry(
            {
                retries: 2,
                interval: 100,
                conditionFn: isUnknownEmulatorError,
            },
            () => this._spawnEmulator(emulatorName, emulatorArgs, options)
        );
    }

    _getEmulatorArgs(emulatorName, options) {
        const deviceLaunchArgs = (
            argparse.getArgValue('deviceLaunchArgs') || ''
        ).split(/\s+/);
        const emulatorArgs = _.compact([
            '-verbose',
            '-no-audio',
            '-no-boot-anim',
            argparse.getArgValue('headless') === 'true' ? '-no-window' : '',
            argparse.getArgValue('readOnlyEmu') === 'true' ? '-read-only' : '',
            options.port ? `-port` : '',
            options.port ? `${options.port}` : '',
            ...deviceLaunchArgs,
            `@${emulatorName}`,
        ]);

        const gpuMethod = this.gpuMethod();
        if (gpuMethod) {
            emulatorArgs.push('-gpu', gpuMethod);
        }

        return emulatorArgs;
    }

    gpuMethod() {
        const gpuArgument = argparse.getArgValue('gpu');
        if (gpuArgument) {
            return gpuArgument;
        }

        if (argparse.getArgValue('headless')) {
            switch (os.platform()) {
                case 'darwin':
                    return 'host';
                case 'linux':
                    return 'swiftshader_indirect';
                case 'win32':
                    return 'angle_indirect';
                default:
                    return 'auto';
            }
        }

        return undefined;
    }

    _spawnEmulator(emulatorName, emulatorArgs, options) {
        let childProcessOutput;
        const portName = options.port ? `-${options.port}` : '';
        const tempLog = `./${emulatorName}${portName}.log`;
        const stdout = fs.openSync(tempLog, 'a');
        const stderr = fs.openSync(tempLog, 'a');
        const tailOptions = {
            useWatchFile: true,
            fsWatchOptions: {
                interval: 1500,
            },
        };
        const tail = new Tail(tempLog, tailOptions).on('line', (line) => {
            if (line.includes('Adb connected, start proxing data')) {
                childProcessPromise._cpResolve();
            }
        });

        function detach() {
            if (childProcessOutput) {
                return;
            }

            childProcessOutput = fs.readFileSync(tempLog, 'utf8');

            tail.unwatch();
            fs.closeSync(stdout);
            fs.closeSync(stderr);
            fs.unlink(tempLog, _.noop);
        }

        const childProcessPromise = spawn(this.emulatorBin, emulatorArgs, {
            detached: true,
            stdio: ['ignore', stdout, stderr],
        });

        childProcessPromise.childProcess.unref();
        
        return childProcessPromise
            .then(() => true)
            .catch((err) => {
                detach();

                if (
                    childProcessOutput.includes(
                        `There's another emulator instance running with the current AVD`
                    )
                ) {
                    return false;
                }

                throw err;
            })
            .then((coldBoot) => {
                detach();

                return coldBoot;
            });
    }
}

module.exports = Emulator;
