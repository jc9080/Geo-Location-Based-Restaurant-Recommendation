import React, {Component} from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Fab,
  TextField
} from '@material-ui/core';
import MapIcon from '@material-ui/icons/Map';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import BugReportIcon from '@material-ui/icons/BugReport';

import MapAndList from './mapandlist.js';
import Post from './post.js';
import Friends from './friends.js';
import Profile from './profile.js';
import axios from 'axios';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      uid: this.props.location.state.uid,
      cheatOpen: false
    }
  };

  handleCheatOpen = () => {
    this.setState({cheatOpen: true});
  };

  handleCheatClose = () => {
    this.setState({cheatOpen: false});
  };

  handleCheatApply = () => {
    var that = this;
    navigator.geolocation.getCurrentPosition(event => {
      var crd = event.coords;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.state.lat},${this.state.lng}&radius=500&key=AIzaSyAUAaYODAySdg0ICAX4u9ganJ7gQGFz834`
      axios.get(url).then(response => this.setState({lname: response.data.results[0].name}))
      console.log(this.state);
    });
    var url = 'http://localhost:3000/querys/notesbyfilter'
    var formBody = [];
    for (var property in this.state) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(this.state[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    }).then(function(response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      } else if (response.status === 200) {
        return response.json()
      }
    }).then(function(data) {
      that.setState({data});
    });

    url = 'http://localhost:3000/querys/getuser'
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    }).then(function(response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      } else if (response.status === 200) {
        return response.json()
      }
    }).then(function(user) {
      that.setState({user});
    });

  };

  componentDidMount() {
    var that = this;
    navigator.geolocation.getCurrentPosition(event => {
      var crd = event.coords;
      this.setState({lat: crd.latitude, lng: crd.longitude})
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.state.lat},${this.state.lng}&radius=500&key=AIzaSyAUAaYODAySdg0ICAX4u9ganJ7gQGFz834`
      axios.get(url).then(response => this.setState({lname: response.data.results[0].name}))
      console.log(this.state);
    });
    var url = 'http://localhost:3000/querys/notesbyfilter'
    var formBody = [];
    for (var property in this.state) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(this.state[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    }).then(function(response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      } else if (response.status === 200) {
        return response.json()
      }
    }).then(function(data) {
      that.setState({data});
    });

    url = 'http://localhost:3000/querys/getuser'
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    }).then(function(response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      } else if (response.status === 200) {
        return response.json()
      }
    }).then(function(user) {
      that.setState({user});
    });

  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleValueChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    return (<div className="App">
      {this.state.value === 0 && <MapAndList uid={this.state.uid} data={this.state.data}/>}
      {this.state.value === 1 && <Post uid={this.state.uid} lat={this.state.lat} lng={this.state.lng} lname={this.state.lname}/>}
      {this.state.value === 2 && <Friends uid={this.state.uid}/>}
      {this.state.value === 3 && <Profile user={this.state.user}/>}
      <Fab color="primary" aria-label="Add" onClick={this.handleCheatOpen} style={{
          margin: 0,
          top: 'auto',
          right: 20,
          bottom: 80,
          left: 'auto',
          position: 'fixed'
        }}>
        <BugReportIcon/>
      </Fab>

      <BottomNavigation id="value" value={this.state.value} onChange={this.handleValueChange} style={{
          width: '100%',
          position: 'fixed',
          bottom: 0
        }}>
        <BottomNavigationAction label="Map" icon={<MapIcon />}/>
        <BottomNavigationAction label="Post" icon={<AddCircleIcon />}/>
        <BottomNavigationAction label="Friends" icon={<SupervisedUserCircleIcon />}/>
        <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />}/>
      </BottomNavigation>

      <Dialog open={this.state.cheatOpen} onClose={this.handleCheatClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="Cheat">{"Cheat"}</DialogTitle>
        <DialogContent>
          <TextField id="uid" label="uid" value={this.state.uid} onChange={this.handleChange} fullWidth="fullWidth" margin="normal"/>
          <TextField id="lat" label="lat" value={this.state.lat} onChange={this.handleChange} fullWidth="fullWidth" margin="normal"/>
          <TextField id="lng" label="lng" value={this.state.lng} onChange={this.handleChange} fullWidth="fullWidth" margin="normal"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCheatApply} color="primary">
            Apply
          </Button>
          <Button onClick={this.handleCheatClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>);
  }
}

export default Main;
