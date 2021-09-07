
import _ from 'lodash';
import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Col, Container, Form, FormFeedback, FormGroup, FormText, Input, Label, Row, Table } from 'reactstrap';
import { API_PORT, DEFAULT_GAME_MODE, DEFAULT_START_SUIT, GAMEMODE_CORNUCOPIA, GAMEMODE_EOP, DEFAULT_TURN_DURATION, MAX_NUMBER_PLAYERS, MIN_NUMBER_PLAYERS, STARTING_CARD_MAP, MODEL_TYPE_THREAT_DRAGON, MODEL_TYPE_IMAGE, MODEL_TYPE_DEFAULT } from '../../utils/constants';
import { getTypeString } from '../../utils/utils';
import Footer from '../components/footer/footer';
import Logo from '../components/logo/logo';
import CopyButton from '../components/copybutton/copybutton';
import '../styles/create.css';
import LinkDisplay from '../components/linkDisplay/linkDisplay';

class Create extends React.Component {

  constructor(props) {
    super(props);
    let initialPlayerNames = {};
    let initialSecrets = {};
    _.range(MAX_NUMBER_PLAYERS).forEach(
      n => {
        initialPlayerNames[n] = `Player ${n + 1}`;
        initialSecrets[n] = ``;
      }
    );

    this.state = {
      players: 3,
      matchID: "",
      names: initialPlayerNames,
      secret: initialSecrets,
      creating: false,
      created: false,
      modelType: MODEL_TYPE_DEFAULT,
      model: undefined,
      image: undefined,
      startSuit: DEFAULT_START_SUIT,
      turnDuration: DEFAULT_TURN_DURATION,
      provideModelThruAlternativeChannel: false,
      gameMode: DEFAULT_GAME_MODE,
    };

    this.onPlayersUpdated = this.onPlayersUpdated.bind(this);
    this.onNameUpdated = this.onNameUpdated.bind(this);
    this.onstartSuitUpdated = this.onstartSuitUpdated.bind(this);
    this.onTurnDurationUpdated = this.onTurnDurationUpdated.bind(this);
    this.ongameModeUpdated = this.ongameModeUpdated.bind(this);
    this.readJson = this.readJson.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.onFileRead = this.onFileRead.bind(this);
    this.createGame = this.createGame.bind(this);
    this.updateModelType = this.updateModelType.bind(this);
    this.formatAllLinks = this.formatAllLinks.bind(this);
    this.url = this.url.bind(this);

    this.fileReader = new FileReader();
    this.fileReader.onloadend = this.onFileRead;

    this.apiBase = (process.env.NODE_ENV === 'production') ? '/api' : `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }

  async createGame() {

    this.setState({
      ...this.state,
      creating: true,
    });
    // FormData object (with file if required)
    const formData = new FormData()
    
    formData.append('players', this.state.players);
    formData.append('modelType', this.state.modelType);
    if (this.state.modelType !== MODEL_TYPE_DEFAULT) {
      formData.append('model', this.state.modelType === MODEL_TYPE_IMAGE ? this.state.image : JSON.stringify(this.state.model));
    }
    for(let i = 0; i < this.state.players; i++) {
      formData.append('names[]', this.state.names[i]);
    }
    formData.append('startSuit', this.state.startSuit);
    formData.append('turnDuration', this.state.turnDuration);
    formData.append('gameMode', this.state.gameMode);

    // Use Fetch API (not superagent)
    const response = await fetch(
      `${this.apiBase}/game/create`,
      {
        method: 'POST',
        body: formData
      }
    );

    // deal with response
    const r = await response.json();

    const gameId = r.game;

    for (var i = 0; i < r.credentials.length; i++) {
      this.setState({
        ...this.state,
        secret: {
          ...this.state.secret,
          [i]: r.credentials[i],
        },
      });
    }

    this.setState({
      ...this.state,
      matchID: gameId,
      created: true,
    });
  }

  onFileRead() {
    this.setState({
      ...this.state,
      model: JSON.parse(this.fileReader.result),
    });
  }

  readJson(e) {
    this.fileReader.readAsText(e.target.files[0]);
  }

  updateImage(e) {
    this.setState({
      ...this.state,
      image: e.target.files[0]
    });
  }

  onPlayersUpdated(e) {
    this.setState({
      ...this.state,
      players: parseInt(e.target.value),
    });
  }

  onstartSuitUpdated(e) {
    this.setState({
      ...this.state,
      startSuit: e.target.value,
    });
  }

  ongameModeUpdated(e) {
    this.setState({
      ...this.state,
      gameMode: e.target.value,
    });
  }

  onNameUpdated(idx, e) {
    this.setState({
      ...this.state,
      names: {
        ...this.state.names,
        [idx]: e.target.value,
      }
    });
  }

  onTurnDurationUpdated(e) {
    this.setState({
      ...this.state,
      turnDuration: e.target.value
    });
  }

  isFormValid() {
    for (var i = 0; i < this.state.players; i++) {
      if (_.isEmpty(this.state.names[i])) {
        return false;
      }
    }
    if((this.state.modelType === MODEL_TYPE_THREAT_DRAGON && !this.state.model) ||
      (this.state.modelType === MODEL_TYPE_IMAGE && !this.state.image)) {
      return false;
    }
    return true;
  }

  updateModelType(e) {
    this.setState({
      ...this.setState,
      modelType: e.target.value,
    })
  }

  url(i) {
    return `${window.location.origin}/${this.state.matchID}/${i}/${this.state.secret[i]}`;
  }

  formatAllLinks() {
    return (
      'You have been invited to a game of Elevation of Privilege:\n\n' +
      Array(this.state.players).fill(0).map((v, i) => {
        return `${this.state.names[i]}:\t${this.url(i)}`;
      }).join('\n\n')
    );
  }

  render() {
    let createForm = <div />;
    if (!this.state.created) {
      createForm = (
        <div>
          <p>Elevation of Privilege (EoP) is the easy way to get started and learn threat modeling. It is a card game that developers, architects or security experts can play.</p>
          <p>To learn more about the game, navigate to the <Link to="/about">about page</Link>.</p>
          <small className="text-muted">To start playing, select the number of players and enter their names.</small>
          <hr />
          <Form>
            <FormGroup row>
              <Label for="players" sm={2}>Players</Label>
              <Col sm={10}>
                <Input type="select" name="players" id="players" onChange={e => this.onPlayersUpdated(e)} value={this.state.players}>
                  {
                    _.range(MIN_NUMBER_PLAYERS, MAX_NUMBER_PLAYERS + 1).map(
                      n => (
                        <option key={`players-${n}`} value={n}>{n}</option>
                      )
                    )
                  }
                </Input>
              </Col>
            </FormGroup>
            <hr />
            {Array(this.state.players).fill(0).map((v, i) =>
              <FormGroup row key={i}>
                <Label for={`p${i}`} sm={2}>Name</Label>
                <Col sm={10}>
                  <Input autoComplete={"off"} type="text" invalid={_.isEmpty(this.state.names[i])} name={`p${i}`} id={`p${i}`} onChange={e => this.onNameUpdated(i, e)} value={this.state.names[i]} />
                  <FormFeedback>The name cannot be empty</FormFeedback>
                </Col>
              </FormGroup>
            )}
            <hr />
            <FormGroup row>
              <Label for="gameMode" sm={2}>Game Mode</Label>
              <Col sm={10}>
                <Input id="gameMode" type="select" onChange={e => this.ongameModeUpdated(e)} value={this.state.gameMode}>
                  <option>{GAMEMODE_EOP}</option>
                  <option>{GAMEMODE_CORNUCOPIA}</option>
                </Input>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="startSuit" sm={2}>Start Suit</Label>
              <Col sm={10}>
                <Input type="select" name="startSuit" id="startSuit" onChange={e => this.onstartSuitUpdated(e)} value={this.state.startSuit}>
                  {
                    Object.keys(STARTING_CARD_MAP[this.state.gameMode]).map(suit => (
                      <option value={suit} key={`start-suit-option-${suit}`}>{getTypeString(suit, this.state.gameMode)}</option>
                    ))
                  }
                </Input>
              </Col>
            </FormGroup>
            <hr />
            <FormGroup row>
              <Label for="turnDuration" sm={2}>Turn Duration</Label>
              <Col sm={10}>
                <Input type="select" name="turnDuration" id="turnDuration" onChange={e => this.onTurnDurationUpdated(e)} value={this.state.turnDuration}>
                  <option value={0}>No Timer</option>
                  <option value={180}>3 mins</option>
                  <option value={300}>5 mins</option>
                  <option value={600}>10 mins</option>
                </Input>
              </Col>
            </FormGroup>
            <hr />
            <FormGroup row>
              <Label for="model" sm={2}>Model</Label>
              <Col sm={10}>
                <FormGroup>
                  <Label check>
                    <Input type="radio" name="model-type" value={MODEL_TYPE_THREAT_DRAGON} onChange={this.updateModelType}/>
                    Provide model via Threat Dragon
                  </Label>
                  <Input disabled={this.state.modelType !== MODEL_TYPE_THREAT_DRAGON} type="file" name="model-json" id="model" onChange={this.readJson} checked={this.state.modelType === MODEL_TYPE_THREAT_DRAGON}/>
                  <FormText color="muted">
                    Select the JSON model produced by <a target="_blank" rel="noopener noreferrer" href="https://docs.threatdragon.org/">Threat Dragon</a>.
                  </FormText>
                  <FormText color="muted">
                    Or download a <a target="_blank" rel="noopener noreferrer" href="https://raw.githubusercontent.com/mike-goodwin/owasp-threat-dragon-demo/master/ThreatDragonModels/Demo%20Threat%20Model/Demo%20Threat%20Model.json">sample model</a> to try it out.
                  </FormText>
                </FormGroup>
                <FormGroup>
                  <Label check>
                    <Input type="radio" name="model-type" value={MODEL_TYPE_IMAGE} onChange={this.updateModelType}/>
                    Provide Model via an image
                  </Label>
                  <Input disabled={this.state.modelType !== MODEL_TYPE_IMAGE} type="file" accept="image/*" name="model-image" id="model" onChange={this.updateImage} checked={this.state.modelType === MODEL_TYPE_IMAGE}/>
                </FormGroup>
                <FormGroup>
                  <Label check>
                    <Input id="radio-button-default-model" type="radio" value={MODEL_TYPE_DEFAULT} name="model-type" onChange={this.updateModelType} checked={this.state.modelType === MODEL_TYPE_DEFAULT}/>
                    Provide model via a different channel (e.g. video stream)
                  </Label>
                </FormGroup>
              </Col>
            </FormGroup>
            <hr />
            <Button block size="lg" color="warning" disabled={this.state.creating || !this.isFormValid()} onClick={this.createGame}>Proceed</Button>
          </Form>
          <hr />
          <small className="text-muted">
            Players will be able to join the game with the links that are generated after you proceed.
          </small>
        </div >
      );
    }

    return (
      <div>
        <Helmet bodyAttributes={{ style: 'background-color : #000' }} />
        <Container className="create">
          <Row style={{ paddingTop: "20px" }}>
            <Col sm="12" md={{ size: 6, offset: 3 }}>
              <div className="text-center">
                <Logo />
              </div>
              <Card>
                <CardHeader className="text-center">Elevation of Privilege</CardHeader>
                <CardBody>
                  {
                    (!this.state.created)
                      ? createForm
                      : <LinkDisplay
                          players={this.state.players}
                          matchID={this.state.matchID}
                          names={this.state.names}
                          secret={this.state.secret}
                        />
                  }
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm="12" md={{ size: 6, offset: 3 }} className="text-center">
              <Footer />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
export default Create;
