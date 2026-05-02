const svg = d3
  .select(".responsive-svg-containter")
  .append("svg")
  .attr("viewBox", "0 0 500 250")
  .style("border", "1px solid black");

// svg
//   .append("rect")
//   .attr("x", 10)
//   .attr("y", 10)
//   .attr("width", 414)
//   .attr("height", 16)
//   .attr("fill", "blue");

d3.csv("data/brand_and_screen.csv", (d) => {
  return {
    Screen_Tech: d.Screen_Tech,
    Count: +d["Count(Model_No)"],
  };
}).then((data) => {
  (data.sort((a, b) => b.Count - a.Count),
    console.log(data),
    console.log(data.length),
    console.log(d3.extent(data, (d) => d.Count)));
  const xScale = d3.scaleLinear().domain([0, 1310]).range([0, 150]);
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.Screen_Tech))
    .range([20, 200])
    .paddingInner(0.1);

  CreateBarChart(data, xScale, yScale);
});

const CreateBarChart = (data, xScale, yScale) => {
  const barheight = 20;
  const barAndLabel = svg
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(0,${yScale(d.Screen_Tech)})`);

  barAndLabel
    .append("rect")
    .attr("x", 100)
    .attr("y", 0)
    .attr("width", (d) => xScale(d.Count))
    .attr("height", yScale.bandwidth())
    .attr("fill", "blue");

  //Creating text labels
  barAndLabel
    .append("text")
    .text((d) => d.Screen_Tech)
    .attr("x", 90) // creating bar at x position
    .attr("y", yScale.bandwidth() / 2)

    .attr("text-anchor", "end")
    .style("font-family", "sans-serif")
    .style("font-size", "13px");
  //Adding category text
  barAndLabel
    .append("text")
    .text((d) => d.Count)
    .attr("x", (d) => 100 + xScale(d.Count) + 4)
    .attr("y", yScale.bandwidth() / 2)
    .style("font-familt", "sans-serif")
    .style("font-size", "13px");

  // svg
  //   .selectAll("rect")
  //   .data(data)
  //   .join("rect")
  //   .attr("class", (d) => {
  //     console.log(d);
  //     return `bar bar-${d.Count}`;
  //   })
  //   .attr("width", (d) => {
  //     return xScale(d.Count);
  //   })
  //   .attr("height", yScale.bandwidth())
  //   .attr("x", 10)
  //   .attr("y", (d) => yScale(d.Screen_Tech))
  //   .attr("fill", "blue");
};
