// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Preferences from 'mattermost-redux/constants/preferences';

import FailedNetworkAction from 'app/components/failed_network_action';
import ErrorTeamsList from './error_teams_list';

describe('ErrorTeamsList', () => {
    const loadMe = async () => {
        return {
            data: {},
        };
    };

    const baseProps = {
        actions: {
            loadMe: jest.fn(),
            connection: jest.fn(),
            logout: jest.fn(),
            selectDefaultTeam: jest.fn(),
            resetToChannel: jest.fn(),
        },
        componentId: 'component-id',
        theme: Preferences.THEMES.default,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ErrorTeamsList {...baseProps}/>
        );

        expect(wrapper.find(FailedNetworkAction).exists()).toEqual(true);
        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('should load user and select dafult team on getUserInfo', async () => {
        const wrapper = shallow(
            <ErrorTeamsList {...baseProps}/>
        );

        const instance = wrapper.instance();
        await instance.getUserInfo();

        expect(baseProps.actions.connection).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.connection).toBeCalledWith(true);

        expect(baseProps.actions.loadMe).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.loadMe).toBeCalledWith();

        expect(baseProps.actions.resetToChannel).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.resetToChannel).toBeCalledWith({disableTermsModal: true});

        expect(baseProps.actions.selectDefaultTeam).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.selectDefaultTeam).toBeCalledWith();

        expect(wrapper.state('loading')).toEqual(false);
    });
});
