import React from 'react';
import PropTypes from 'prop-types';
import './status.css'
import { grammarJoin, resolvePlayerNames, resolvePlayerName, getPlayers } from '../../../utils/utils';

class Status extends React.Component {
  static propTypes = {
    playerID: PropTypes.any,
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    current: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    names: PropTypes.any.isRequired,
    dealtCard: PropTypes.string.isRequired,
    isInThreatStage: PropTypes.bool
  };

  static defaultProps = {
    isInThreatStage: false
  };

  render() {
    if (!this.props.isInThreatStage) {
      let currentPlayerName = resolvePlayerName(this.props.ctx.currentPlayer, this.props.names, this.props.playerID);
      let prefix = <span />;

      if (this.props.dealtCard === "" && this.props.G.round > 1) {
        let winnerName = resolvePlayerName(this.props.G.lastWinner, this.props.names, this.props.playerID);
        prefix = (
          <span>Last round won by <strong>{winnerName}</strong>. </span>
        );
      }

      return (
        <span className='status'>{prefix}Waiting for <strong>{currentPlayerName}</strong> to play a card.</span>
      );
    } else {
      let all = new Set(getPlayers(this.props.ctx.numPlayers));
      let passed = new Set(this.props.G.passed);
      let difference = new Set([...all].filter(x => !passed.has(x)));
      let players = resolvePlayerNames(Array.from(difference), this.props.names, this.props.playerID);
      let playerWhoDealt = resolvePlayerName(this.props.G.dealtBy, this.props.names, this.props.playerID);

      return (
        <span className='status'><strong>{playerWhoDealt}</strong> dealt <strong>{this.props.dealtCard}</strong>, waiting for <strong>{grammarJoin(players)}</strong> to add threats or pass.</span>
      );
    }
  } 
}
export default Status;