import React, { useEffect, useState } from 'react'
import { Avatar, IconButton } from '@mui/material'
import { AttachFile, MoreVert, SearchOutlined, InsertEmoticon } from '@mui/icons-material'
import { Mic } from '@mui/icons-material'
import axios from './axios'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import EmojiPicker from 'emoji-picker-react'
import './Chat.css'

import { useStateValue } from './StateProvider';

const Chat = ({ messages }) => {
    const [seed, setSeed] = useState("")
    const [input, setInput] = useState("")
    const [{ user }, dispatch] = useStateValue()
    const [showPicker, setShowPicker] = useState()

    const sendMessage = async (e) => {
        e.preventDefault()
        await axios.post('/messages/new', {
            message: input,
            name: user.displayName,
            timestamp: new Date().toUTCString(),
            received: true
        })
        setInput("")
    }

    const handleEmojiSelect = (emoji) => {
        setInput((prev) => prev + emoji.native);
        // setShowPicker(false);
    };

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000))
    }, [])
    return (
        <div className="chat">
            <div className="chat__header">
                <Avatar src={`https://avatars.dicebear.com/api/human/b${seed}.svg`} />
                <div className="chat__headerInfo">
                    <h3>Test Chat</h3>
                    <p>Last seen at {" "}
                        {messages[messages.length - 1]?.timestamp}
                    </p>
                </div>
                <div className="chat__headerRight">
                    <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </div>
            </div>
            <div className="chat__body">
                {messages.map(message => (
                    <p className={`chat__message ${message.name === user.displayName && 'chat__receiver'}`}>
                        <span className="chat__name">{message.name}</span>
                        {message.message}
                        <span className="chat__timestamp">
                            {message.timestamp}
                        </span>
                    </p>
                ))}
            </div>
            <div className="chat__footer">
                <div style={{ position: 'relative' }}>
                    <InsertEmoticon onClick={() => setShowPicker((prev) => !prev)} />

                </div>
                <div
                    className='emoji-picker'
                    style={{

                        top: '120px',
                        left: '180',
                        zIndex: '100',
                        display: showPicker ? 'block' : 'none'
                    }}
                >
                    {showPicker && <Picker className='emoji-picker' onEmojiSelect={handleEmojiSelect} />}
                </div>
                <form>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message"
                        type="text"
                    />
                    <button onClick={sendMessage} type="submit">Send a message</button>
                </form>
                <Mic />
            </div>
        </div >
    )
}

export default Chat