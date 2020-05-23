// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const Telnet = require('telnet-client');

class EmulatorTelnet {
    constructor() {
        this.connection = new Telnet();
        this.connection.on('timeout', () => console.error('TELNET_TIMEOUT'));
        this.connection.on('error', (err) => console.error('TELNET_ERROR'));
    }

    async connect(port) {
        const params = {
            host: 'localhost',
            port,
            shellPrompt: /^OK$/m,
            timeout: 1500,
            execTimeout: 1500,
            sendTimeout: 1500,
            echoLines: -2,
            stripShellPrompt: true,
        };

        console.log('TELNET_CONNECTING', `port: ${port}, host: ${params.host}`);
        await this.connection.connect(params);
        const auth = await fs.readFile(
            path.join(os.homedir(), '.emulator_console_auth_token'),
            'utf8',
        );
        await this.exec(`auth ${auth}`);
    }

    async exec(command) {
        let res = await this.connection.exec(`${command}`);
        res = res.split('\n')[0];
        return res;
    }

    async shell(command) {
        return new Promise((resolve, reject) => {
            this.connection.shell((error, stream) => {
                stream.write(`${command}\n`);
                stream.on('data', (data) => {
                    const result = data.toString();
                    if (result.includes('\n')) {
                        resolve(result);
                    }
                });
            });
        });
    }

    async avdName() {
        return this.exec('avd name');
    }

    async quit() {
        await this.connection.end();
        await this.connection.destroy();
    }
}

module.exports = EmulatorTelnet;
