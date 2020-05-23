// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = sleep;
