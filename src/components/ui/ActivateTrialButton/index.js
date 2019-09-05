import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';

import { Button } from '@meetfranz/forms';
import { gaEvent } from '../../../lib/analytics';

import UserStore from '../../../stores/UserStore';

const messages = defineMessages({
  action: {
    id: 'feature.delayApp.upgrade.action',
    defaultMessage: '!!!Get a Franz Supporter License',
  },
  actionTrial: {
    id: 'feature.delayApp.trial.action',
    defaultMessage: '!!!Yes, I want the free 14 day trial of Franz Professional',
  },
  shortAction: {
    id: 'feature.delayApp.upgrade.actionShort',
    defaultMessage: '!!!Upgrade account',
  },
  shortActionTrial: {
    id: 'feature.delayApp.trial.actionShort',
    defaultMessage: '!!!Activate the free Franz Professional trial',
  },
});

@inject('stores', 'actions') @observer
class ActivateTrialButton extends Component {
  static propTypes = {
    // eslint-disable-next-line
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    short: PropTypes.bool,
    gaEventInfo: PropTypes.shape({
      category: PropTypes.string.isRequired,
      event: PropTypes.string.isRequired,
      label: PropTypes.string,
    }),
  };

  static defaultProps = {
    className: '',
    short: false,
    gaEventInfo: null,
  }

  static contextTypes = {
    intl: intlShape,
  };

  handleCTAClick() {
    const { actions, stores, gaEventInfo } = this.props;
    const { hadSubscription } = stores.user.data;
    const { defaultTrialPlan } = stores.features.features;

    let label = '';
    if (!hadSubscription) {
      actions.user.activateTrial({ planId: defaultTrialPlan });

      label = 'Start Trial';
    } else {
      actions.ui.openSettings({ path: 'user' });

      label = 'Upgrade Account';
    }

    if (gaEventInfo) {
      const { category, event } = gaEventInfo;
      gaEvent(category, event, label);
    }
  }

  render() {
    const { stores, className, short } = this.props;
    const { intl } = this.context;

    const { hadSubscription } = stores.user.data;

    let label;
    if (hadSubscription) {
      label = short ? messages.shortAction : messages.action;
    } else {
      label = short ? messages.shortActionTrial : messages.actionTrial;
    }

    return (
      <Button
        label={intl.formatMessage(label)}
        className={classnames({
          [className]: className,
        })}
        buttonType="inverted"
        onClick={this.handleCTAClick.bind(this)}
        busy={stores.user.activateTrialRequest.isExecuting}
      />
    );
  }
}

export default ActivateTrialButton;

ActivateTrialButton.wrappedComponent.propTypes = {
  stores: PropTypes.shape({
    user: PropTypes.instanceOf(UserStore).isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    ui: PropTypes.shape({
      openSettings: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};