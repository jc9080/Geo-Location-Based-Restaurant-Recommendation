import React, {Component} from 'react';
import {
  Typography,
  AppBar,
  Toolbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  ListItemText,
  List,
  ListItem,
  Button,
  TextField
} from '@material-ui/core';
import FaceIcon from '@material-ui/icons/Face';
import SearchIcon from '@material-ui/icons/Search';

class Friends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.uid,
      confirmedOpen: false,
      searchOpen: false,
      alertOpen: false,
      alertString:"",
      searchUsername: "",
      flag: false
    }
  }

  handleFriendClick = (uid) => {
    for (var i = 0; i < this.state.friendsIn.length; i++) {
      if (!this.state.friendsIn[i].confirmed == 1 && this.state.friendsIn[i].uid == uid) {
        console.log(this.state.friendsIn[i]);
        this.setState({confirmUid: uid});
        this.setState({confirmedOpen: true});
      }
    }
  }

  handleConfirmedClickClose = () => {
    this.setState({confirmedOpen: false});
  };

  handleConfirm = () => {
    var url = 'http://localhost:3000/querys/confirmfriend'
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
    }).then(function(nothing) {
      window.location.reload();
    });
  }

  handleSearchClickOpen = () => {
    this.setState({searchOpen: true});
  };

  handleSearchClickClose = () => {
    this.setState({searchOpen: false});
  };

  handleSearchChange = event => {
    this.setState({
      searchUsername: event.target.value
    });
    console.log(this.state);
  }

  handleAlertClickClose = () => {
    this.setState({alertOpen: false});
    if (this.state.flag) {
      window.location.reload();
    }
  };

  handleSearch = event => {
    var that = this
    var url = 'http://localhost:3000/querys/sendfriendrequest'
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
      } else if (response.status === 201) {
        console.log("username not found");
        that.setState({alertString: "Username not found"});
        that.setState({alertOpen: true});
      } else if (response.status === 202) {
        console.log("Cannot friend yourself");
        that.setState({alertString: "Cannot friend yourself"});
        that.setState({alertOpen: true});
      } else if (response.status === 203) {
        console.log("Cannot send duplicated requests");
        that.setState({alertString: "Cannot send duplicated requests"});
        that.setState({alertOpen: true});
      }
    }).then(function(data) {
      if (data){
        console.log("Friend request sent");
        that.setState({alertString: "Friend request sent"});
        that.setState({alertOpen: true});
        that.setState({flag: true});
      }
    });
  }

  componentDidMount() {
    var that = this;
    var url = 'http://localhost:3000/querys/getfriendsout'
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
    }).then(function(friendsOut) {
      that.setState({friendsOut});
    });

    url = 'http://localhost:3000/querys/getfriendsin'
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
    }).then(function(friendsIn) {
      that.setState({friendsIn});
    });
  }

  render() {
    const ListFriendsOut = this.state.friendsOut && this.state.friendsOut.map((friend, index) => (<ListItem key={friend.uid} button="button">
      <Avatar>
        <FaceIcon/>
      </Avatar>
      <ListItemText primary={friend.username} secondary={friend.confirmed > 0
          ? 'Confirmed'
          : 'Waiting for confirmation'}/>
    </ListItem>));

    const ListFriendsIn = this.state.friendsIn && this.state.friendsIn.map((friend, index) => (<ListItem key={friend.uid} button="button" onClick={() => this.handleFriendClick(friend.uid)}>
      <Avatar>
        <FaceIcon/>
      </Avatar>
      <ListItemText primary={friend.username} secondary={friend.confirmed > 0
          ? 'Confirmed'
          : 'Unconfirmed'}/>
    </ListItem>));

    return (<div className="App">
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" align="left" style={{
              flex: 1
            }}>
            Friends
          </Typography>
          <Button color="inherit" onClick={this.handleSearchClickOpen}><SearchIcon/></Button>
        </Toolbar>
      </AppBar>
      <List style={{
          paddingTop: 100,
          paddingBottom: '100px'
        }}>
        {ListFriendsOut}
        {ListFriendsIn}
      </List>

      <Dialog open={this.state.confirmedOpen} onClose={this.handleConfirmedClickClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="noteAlert">{"Alert"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="noteAlertText">
            Send confirmation?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleConfirm} color="primary">
            Yes
          </Button>
          <Button onClick={this.handleConfirmedClickClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={this.state.searchOpen} onClose={this.handleSearchClickClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="noteAlert">{"Send friend request"}</DialogTitle>
        <DialogContent>
          <TextField id="username" label="Username" value={this.state.searchUsername} onChange={this.handleSearchChange} fullWidth="fullWidth" margin="normal"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleSearch} color="primary">
            Yes
          </Button>
          <Button onClick={this.handleSearchClickClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={this.state.alertOpen} onClose={this.handleAlertClickClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle>{"Alert"}</DialogTitle>
        <DialogContent>
          {this.state.alertString}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleAlertClickClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </div>);
  }
}

export default Friends;
