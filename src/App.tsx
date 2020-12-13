import { ipcRenderer } from 'electron';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { HomePage } from './pages/homepage/Homepage';
import { LibraryPage } from './pages/library/LibraryPage';
import { AppEvent } from './services/event.service';

interface AppState {
  redirect: string;
}

export default class App extends React.Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      redirect: '',
    };
  }

  componentDidMount() {
    ipcRenderer.on(AppEvent.REDIRECT, this.setRedirect.bind(this));
  }

  private setRedirect = (_sender: unknown, url: string) =>
    this.setState({ redirect: url });

  render() {
    const { redirect } = this.state;

    return (
      <Router>
        {redirect && <Redirect to={redirect} />}
        <Switch>
          <Route path="/library/:path" component={LibraryPage} />
          <Route path="/" component={HomePage} />
        </Switch>
      </Router>
    );
  }
}
