import { Observer, Subscription } from 'rxjs';
import { DomChat } from './domChat';

const findChatRoot = () => document.querySelector('.game-chat');

let activeDomChat: (DomChat | null) = null;
let chatSubscription: (Subscription | null) = null;

setInterval(() => {
  const chatRoot = findChatRoot();
  if (chatRoot && activeDomChat === null) {
    console.log('Found a chat root! Establishing dom chat handle...');
    // If we don't have a DomChat instance yet, but there is a chat box on the page - connect to it
    activeDomChat = new DomChat(chatRoot);
    chatSubscription = activeDomChat.subscribe(domChatMessage => {
      console.log(`Received chat message from ${domChatMessage.author}: '${domChatMessage.text}'`);
    });
  } else if (!chatRoot && chatSubscription) {
    // If the chat window is gone, but we still have a 'handle' to the chat window - clean it up
    chatSubscription.unsubscribe();

    activeDomChat = null;
    chatSubscription = null;
  }
}, 1000);
