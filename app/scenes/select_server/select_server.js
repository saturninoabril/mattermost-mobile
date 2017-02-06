// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PropTypes, PureComponent} from 'react';
import {
    Image,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    View
} from 'react-native';

import Button from 'react-native-button';
import ErrorText from 'app/components/error_text';
import FormattedText from 'app/components/formatted_text';
import Loading from 'app/components/loading';
import TextInputWithLocalizedPlaceholder from 'app/components/text_input_with_localized_placeholder';
import {GlobalStyles} from 'app/styles';

import logo from 'assets/images/logo.png';

import Client from 'service/client';
import RequestStatus from 'service/constants/request_status';

export default class SelectServer extends PureComponent {
    static propTypes = {
        serverUrl: PropTypes.string.isRequired,
        server: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
        configRequest: PropTypes.object.isRequired,
        licenseRequest: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getClientConfig: PropTypes.func.isRequired,
            getLicenseConfig: PropTypes.func.isRequired,
            handleLoginOptions: PropTypes.func.isRequired,
            handleServerUrlChanged: PropTypes.func.isRequired
        }).isRequired
    };

    onClick = () => {
        const {
            getClientConfig,
            getLicenseConfig,
            handleLoginOptions
        } = this.props.actions;

        Client.setUrl(this.props.serverUrl);

        getClientConfig().then(getLicenseConfig).then(handleLoginOptions);
    };

    blur = () => {
        this.textInput.refs.wrappedInstance.blur();
    };

    render() {
        if (this.props.configRequest.status === RequestStatus.STARTED || this.props.licenseRequest.status === RequestStatus.STARTED) {
            return <Loading/>;
        }

        return (
            <KeyboardAvoidingView
                behavior='padding'
                style={{flex: 1}}
                keyboardVerticalOffset={0}
            >
                <TouchableWithoutFeedback onPress={this.blur}>
                    <View style={[GlobalStyles.container, GlobalStyles.signupContainer]}>
                        <Image
                            source={logo}
                        />
                        <FormattedText
                            style={[GlobalStyles.header, GlobalStyles.label]}
                            id='mobile.components.select_server_view.enterServerUrl'
                            defaultMessage='Enter Server URL'
                        />
                        <ErrorText error={this.props.configRequest.error || this.props.licenseRequest.error}/>
                        <TextInputWithLocalizedPlaceholder
                            ref={(ref) => {
                                this.textInput = ref;
                            }}
                            value={this.props.serverUrl}
                            onChangeText={this.props.actions.handleServerUrlChanged}
                            onSubmitEditing={this.onClick}
                            style={GlobalStyles.inputBox}
                            autoCapitalize='none'
                            autoCorrect={false}
                            keyboardType='url'
                            placeholder={{id: 'mobile.components.select_server_view.siteUrlPlaceholder', defaultMessage: 'https://mattermost.example.com'}}
                            returnKeyType='go'
                            underlineColorAndroid='transparent'
                        />
                        <Button
                            onPress={this.onClick}
                            loading={this.props.server.loading}
                            containerStyle={GlobalStyles.signupButton}
                        >
                            <FormattedText
                                style={GlobalStyles.signupButtonText}
                                id='mobile.components.select_server_view.proceed'
                                defaultMessage='Proceed'
                            />
                        </Button>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        );
    }
}
