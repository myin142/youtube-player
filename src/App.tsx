import { ipcRenderer } from 'electron';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { SearchPage } from './pages/search/SearchPage';
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
          <Route path="/search" component={SearchPage} />

          <Route path="/">
            <Redirect to="/library/." />
          </Route>
        </Switch>
      </Router>
    );
  }
}
