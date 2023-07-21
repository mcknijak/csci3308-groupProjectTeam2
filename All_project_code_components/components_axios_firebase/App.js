import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import axios from './components/axios'
import Login from './components/Login';
import React, { useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import { useStateValue } from './components/StateProvider';

// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//const firebaseConfig = {
// apiKey: "AIzaSyCKRFZ9N-zd253Fmnir_4ZgXh9nZUrSqbI",
// authDomain: "messaging-app-mern-17bf3.firebaseapp.com",
// projectId: "messaging-app-mern-17bf3",
// storageBucket: "messaging-app-mern-17bf3.appspot.com",
// messagingSenderId: "419814309493",
// appId: "1:419814309493:web:53dddf31e46e51aa03823c"
//};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);


function App() {
  const [messages, setMessages] = useState([])
  const [{ user }, dispatch] = useStateValue()

  useEffect(() => {
    axios.get("/messages/sync").then(res => {
      setMessages(res.data)
    })
  }, [])

  useEffect(() => {
    const pusher = new Pusher('', {
      cluster: ''
    });
    const channel = pusher.subscribe('messages');
    channel.bind('inserted', (data) => {
      console.log(data)
      setMessages([...messages, data])
    });
    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [messages])
  console.log(messages)

  return (
    <div className="app">
      {!user ? <Login /> : (
        <div className="app__body">
          <Sidebar messages={messages} />
          <Chat messages={messages} />
        </div>
      )}
    </div>
  );
}

export default App;
