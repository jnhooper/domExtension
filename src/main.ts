import { Observer, Subscription } from 'rxjs';
import { DomChat } from './domChat';

const domChat = new DomChat();

const chatSubscription = domChat.subscribeToChat(domChatMessage => {
  console.log(`Received chat message from ${domChatMessage.author}: '${domChatMessage.text}'`);
});

const commandSubscription = domChat.subscribeToCommands(domCommand => {
  console.log(`Received command: '${domCommand.text}'`);
  if (domCommand.text === '52' && domChat) {
    domChat.showNotice('You requested a 5-2 reshuffle');
    domChat.sendChat('Dom-bot would like to reshuffle.');
  }
});
