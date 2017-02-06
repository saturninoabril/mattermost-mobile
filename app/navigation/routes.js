// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {
    ChannelView,
    ChannelDrawer,
    ChannelInfo,
    ChannelMembers,
    LoadTeam,
    Login,
    LoginOptions,
    Mfa,
    RightMenuDrawer,
    Root,
    Search,
    SelectServer,
    SelectTeam,
    Saml
} from 'app/scenes';

import keyMirror from 'service/utils/key_mirror';

export const RouteTransitions = keyMirror({
    Horizontal: null
});

export const Routes = {
    ChannelInfo: {
        key: 'ChannelInfo',
        transition: RouteTransitions.Horizontal,
        component: ChannelInfo,
        navigationProps: {
            title: {id: 'mobile.routes.channelInfo', defaultMessage: 'Info'}
        }
    },
    ChannelDrawer: {
        key: 'ChannelDrawer',
        component: ChannelDrawer
    },
    ChannelMembers: {
        key: 'ChannelMembers',
        transition: RouteTransitions.Horizontal,
        component: ChannelMembers,
        navigationProps: {
            title: {id: 'channel_header.manageMembers', defaultMessage: 'Manage Members'}
        }
    },
    ChannelView: {
        key: 'ChannelView',
        transition: RouteTransitions.Horizontal,
        component: ChannelView
    },
    LoadTeam: {
        key: 'LoadTeam',
        component: LoadTeam
    },
    Login: {
        key: 'Login',
        transition: RouteTransitions.Horizontal,
        component: Login,
        navigationProps: {
            title: {id: 'mobile.routes.login', defaultMessage: 'Login'}
        }
    },
    LoginOptions: {
        key: 'LoginOptions',
        transition: RouteTransitions.Horizontal,
        component: LoginOptions,
        navigationProps: {
            title: {id: 'mobile.routes.loginOptions', defaultMessage: 'Login Chooser'}
        }
    },
    Mfa: {
        key: 'Mfa',
        transition: RouteTransitions.Horizontal,
        component: Mfa,
        navigationProps: {
            title: {id: 'mobile.routes.mfa', defaultMessage: 'Multi-factor Authentication'}
        }
    },
    RightMenuDrawer: {
        key: 'RightMenuDrawer',
        component: RightMenuDrawer
    },
    Root: {
        key: 'Root',
        component: Root
    },
    Search: {
        key: 'Search',
        transition: RouteTransitions.Horizontal,
        component: Search
    },
    SelectServer: {
        key: 'SelectServer',
        component: SelectServer,
        navigationProps: {
            title: {id: 'mobile.routes.enterServerUrl', defaultMessage: 'Enter Server URL'}
        }
    },
    SelectTeam: {
        key: 'SelectTeam',
        transition: RouteTransitions.Horizontal,
        component: SelectTeam,
        navigationProps: {
            title: {id: 'mobile.routes.selectTeam', defaultMessage: 'Select Team'}
        }
    },
    Saml: {
        key: 'Saml',
        transition: RouteTransitions.Horizontal,
        component: Saml,
        navigationProps: {
            title: {id: 'mobile.routes.saml', defaultMessage: 'Single SignOn'}
        }
    }
};

export default Routes;
