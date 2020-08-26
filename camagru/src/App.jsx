import React, { Component } from 'react';

// import { API_URL } from "../src/components/Client/Config";

import NavBar from "./components/Client/Navbar";
// import Footer from "./components/Client/Footer/Footer";
import Home from "./components/Client/Home";
import Studio from "./components/Client/Studio";
import Signup from "./components/Client/Signup";
import Login from "./components/Client/Login";
import Settings from "./components/Client/Settings";
import ForgotLogin from "./components/Client/ForgotLogin";
import Confirm from './components/Client/Confirm';
import NotFound from "./components/Client/NotFound";

import { BrowserRouter as Router, Switch, Route, Redirect, withRouter } from "react-router-dom";

import axios from "axios";

import './App.css';

const guestNavbar = {
  "Signup": "/signup",
  "Login": "/login"
}
const userNavbar = {
  "Studio": "/studio",
  "Settings": "/settings",
  "Logout": "/logout"
}

const RedirectToNotFound = () => {
  return (
    <Redirect to="/notFound" />
  );
}

class ProtectedRoute extends Component {
    _isMounted = true;
    state = { 
        authorized: false,
        loading: true,
        redirect: false
      };
    componentDidMount = () => {
      this._isMounted = true;
      if (this._isMounted)
        this.getAuth();
    }
    componentWillUnmount = () => {
      this._isMounted = false;
    }
    getAuth = async() => {
      const { path } = this.props;
      const res = await axios.get(`${path}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } }
      )
        this.setState({ loading: false });
        (!res.data.authorized) 
          ? this.setState({ redirect: true }) 
          : this.setState({ authorized: true });
    }

    render() {
      const { Component, path } = this.props;
      const { loading, redirect, authorized } = this.state;

      if (loading)
        return null;
      return <Route exact path={path} component={() => {
        
        return redirect ? <Redirect to="/login" /> : authorized ? <Component /> : null
      }}/>;
  }
}

class DefaultRoutes extends Component {
  state = { loggedIn: false }
  
  componentDidMount() {
    if (localStorage.getItem("access_token"))
        this.setState({ loggedIn: true })
      else
        this.setState({ loggedIn: false })
  }
  render() {
  return (
    <>
    {this.state.loggedIn === false 
        ? <NavBar {...guestNavbar}/>
        : <NavBar {...userNavbar}/>
      }
      <Switch>
        <Route path="/" exact component={Home} />
        
        <ProtectedRoute exact path="/studio" Component={Studio} />
        <ProtectedRoute exact path="/settings" Component={Settings} />
        
        <Route path="/login" exact component={withRouter(({ history }) => {
          // loginHandler();
          return <Login login={this.props.login} history={history}/>
        })} />

        <Route path="/logout" exact component={() => {
          this.props.logout();
          return <Redirect to="/" /> 
        }} />

        <Route path="/signup" exact component={withRouter(({ history }) => {
          return <Signup login={this.props.login} history={history}/>
        })}/>
        <Route path="/forgot" exact component={ForgotLogin}/>
        <Route path="/signup/confirm/:id" exact component={Confirm}/>
        <Route component={RedirectToNotFound} />
      </Switch>
    </>
  );
      }
}

class App extends Component {
  state = {
    loggedIn: false
  }
  login = () => { this.setState({ loggedIn: true }) }
  logout = () => { 
    localStorage.removeItem("access_token");
    this.setState({ loggedIn: false });
  }
  
  render() {
    return (   
      <Router>
        <Switch>
          <Route component={NotFound} path="/notFound" />
          <Route component={() => {
            return <DefaultRoutes login={this.login} logout={this.logout} />
          }}
          />
        </Switch>
      </Router>
    );
  }
}

export default App;
