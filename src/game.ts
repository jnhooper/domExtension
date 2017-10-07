import { retry } from './utils';

const MAX_END_TURN_WAIT = 3000;

// End our user's actions.
export const endActions = () => {
  const visibleEndActionsButton = document.querySelector('end-actions-button[aria-hidden="false"] input');
  if (visibleEndActionsButton) {
    (<HTMLInputElement> visibleEndActionsButton).click();
  }
};

// End our user's turn. If actions need to be ended first, that'll be done automatically.
// This action isn't necessarily synchronous - there are delays while the browser talks to the
// server. So don't expect the turn to have ended immediately after this is called!
export const endTurn = () => {
  endActions();

  const findEndTurnButton = () => {
    const visibleEndTurnButton = document.querySelector('end-turn-button[aria-hidden="false"] input');
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
