const svg = d3
  .select(".responsive-svg-containter")
  .append("svg")
  .attr("viewBox", "0 0 1200 1600")
  .style("border", "1px solid black");

svg
  .append("rect")
  .attr("x", 10)
  .attr("y", 10)
  .attr("width", 414)
  .attr("height", 16)
  .attr("fill", "blue");

d3.csv("data/brand_and_screen.csv", (d) => {
  return {
    Screen_Tech: d.Screen_Tech,
    Count: +d["Count(Model_No)"],
  };
}).then((data) => {
  (data.sort((a, b) => b.Count - a.Count),
    console.log(data),
    console.log(data.length),
    console.log(d3.extent(data, (d) => d.count)));
  CreateBarChart(data);
});

const CreateBarChart = (data) => {};
