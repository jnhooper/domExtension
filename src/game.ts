import { retry } from './utils';

const MAX_END_TURN_WAIT = 3000;

const ourNameSelector = '.hero-info .opponent-name';
const opponentNamesSelector = '.opponent-view .opponent-name';
const endActionsButtonSelector = 'end-actions-button[aria-hidden="false"] > input';
const endTurnButtonSelector = 'end-turn-button[aria-hidden="false"] > input';

const extractNameFromNameElt = (nameElt: Element) => {
  return (nameElt.textContent || '').split('\n')[0];
}

export const getOurName = (): string => {
  const ourNameElt = document.querySelector(ourNameSelector);
  return ourNameElt ? extractNameFromNameElt(ourNameElt) : '';
}

export const getOpponentNames = (): string[] => {
  const opponentNameElts = Array.from(document.querySelectorAll(opponentNamesSelector));
  return opponentNameElts.map(extractNameFromNameElt);
}

export const getAllPlayerNames = (): string[] => [getOurName(), ...getOpponentNames()];

// Returns true if it's our user's turn.
export const isOurTurn = (): boolean => {
  // We can assume it's our turn if we can see the 'end actions' or 'end turn' button.
  const canEndActions = document.querySelector(endActionsButtonSelector)
  const canEndTurn = document.querySelector(endTurnButtonSelector);

  return Boolean(canEndActions || canEndTurn);
}

// Ends our user's actions, if possible
export const endActions = (): void => {
  const visibleEndActionsButton = document.querySelector(endActionsButtonSelector);
  if (visibleEndActionsButton) {
    (<HTMLInputElement> visibleEndActionsButton).click();
  }
};

// End our user's turn. If actions need to be ended first, that'll be done automatically.
// This action isn't necessarily synchronous - there are delays while the browser talks to the
// server. So don't expect the turn to have ended immediately after this is called!
export const endTurn = (): void => {
  endActions();

  const findEndTurnButton = () => {
    const visibleEndTurnButton = document.querySelector(endTurnButtonSelector);
    return { success: !!visibleEndTurnButton, result: visibleEndTurnButton };
  };

  // If we needed to hit 'end actions' first, it takes time for the browser to send the command to
  // the server, get a response, and show the 'end turn' button - so we'll have to keep checking for
  // the 'end turn' button to appear.
  retry(findEndTurnButton, 10, MAX_END_TURN_WAIT / 10).then(visibleEndTurnButton => {
    // I don't think this can be null if the promise succeeded, but TS doesn't know that.
    if (visibleEndTurnButton) {
      (<HTMLInputElement>visibleEndTurnButton).click();
    }
  });
};
