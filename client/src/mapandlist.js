import React, {Component} from 'react';
import GoogleMapReact from 'google-map-react';
import {
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  AppBar,
  Toolbar,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField
} from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import FilterListIcon from '@material-ui/icons/FilterList';
import {withRouter} from "react-router-dom";
import SearchIcon from '@material-ui/icons/Search';


class MapAndList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      center: {
        lat: 40.7233,
        lng: -74.0030
      },
      zoom: 14,
      filterOpen: false,
      searchOpen: false,
      filterStartTime: "7",
      filterEndTime: "8",
      uid: this.props.uid,
      fradius: 0
    }
  }

  handleChange = name => event => {
    this.setState({[name]: event.target.value});
    console.log(this.state);
  };

  handleClick = (nid) => {
    this.props.history.push({
      pathname: "/notes/" + nid,
      state: {
        uid: this.state.uid,
        searchKeywords: ""
      }
    });
  };

  handleFilterOpen = () => {
    this.setState({filterOpen: true});
  };

  handleFilterClose = () => {
    this.setState({filterOpen: false});
  };

  handleSearchOpen = () => {
    this.setState({searchOpen: true});
  };

  handleSearchClose = () => {
    this.setState({searchOpen: false});
  };

  handleFilterSubmit = () => {
    var url = 'http://localhost:3000/querys/updatefilter'
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
    }).then(function(filter) {
      window.location.reload();
    });
  };

  componentDidMount() {
    var that = this;

    var url = 'http://localhost:3000/querys/getfilter'
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
    }).then(function(filter) {
      that.setState({fradius: filter[0].fradius});
      var startDate = new Date(filter[0].fstarttime);
      that.setState({filterStartTime: startDate.getHours()-5})
      var endDate = new Date(filter[0].fendtime);
      that.setState({filterEndTime: endDate.getHours()-5})
    });

  }

  render() {

    const MapNotes = this.props.data && this.props.data.map((note, index) => (<Chip lat={note.latitude} lng={note.longitude} label={note.ntext} key={note.nid}/>));

    const ListNotes = this.props.data && this.props.data.map((note, index) => (<ListItem key={note.nid} button="button" onClick={() => this.handleClick(note.nid)}>
      <Avatar>
        <ImageIcon/>
      </Avatar>
      <ListItemText primary={note.ntext} secondary={note.lname}/>
    </ListItem>));

    return (<div className="App" style={{
        height: '70vh',
        width: '100%'
      }}>

      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" color="inherit" align="left" style={{
              flex: 1
            }}>
            Oingo
          </Typography>
          <Button color="inherit" onClick={this.handleFilterOpen}><FilterListIcon/></Button>
          <Button color="inherit" onClick={this.handleSearchOpen}><SearchIcon/></Button>
        </Toolbar>
      </AppBar>

      <GoogleMapReact bootstrapURLKeys={{
          key: "AIzaSyAUAaYODAySdg0ICAX4u9ganJ7gQGFz834",
          language: "en"
        }} defaultCenter={this.state.center} defaultZoom={this.state.zoom}>
        {MapNotes}
      </GoogleMapReact>
      <List style={{
          paddingBottom: '100px'
        }}>
        {ListNotes}
      </List>

      <Dialog open={this.state.filterOpen} onClose={this.handleFilterClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="filterAlert">{"Filter"}</DialogTitle>
        <DialogContent>

          <TextField id="filterStartTime" label="Start Time" value={this.state.filterStartTime} type="number" onChange={this.handleChange('filterStartTime')} margin="normal" variant="outlined" helperText="24-hour" InputProps={{
              inputProps: {
                min: 0,
                max: 24
              }
            }} style={{
              marginLeft: 30,
              marginRight: 30
            }}/>
          <TextField id="filterEndTime" label="End Time" value={this.state.filterEndTime} type="number" onChange={this.handleChange('filterEndTime')} margin="normal" variant="outlined" InputProps={{
              inputProps: {
                min: 0,
                max: 24
              }
            }} style={{
              marginLeft: 30,
              marginRight: 30
            }}/>
          <TextField id="fradius" label="Radius" value={this.state.fradius} type="number" onChange={this.handleChange('fradius')} margin="normal" variant="outlined" helperText="Miles" nputProps={{
              inputProps: {
                min: 0,
                max: 10
              }
            }} style={{
              marginLeft: 30,
              marginRight: 30
            }}/>

        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleFilterSubmit} color="primary">
            Apply
          </Button>
          <Button onClick={this.handleFilterClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={this.state.searchOpen} onClose={this.handleSearchClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="searchAlert">{"Search"}</DialogTitle>
        <DialogContent>
          <TextField id="search" label="Keywords" value={this.state.searchKeywords} onChange={this.handleChange('searchKeywords')} fullWidth="fullWidth" margin="normal"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleSearchApply} color="primary">
            Apply
          </Button>
          <Button onClick={this.handleSearchClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </div>);
  }
}

export default withRouter(MapAndList);
