import React, {Component} from 'react';
import logo from './logo.png';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import {Redirect} from 'react-router'

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: "",
      state: "",
      city: "",
      lat:0,
      lng:0,
      open: false,
      dialogString: "",
      toMain: false
    };
  }

  handleClickOpen = (str) => {
    this.setState({open: true});
    this.setState({dialogString: str});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0 && this.state.email.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    console.log(this.state);
    var that = this;
    var url = 'http://localhost:3000/querys/signup';
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
      } else if (response.status === 201) {
        console.log('Username or email exist!');
        that.handleClickOpen('Username or email exist!');
      } else {
        return response.json();
      }
    }).then(function(data){
      if (data) {
        that.setState({uid: data.uid})
        console.log(that.state.uid);
        that.setState(() => ({toMain: true}));
      }
    });
  }

  render() {
    if (this.state.toMain === true) {
      return (<Redirect to={{
          pathname: "/main",
          state: {
            uid: this.state.uid
          }
        }}/>);
    }

    return (<div className="App">
      <img src={logo} className="App-logo" alt="logo"/>
      <form autoComplete="off" onSubmit={this.handleSubmit}>
        <TextField required="required" id="username" label="Username" margin="normal" variant="outlined" value={this.state.username} onChange={this.handleChange}/>
        <br/>
        <TextField required="required" id="password" label="Password" type="password" margin="normal" variant="outlined" value={this.state.password} onChange={this.handleChange}/>
        <br/>
        <TextField required="required" id="email" label="Email" type="email" margin="normal" variant="outlined" value={this.state.email} onChange={this.handleChange}/>
        <br/>
        <TextField id="state" label="State" margin="normal" variant="outlined" value={this.state.state} onChange={this.handleChange}/>
        <br/>
        <TextField id="city" label="City" margin="normal" variant="outlined" value={this.state.city} onChange={this.handleChange}/>
        <br/>
        <br/>
        <br/>
        <Button variant="contained" color="primary" disabled={!this.validateForm()} type="submit">
          Sign up
        </Button>
        <br/>
        <br/>
      </form>

      <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Alert"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {this.state.dialogString}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Button variant="contained" color="secondary" href="/">
        Back
      </Button>
    </div>);
  }
}

export default Registration;
