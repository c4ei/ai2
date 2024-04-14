

import React, { useContext } from 'react';
import { StoredChatResponses, DeleteItemFromChatHistory } from '../../../Services/Chat/Service';
import { FormatChatResponseListDate } from '../../../Utilities/Algorithms';
import { SlTrash } from 'react-icons/sl';
import { ChatContext } from '../../../Services/Chat/Context';
import { CoreContext } from '../../../Services/Core/Context';
import { Tooltip } from '@mui/material';
import Popover from '../../General/Popover';
import './StoredChatResponsesViewer.css';

const StoredChatResponsesViewer = () => {
    const { 
        HandleChatReset, 
        HandleChatResponseSelect, 
        UserExperience, 
        MountModifiedChatResponseList } = useContext(ChatContext);
    const { L } = useContext(CoreContext);

    return (
        <div className='Stored-Chat-Response-Box'>
            {Object.keys(StoredChatResponses() || []).map((StoredListDate, Index) => (
                <div key={Index}>
                    <Tooltip 
                        placement='right' 
                        title={L((UserExperience.GetSelectedList !== StoredListDate) ? ('CHAT_SIDE_MENU_STORED_RESPONSE_MOUNT') : ('CHAT_SIDE_MENU_STORED_RESPONSE_UNMOUNT'))}
                    >
                        <h3
                            className='Stored-Chat-Response-List-Title'
                            onClick={() => {
                                if(UserExperience.GetSelectedList === StoredListDate){
                                    UserExperience.SetSelectedList('');
                                    HandleChatReset();
                                    return;
                                }
                                HandleChatResponseSelect(StoredListDate);
                                UserExperience.SetSelectedList(StoredListDate);
                            }}
                            >{FormatChatResponseListDate(StoredListDate)}</h3>
                    </Tooltip>
                    {(UserExperience.GetSelectedList === StoredListDate) && (
                        <div className='Stored-Chat-Response-List-Items-Box'>
                            {StoredChatResponses()[StoredListDate].map(({ Prompt, CreatedAt, ID }, Index) => (
                                <Popover 
                                    Items={{
                                        General: [
                                            { OnClick: () => {
                                                DeleteItemFromChatHistory(ID, StoredListDate);
                                                MountModifiedChatResponseList(ID);
                                            }, Content: L('STORED_CHAT_RESPONSES_VIEWER_DELETE'), Icon: SlTrash }
                                        ]
                                    }}
                                    key={Index}>
                                    <div className='Stored-Chat-Response-List-Item-Box'>
                                        <p className='Stored-Chat-Response-List-Item-Title'>{Prompt}</p>
                                        <small>{CreatedAt}</small>
                                    </div>
                                </Popover>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default StoredChatResponsesViewer;