import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { AppEvent } from './services/event.service';
import YoutubePlayerPage from './youtube-player/YoutubePlayerPage';

interface AppState {
  redirect: string;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2e2e2e',
      light: '#3f3f3f',
      // dark: '#232323',
      // contrastText: '#ffffff',
    },
    secondary: {
      main: '#b13e3e',
    },
    background: {
      default: '#232323',
    },
  },
  overrides: {
    MuiIconButton: {
      root: {
        color: '#ffffff',
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: '#3f3f3f',
        height: '0.1rem',
      },
    },
  },
});

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
    const folder = process.cwd();
    const defaultUrl = `/player/${encodeURIComponent(folder)}`;

    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          {redirect && <Redirect to={redirect} />}
          <Switch>
            <Route path="/player/:path" component={YoutubePlayerPage} />

            <Route path="/">
              <Redirect to={defaultUrl} />
            </Route>
          </Switch>
        </Router>
      </MuiThemeProvider>
    );
  }
}
