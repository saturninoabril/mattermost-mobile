// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable */

const _ = require('lodash');
const {exec} = require('child-process-promise');

const retry = require('./retry');

async function execWithRetries(
    bin,
    options,
    statusLogs,
    retries = 9,
    interval = 1000,
) {
    const cmd = _composeCommand(bin, options);
    const execTimeout = _.get(options, 'timeout', 0);
    console.log('cmd:', cmd);

    let result;
    try {
        await retry({retries, interval}, async (retryNumber) => {
            if (statusLogs && statusLogs.trying) {
                console.log('EXEC_TRY', retryNumber, statusLogs.trying);
            }

            result = await exec(cmd, {timeout: execTimeout});
        });
    } catch (err) {
        throw err;
    }

    if (result === undefined) {
        throw new Error(`command ${cmd} returned undefined`);
    }

    return result;
}

function _composeCommand(bin, options) {
    if (!options) {
        return bin;
    }

    const prefix = options.prefix ? `${options.prefix} && ` : '';
    const args = options.args ? ` ${options.args}` : '';

    return `${prefix}${bin}${args}`;
}

module.exports = {
    execWithRetries,
};
