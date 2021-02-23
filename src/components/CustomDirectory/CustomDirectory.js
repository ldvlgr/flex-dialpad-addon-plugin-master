import * as React from "react";
import { Tab, templates, withTaskContext, Actions, Manager } from '@twilio/flex-ui';
import {
  TabContainer, InputContainer, StyledInput, ItemContainer
} from './CustomDirectoryComponents';
import DirectoryItem from './DirectoryItem';
import { connect } from 'react-redux';
import ConferenceService from '../../helpers/ConferenceService';


const directoryEntries = [
  
];

class CustomDirectory extends React.Component {
  state = {
    searchTerm: '',
    directoryEntries: [
      {
        number: '+18043340599',
        name: 'Ludo'
      }, {
        number: '+18013000675',
        name: 'Terence'
      }
    ]
  }

  componentDidMount() {
    console.log("CustomDirectory tab added to WorkerDirectory")
    //this.getDirectoryEntries();
  }


  getDirectoryEntries = async () => {
    const getDirectoryUrl = `[not used]/getExternalDirectory`;
  
    //Get Worker Attributes to get Business Unit
    const workerAttributes = Manager.getInstance().workerClient.attributes;

    const fetchBody = {businessunit: 'Unit1'};
  
    const fetchResponse = await fetch(getDirectoryUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(fetchBody)
    });
    let response;
    try {
      response = fetchResponse && await fetchResponse.json();
      this.setState({directoryEntries:response && response.directoryEntries});
    } catch (error) {
      console.error('Unable to parse get Directory response to JSON.', error);
    }
    console.debug('*** Get Directory  response:', response);
  };

  filteredDirectory = () => {
    const { searchTerm } = this.state;
    return this.state.directoryEntries.filter(entry => {
      if (!searchTerm) {
        return true;
      }
      return entry.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
  }

  onSearchInputChange = e => {
    this.setState({ searchTerm: e.target.value })
  }

  onTransferClick = item => async payload => {
    console.log('Transfer clicked');
    console.log('Transfer item:', item);
    console.log('Transfer payload:', payload);

    const { mode } = payload;

    Actions.invokeAction('HideDirectory');

    await this.addConferenceParticipant(item.number);
    
    if (mode.toLowerCase() === "cold" )
    {
      //Actions.invokeAction('HangupCall',{task:this.props.task});
      setTimeout(() => {
        console.log("Delayed Hangup");
        Actions.invokeAction('HangupCall',{task:this.props.task});
      }, 2000);
    }
  }


  addConferenceParticipant = async (itemnumber) => {
    const to = itemnumber;

    const { task } = this.props;
    const conference = task && (task.conference || {});
    const { conferenceSid } = conference;

    const mainConferenceSid = task.attributes.conference ? 
      task.attributes.conference.sid : conferenceSid;

    let from;
    if (this.props.phoneNumber) {
      from = this.props.phoneNumber
    } else {
      from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
    }

    // Adding entered number to the conference
    console.log(`Adding ${to} to conference`);
    let participantCallSid;
    try {

      participantCallSid = await ConferenceService.addParticipant(mainConferenceSid, from, to);
      ConferenceService.addConnectingParticipant(mainConferenceSid, participantCallSid, 'unknown');

    } catch (error) {
      console.error('Error adding conference participant:', error);
    }
  }

  render() {
    return (
      <TabContainer key="custom-directory-container">
        <InputContainer key="custom-directory-input-container">
          <StyledInput
            key="custom-directory-input-field"
            onChange={this.onSearchInputChange}
            placeholder={templates.WorkerDirectorySearchPlaceholder()}
          />
        </InputContainer>
        <ItemContainer
          key="custom-directory-item-container"
          className="Twilio-WorkerDirectory-Workers"
          vertical
        >
          {this.filteredDirectory().map(item => {
            //console.warn('Directory item:', item);
            return (
              <DirectoryItem
                item={item}
                key={item.id}
                onTransferClick={this.onTransferClick(item)}
              />
            );
          })}
        </ItemContainer>
      </TabContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    phoneNumber: state.flex.worker.attributes.phone
  };
};

export default connect(mapStateToProps)(withTaskContext(CustomDirectory));
