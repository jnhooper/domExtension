import { compact as _compact } from 'lodash';
import { Observable, Observer, Subscription } from 'rxjs';

const CHAT_POLL_INTERVAL = 500;
const COMMAND_POLL_INTERVAL = 100;

export interface DomChatMessage {
  author: string;
  text: string;
}

export interface DomCommand {
  text: string;
}

// User enters commands by typing into the chat window: <command text here>
const commandRegex = /^\<(.*?)\>.*$/;

const chatLine2DomChatMessage = (chatLine: Element): (DomChatMessage | null) => {
  const lines = chatLine.getElementsByClassName('log-line');
  // Non-chat messages have no content in the second 'log-line' element, so skip those
  if (lines.length < 2 || lines[lines.length - 1].textContent === '') {
    return null;
  }

  const author = (lines[0].textContent || '').replace(/:\s$/, '');
  const text = lines[1].textContent || '';

  return { author, text };
};

export class DomChat {
  chatFormRoot: Element;
  chatLogRoot: Element;
  chatLinesProcessed: number;
  chatObservable: Observable<DomChatMessage>;
  commandsObservable: Observable<DomCommand>;

  // Pass this the element that contains the chat log div and the chat submit form.
  constructor(rootChatElt: Element) {
    if (!rootChatElt) {
      throw new Error('DomChat needs the root chat element');
    }

    const chatFormRoot = rootChatElt.querySelector('form');
    const chatLogRoot = rootChatElt.querySelector('.game-chat-display');

    if (!chatFormRoot) {
      throw new Error('Couldn\'t find chat submission form');
    } else if (!chatLogRoot) {
      throw new Error('Couldn\'t find chat log');
    }

    this.chatFormRoot = chatFormRoot;
    this.chatLogRoot = chatLogRoot;
    this.chatLinesProcessed = 0;

    this.chatObservable = Observable.create((observer: Observer<DomChatMessage>) => {
      const timerHandle = setInterval(() => {
        // Get all the chat lines that haven't already been processed
        const allChatLines = this.chatLogRoot.children;
        const newChatLines = [];
        for (let i = this.chatLinesProcessed; i < allChatLines.length; i++) {
          newChatLines.push(allChatLines[i]);
        }

        // Some chatLines don't represent chat messages - they can be stuff like "so and so
        // reconnected", "Undo request cancelled", etc - so skip those (they'll be null).
        const newDomChatMessages = _compact(newChatLines.map(chatLine2DomChatMessage));

        // Publish all the new messages
        newDomChatMessages.forEach(dcm => observer.next(dcm));

        this.chatLinesProcessed = allChatLines.length;
      }, CHAT_POLL_INTERVAL);

      return () => {
        console.log('Cleaning up chat observable');
        clearInterval(timerHandle);
      };
    });

    this.commandsObservable = Observable.create((observer: Observer<DomCommand>) => {
      const timerHandle = setInterval(() => {
        // Watch the chat input for something that looks like a command to be typed into it (as
        // described by the `commandRegex`). If a command is typed, publish it and clear the input
        const inputs = this.chatFormRoot.getElementsByTagName('input');
        if (inputs.length < 1) return;

        const chatInput = inputs[0];
        const commandMatches = chatInput.value.match(commandRegex);
        if (commandMatches && commandMatches.length > 1) {
          const commandText = commandMatches[1];
          observer.next({ text: commandText });

          chatInput.value = '';
          // Make sure Angular is notified of the change
          chatInput.dispatchEvent(new Event('change'));
        }
      }, COMMAND_POLL_INTERVAL);

      return () => {
        console.log('Cleaning up commands observable');
        clearInterval(timerHandle);
      }
    });
  }

  // Invokes your callback with each chat message as they arrive
  // This includes messages from the user.
  subscribeToChat(next: (dcm: DomChatMessage) => any): Subscription {
    return this.chatObservable.subscribe(next);
  }

  // Invokes your callback with each command as it's entered in the chat window
  subscribeToCommands(next: (command: DomCommand) => any): Subscription {
    return this.commandsObservable.subscribe(next);
  }

  sendChat(text: string) {
    const inputs = this.chatFormRoot.getElementsByTagName('input')
    if (inputs.length < 1) return;
    const chatInput = inputs[0];
    chatInput.value = text;

    // Angular won't "pick up" the new input content unless this change event is fired - otherwise,
    // Angular still thinks the input is empty and so doesn't send the message when we submit it
    chatInput.dispatchEvent(new Event('change'));

    this.chatFormRoot.dispatchEvent(new Event('submit'));
  }

  showNotice(text: string) {
    const noticeMarkup = 
      `<div>
        <div class="log-line" style="display: inline; color: #ff0000;">
          ${text}
        </div>
      </div>`;

    const containerDiv = document.createElement('div');
    containerDiv.innerHTML = noticeMarkup;
    const noticeDom = containerDiv.firstChild;
    if (noticeDom) {
      this.chatLogRoot.appendChild(noticeDom);
    }
  }
}
