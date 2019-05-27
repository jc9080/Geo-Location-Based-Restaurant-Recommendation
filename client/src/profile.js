import React, {Component} from 'react';
import {
  TextField,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.user[0].username,
      email: this.props.user[0].email,
      city: this.props.user[0].city,
      state: this.props.user[0].state,
      open: false
    }
  }

  componentDidMount() {}

  handleProfileClickOpen = () => {
    this.setState({open: true});
  };

  handleProfileClickClose = () => {
    this.setState({open: false});
  };

  handleProfileSubmit = event => {
    var url = 'http://localhost:3000/querys/updateuser'
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
      } else {
        return response.json();
      }
    }).then(function(data) {
      if (data) {}
    });
    this.handleProfileClickOpen();
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
    console.log(this.state);
  }

  render() {
    return (<div className="App">
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" align="left" style={{
              flex: 1
            }}>
            Profile
          </Typography>
          <Button color="inherit" onClick={this.handleProfileSubmit}><DoneIcon/></Button>
        </Toolbar>
      </AppBar>

      <div style={{
          marginLeft: 200,
          marginRight: 200,
          paddingTop: 100
        }}>
        <Typography variant="h6" gutterBottom="gutterBottom">
          Username: {this.state.username}
        </Typography>
        <Typography variant="h6" gutterBottom="gutterBottom">
          Email: {this.state.email}
        </Typography>
        <Typography variant="h6" gutterBottom="gutterBottom">
          City: {this.state.city}
        </Typography>
        <TextField id="state" label="State" value={this.state.state} onChange={this.handleChange} fullWidth="fullWidth" margin="normal" variant="outlined"/>
      </div>

      <Dialog open={this.state.open} onClose={this.handleProfileClickClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="noteAlert">{"Alert"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="noteAlertText">
            New note has been submitted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleProfileClickClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
    </div>);
  }
}

export default Profile;
