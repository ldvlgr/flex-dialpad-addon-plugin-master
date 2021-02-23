import React from 'react';
import { VERSION, TaskHelper } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import CustomDirectory from './components/CustomDirectory';

import reducers, { namespace } from './states';
import registerCustomActions from './customActions';
import { loadExternalTransferInterface } from './components/ExternalTransfer';
import { loadInternalCallInterface } from './components/InternalCall';

const PLUGIN_NAME = 'DialpadPlugin';

export default class DialpadPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
  
    loadExternalTransferInterface.bind(this)(flex, manager)

    /*  Commented out to prevent agent to agent calling 
    loadInternalCallInterface.bind(this)(flex, manager)
*/

    registerCustomActions(manager);

    this.registerReducers(manager);
    console.log("------------------Adding new workerdirectory tab");
    flex.WorkerDirectory.Tabs.Content.add(
      <flex.Tab
        key="custom-directory"
        label="Directory"
      >
        <CustomDirectory />
      </flex.Tab>
    );

  }

  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
