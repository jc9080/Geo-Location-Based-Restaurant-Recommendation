import React, {Component} from 'react';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  AppBar,
  Toolbar
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: "7",
      endTime: "8",
      ntext: "",
      tags: "",
      open: false,
      privacy: "3",
      lat: this.props.lat,
      lng: this.props.lng,
      lname: this.props.lname,
      uid: this.props.uid
    }
  }

  handleChange = name => event => {
    this.setState({[name]: event.target.value});
    console.log(this.state);
  };

  validateNoteForm() {
    return this.state.ntext.length > 0 && this.state.tags.length > 0;
  }

  handleNoteClickOpen = () => {
    this.setState({open: true});
  };

  handleNoteClose = () => {
    this.setState({open: false});
  };

  componentDidMount() {
    var that = this;

    var url = 'http://localhost:3000/querys/addlocation'
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
      if (data) {
        that.setState({lid: data.lid})
      }
    });
  }

  handleNoteSubmit = event => {
    var url = 'http://localhost:3000/querys/newpost'
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
    this.handleNoteClickOpen();
  }

  render() {
    return (<div className="App">
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" align="left" style={{
              flex: 1
            }}>
            Post new note
          </Typography>
          <Button color="inherit" disabled={!this.validateNoteForm()} onClick={this.handleNoteSubmit}><DoneIcon/></Button>
        </Toolbar>
      </AppBar>

      <form id="noteForm" autoComplete="off" style={{
          marginLeft: 50,
          marginRight: 50,
          marginTop: 100
        }}>
        <Typography variant="h6" gutterBottom="gutterBottom">
          Current location: {this.state.lname}
        </Typography>
        <TextField id="ntext" label="Note" required="required" multiline="multiline" rowsMax="4" value={this.state.ntext} onChange={this.handleChange('ntext')} fullWidth="fullWidth" margin="normal" variant="outlined"/>
        <TextField id="tags" label="Tags" required="required" value={this.state.tags} onChange={this.handleChange('tags')} fullWidth="fullWidth" margin="normal" variant="outlined" helperText="Splite tags by space"/>
        <br/>
        <br/>
        <RadioGroup row="row" value={this.state.privacy} onChange={this.handleChange('privacy')}>
          <FormControlLabel value="3" control={<Radio />} label="Public"/>
          <FormControlLabel value="2" control={<Radio />} label="Friends Only"/>
          <FormControlLabel value="1" control={<Radio />} label="Me Only"/>
        </RadioGroup>
        <TextField id="startTime" label="Start Time" value={this.state.startTime} type="number" onChange={this.handleChange('startTime')} margin="normal" variant="outlined" InputProps={{
            inputProps: {
              min: 0,
              max: 24
            }
          }} helperText="24-hour" style={{
            marginLeft: 50,
            marginRight: 50
          }}/>
        <TextField id="endTime" label="End Time" value={this.state.endTime} type="number" onChange={this.handleChange('endTime')} margin="normal" variant="outlined" InputProps={{
            inputProps: {
              min: 0,
              max: 24
            }
          }} style={{
            marginLeft: 50,
            marginRight: 50
          }}/>

      </form>

      <Dialog open={this.state.open} onClose={this.handleNoteClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="noteAlert">{"Alert"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="noteAlertText">
            New note has been submitted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleNoteClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>);
  }
}

export default Post;
