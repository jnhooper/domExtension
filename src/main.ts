import { difference as _difference, isEmpty as _isEmpty } from 'lodash';
import { Observable, Observer, Subscription } from 'rxjs';
import { waitUntil } from './utils';
import * as Commands from './commands';
import * as Signals from './signals';
import { isOurTurn, endTurn, getAllPlayerNames } from './game';
import DomChat from './domChat';

const domChat = new DomChat();

const chatObservable = domChat.getChatObservable();

chatObservable.subscribe(dcm => {
  console.log(`Received message '${dcm.text}' from ${dcm.author}`);
  return dcm;
});

{
  const SHUFFLE_52_CONSENSUS_TIME_LIMIT_MS = 5000;

  // An observable of all the proposals to do a reshuffle.
  const shuffle52ProposalObservable = chatObservable.filter(domChatMessage => {
    return domChatMessage.text === Signals.PROPOSE_RESHUFFLE_52;
  }).map(dcm => dcm.author);

  // An observable of all the responses saying "OK" to a proposed reshuffle
  const shuffle52AcceptanceObservable = chatObservable.filter(dcm => {
    return dcm.text === Signals.ACCEPT_RESHUFFLE_52;
  }).map(dcm => dcm.author);

  // For now - if we see a proposal, automatically send an acceptance via chat
  shuffle52ProposalObservable.subscribe(() => {
    console.log('Saw 52 proposition - responding with acceptance');
    domChat.sendChat(Signals.ACCEPT_RESHUFFLE_52);
  });

  // Observable containing observables ('windows') of all the acceptances received
  // within 3s of a proposal
  const shuffleConsensusWindows =
    shuffle52AcceptanceObservable.windowToggle(
      shuffle52ProposalObservable.throttleTime(SHUFFLE_52_CONSENSUS_TIME_LIMIT_MS),
      proposal => Observable.timer(SHUFFLE_52_CONSENSUS_TIME_LIMIT_MS)
    );

  // Reduce each window (which is an observable) into a list of players who accepted
  const acceptingPlayersInShuffleConsensusWindows = shuffleConsensusWindows.map(scw => {
    // Map this observable of accepting players into an observable that accumulates all the players
    // that have accepted so far in this observable (basically like a reduce)
    const accPlayersObservable = scw.scan((accPlayers, player) => [...accPlayers, player], []);
    // Return an observable that either contains: the first element of the reduction to contain
    // every player's name, OR the last element if we never get that far.
    // This find is necessary so we can figure out that everyone's accepted without having to wait
    // for the consensus time limit to finish up and close the window.
    return accPlayersObservable.find(ap => _isEmpty(_difference(getAllPlayerNames(), ap)));
  }).concatAll();

  // Partition these windows, now lists of accepting players, into two separate observables: one
  // containing windows where every player accepted, the other windows where not every player did.
  const [shuffleConsensuses, failedShuffleConsensuses] =
    acceptingPlayersInShuffleConsensusWindows.partition(apiscw => {
      return _isEmpty(_difference(getAllPlayerNames(), apiscw));
    });

  shuffleConsensuses.subscribe(() => {
    // Once we've all agreed to do a re-shuffle, burn 2 turns.
    waitUntil(isOurTurn).then(() => {
      endTurn();
      waitUntil(isOurTurn).then(() => {
        endTurn();
      });
    });
  });

  failedShuffleConsensuses.subscribe(() => console.log('Could not reach consensus on reshuffle.'));
}

const commandSubscription = domChat.getCommandsObservable().subscribe(domCommand => {
  console.log(`Received command: '${domCommand.text}'`);
  if (domCommand.text === Commands.RESHUFFLE_52) {
    // domChat.showNotice('You requested a 5-2 reshuffle');
    domChat.sendChat(Signals.PROPOSE_RESHUFFLE_52);
  } else if (domCommand.text === Commands.END_TURN) {
    // domChat.showNotice('Ending your turn.');
    endTurn();
  }
});
