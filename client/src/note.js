import React, {Component} from 'react';
import {TextField, AppBar, Toolbar, Typography, List, ListItem, Avatar, ListItemText, Button,  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,} from '@material-ui/core';
import axios from 'axios';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import AddIcon from '@material-ui/icons/Add';

class note extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nid: 0,
      commentOpen: false,
      comment:"",
      uid: this.props.location.state.uid
    }
  }

  handleCommentOpen = () => {
    this.setState({commentOpen: true});
  };

  handleCommentClose = () => {
    this.setState({commentOpen: false});
  };

  handleCommentChange = event => {
    this.setState({
      comment: event.target.value
    });
    console.log(this.state);
  }

  handleCommentSubmit =() => {
    var url = 'http://localhost:3000/querys/addcomment'
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

  componentDidMount() {
    this.setState({nid:this.props.match.params.nid});
    var that = this
    var url = 'http://localhost:3000/querys/notes/'+this.props.match.params.nid;
    axios.get(url).then(response => {
      var result = response.data[0]
      console.log(result);
      this.setState({
        username: result.username,
        ntext: result.ntext,
        lname: result.lname,
        startdate: result.startdate,
        enddate: result.enddate,
      })

      var url = 'http://localhost:3000/querys/getcomments'
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
      }).then(function(comments) {
        that.setState({comments});
        console.log(that.state);
      });
    })


  };

  render() {
    const ListComments = this.state.comments && this.state.comments.map((comment, index) => (<ListItem key={comment.cid}>
      <Avatar>
        <ChatBubbleIcon/>
      </Avatar>
      <ListItemText primary={comment.ctext} secondary={comment.username}/>
    </ListItem>));

    return (<div className="App">
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" align="left" style={{
              flex: 1
            }}>
            Note
          </Typography>
          <Button color="inherit" onClick={this.handleCommentOpen}><AddIcon/></Button>
        </Toolbar>
      </AppBar>
<div style={{marginTop:100}}>
      <Typography variant="h6" gutterBottom="gutterBottom">
        Username: {this.state.username}
      </Typography>
      <Typography variant="h6" gutterBottom="gutterBottom">
        Note Text: {this.state.ntext}
      </Typography>
      <Typography variant="h6" gutterBottom="gutterBottom">
        Location: {this.state.lname}
      </Typography>
      <Typography variant="h6" gutterBottom="gutterBottom">
        Start time: {this.state.startdate}
      </Typography>
      <Typography variant="h6" gutterBottom="gutterBottom">
        End time: {this.state.enddate}
      </Typography>
</div>
      <List style={{
          paddingBottom: '100px'
        }}>
        {ListComments}
      </List>

      <Dialog open={this.state.commentOpen} onClose={this.handleCommentClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="comment">{"Comment"}</DialogTitle>
        <DialogContent>
          <TextField id="comment" label="Comment below" value={this.state.comment} onChange={this.handleCommentChange} fullWidth="fullWidth" margin="normal"/>


        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCommentSubmit} color="primary">
            Apply
          </Button>
          <Button onClick={this.handleCommentClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </div>);
  }
}

export default note;
