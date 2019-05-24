// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

import {Preferences} from 'mattermost-redux/constants';

import PostBodyAdditionalContent from 'app/components/post_body_additional_content';
import {mountWithIntl, shallowWithIntl} from 'test/intl-test-helper';

import PostBody from './post_body.js';

const initialState = {
    entities: {
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                current_channel_id: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                    mention_count: 1,
                    msg_count: 9,
                },
            },
            channels: {
                current_channel_id: {
                    id: 'current_channel_id',
                    name: 'default-name',
                    display_name: 'Default',
                    delete_at: 0,
                    type: 'O',
                    total_msg_count: 10,
                    team_id: 'team_id',
                },
            },
            channelsInTeam: {
                'team-id': ['current_channel_id'],
            },
        },
        teams: {
            currentTeamId: 'team-id',
            teams: {
                'team-id': {
                    id: 'team_id',
                    name: 'team-1',
                    displayName: 'Team 1',
                },
            },
            myMembers: {
                'team-id': {roles: 'team_role'},
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_role'},
            },
        },
        preferences: {
            myPreferences: {
                'display_settings--name_format': {
                    category: 'display_settings',
                    name: 'name_format',
                    user_id: 'current_user_id',
                    value: 'username',
                },
            },
        },
        general: {
            license: {IsLicensed: 'false'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        },
    },
};

describe('PostBody', () => {
    const baseProps = {
        canDelete: true,
        channelIsReadOnly: false,
        deviceHeight: 1920,
        fileIds: [],
        hasBeenDeleted: false,
        hasBeenEdited: false,
        hasReactions: false,
        highlight: false,
        isFailed: false,
        isFlagged: false,
        isPending: false,
        isPostAddChannelMember: false,
        isPostEphemeral: false,
        isReplyPost: false,
        isSearchResult: false,
        isSystemMessage: false,
        managedConfig: {},
        message: 'Hello, World!',
        navigator: {},
        onFailedPostPress: jest.fn(),
        onHashtagPress: jest.fn(),
        onPermalinkPress: jest.fn(),
        onPress: jest.fn(),
        post: {id: 'post'},
        postProps: {},
        postType: '',
        replyBarStyle: [],
        showAddReaction: true,
        showLongPost: true,
        isEmojiOnly: false,
        shouldRenderJumboEmoji: false,
        theme: Preferences.THEMES.default,
    };

    test('should mount additional content for non-system messages', () => {
        const props = {
            ...baseProps,
            isSystemMessage: false,
        };

        const wrapper = shallowWithIntl(<PostBody {...props}/>);

        expect(wrapper.find(PostBodyAdditionalContent).exists()).toBeTruthy();
    });

    test('should not mount additional content for system messages', () => {
        const props = {
            ...baseProps,
            isSystemMessage: true,
        };

        const wrapper = shallowWithIntl(<PostBody {...props}/>);

        expect(wrapper.find(PostBodyAdditionalContent).exists()).toBeFalsy();
    });

    test('should mount PostBody', () => {
        const props = {
            ...baseProps,
            isSystemMessage: true,
        };

        const store = mockStore(initialState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <PostBody {...props}/>
            </Provider>
        );

        expect(wrapper.find(PostBodyAdditionalContent).exists()).toBeFalsy();
    });
});
