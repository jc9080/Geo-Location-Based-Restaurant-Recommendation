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

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      toMain: false,
      open: false,
      dialogString: ""
    };
  }

  handleClickOpen = (str) => {
    this.setState({ open: true });
    this.setState({ dialogString: str});
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
    console.log(this.state.username, this.state.password);
  }

  handleSubmit = event => {
    event.preventDefault();
    var that = this;
    var url = 'http://localhost:3000/querys/login';
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
        console.log('Invalid username or password');
        that.handleClickOpen('Invalid username or password');
      } else if (response.status === 202) {
        console.log('Username do not exist');
        that.handleClickOpen('Username do not exist');
      } else if (response.status === 200) {
        return response.json()
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
        <br/>
        <Button variant="contained" color="primary" disabled={!this.validateForm()} type="submit">
          Login
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

      <Button variant="contained" color="secondary" href="/registration">
        Sign up
      </Button>
    </div>);
  }
}

export default Login;
