// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import ConditionalTouchable from 'app/components/conditional_touchable';
import CustomPropTypes from 'app/constants/custom_prop_types';
import {makeStyleSheetFromTheme} from 'app/utils/theme';

export default class CustomListRow extends React.PureComponent {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        onPress: PropTypes.func,
        enabled: PropTypes.bool,
        selectable: PropTypes.bool,
        selected: PropTypes.bool,
        children: CustomPropTypes.Children,
        item: PropTypes.object,
    };

    static defaultProps = {
        enabled: true,
    };

    render() {
        const style = getStyleFromTheme(this.props.theme);

        return (
            <ConditionalTouchable
                touchable={Boolean(this.props.enabled && this.props.onPress)}
                onPress={this.props.onPress}
                style={{flex: 1}}
            >
                <View style={style.container}>
                    {this.props.selectable &&
                        <View style={style.selectorContainer}>
                            <View style={[style.selector, (this.props.selected && style.selectorFilled), (!this.props.enabled && style.selectorDisabled)]}>
                                {this.props.selected &&
                                    <Icon
                                        name='check'
                                        size={16}
                                        color='#fff'
                                    />
                                }
                            </View>
                        </View>
                    }
                    <View style={style.children}>
                        {this.props.children}
                    </View>
                </View>
            </ConditionalTouchable>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flexDirection: 'row',
            // height: 65,
            flex: 1,
            // paddingHorizontal: 15,
            alignItems: 'center',
            // backgroundColor: theme.centerChannelBg,
            // backgroundColor: 'black',
        },
        children: {
            flex: 1,
            flexDirection: 'row',
        },
        selector: {
            height: 28,
            width: 28,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#888',
            alignItems: 'center',
            justifyContent: 'center',
        },
        selectorContainer: {
            // flex: 1,
            height: 50,
            paddingRight: 15,
            alignItems: 'center',
            justifyContent: 'center',
        },
        selectorDisabled: {
            backgroundColor: '#888',
        },
        selectorFilled: {
            backgroundColor: '#378FD2',
            borderWidth: 0,
        },
    };
});
