import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3'
import Dropzone from 'react-dropzone'
import * as tone from 'tone'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null, duration: 7000, hasFile: false };

    this.handleClick = this.handleClick.bind(this);
    this.handleDuration = this.handleDuration.bind(this);
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (!acceptedFiles[0]) {
      alert("That file type is not yet supported. Please upload a CSV file.");
    } else {
      var csv = URL.createObjectURL(acceptedFiles[0]);
      this.loadGraph(csv);
      this.setState({ hasFile: true })
    }
  }

  loadGraph(csv) {
    var width = 600;
    var height = 300;
    var paddingLeft = 50;
    d3.csv(csv)
      .then((data) => {
        console.log(data);

        this.setState(state => ({
          data: data
        }));

        // 5. X scale will use the index of our data
        var xScale = d3.scaleLinear()
          .domain([0, data.length]) // input
          .range([paddingLeft, width]); // output

        // 6. Y scale will use the randomly generate number 
        var yScale = d3.scaleLinear()
          .domain([this.calculateMin(data), this.calculateMax(data)]) // input 
          .range([height, 0]); // output

        // 7. d3's line generator
        var line = d3.line()
          .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
          .y(function(d) { return yScale(d.Close); }) // set the y values for the line generator 
          .curve(d3.curveMonotoneX) // apply smoothing to the line
        
        d3.select("svg").remove();

        // 1. Add the SVG to the page and employ #2
        var svg = d3.select(".flex-container").append("svg")
          .attr("width", "50%")
          .attr("height", "300")
          .append("g")
          // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" +(paddingLeft-5) + ", 0)")
          .call(d3.axisLeft(yScale)) // Create an axis component with d3.axisLeft
        
        svg.append("rect")
          .attr("width", "2px")
          .attr("height", "100%")
          .attr("class", "playhead")
          .attr("fill", "red")
          .attr("transform", "translate(" +(paddingLeft) + ", 0)");

          svg.append("g")
          .attr("class", "x axis")
          .call(d3.axisBottom(xScale))
      
        // 9. Append the path, bind the data, and call the line generator 
        svg.append("path")
            .datum(data) // 10. Binds data to the line 
            .attr("class", "line") // Assign a class for styling 
            .attr("d", line)
            .style("stroke", "black")
            .style("fill", "none"); // 11. Calls the line generator 
    })
  }

  onCancel(acceptedFiles, rejectedFiles) {
    console.log('adadsdas');
  }

  componentDidMount() {
    
  }

  handleDuration(event) {
    this.setState({ duration: event.target.value })
  }

  handleClick() {
    let time = this.state.duration / this.state.data.length;
    console.log(this.state.data)

    let min = this.calculateMin(this.state.data);
    let max = this.calculateMax(this.state.data);
    let scalar = (7000 - 50) / (max-min);
    var noise;
    let index = 0;
    setInterval(() => {
      if(noise) noise.stop();
      index++;
      console.log(index);
      if (index >= this.state.data.length) { 
        clearInterval();
      } else {
        if(noise) noise.stop();
        noise = new tone.Oscillator((this.state.data[index].Close - min) * scalar, "sine").toMaster().start();
        d3.select(".playhead")
          .attr("transform", "translate(" + (50 + index) + ", 0)");
      }
    }, time);
  }
  
  calculateMax(data) {
    let max = -999999;
    for(let d of data) {
      if (max < d.Close) max = d.Close;
    }
    return max;
  }

  calculateMin(data) {
    let min = 999999;
    for(let d of data) {
      if (min > d.Close) min = d.Close;
    }
    return min;
  }

	render() {
    return (
      <div className="App">
        <h1>Sound Plot</h1>
        <h3>Data represented as sound waves.</h3>
        <div className="flex-container">
          <div className="drop-container">
            <Dropzone
              accept="text/csv"
              className="file-drop"
              onDrop={this.onDrop.bind(this)}
              onFileDialogCancel={this.onCancel.bind(this)}>
              <p>Drop a .csv file to upload.</p>
            </Dropzone>
            <br />
            { this.state.hasFile ? <div>
                Duration (milliseconds):
                <input type="number" value={this.state.duration} onChange={this.handleDuration} />
                <button onClick={this.handleClick}><img src="https://www.hsdinstitute.org/assets/images/design/masthead-triangle.png"/></button>
              </div> : null }

          </div>
        </div>
      </div>
    );
  }
}

export default App;
