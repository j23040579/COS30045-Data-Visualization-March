const svg = d3
  .select(".responsive-svg-containter")
  .append("svg")
  .attr("viewBox", "0 0 500 250")
  .style("border", "1px solid black");

d3.csv("data/brand_and_screen.csv", (d) => {
  return {
    Screen_Tech: d.Screen_Tech,
    Count: +d["Count(Model_No)"],
  };
}).then((data) => {
  data.sort((a, b) => b.Count - a.Count);
  console.log(data);
  console.log(data.length);
  console.log(d3.extent(data, (d) => d.Count));

  // range [0, 400] so bars don't overflow past the 100px label margin inside 500px viewBox
  const xScale = d3.scaleLinear().domain([0, 1310]).range([0, 150]);

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.Screen_Tech))
    .range([20, 230])
    .paddingInner(0.1);

  CreateBarChart(data, xScale, yScale);
});

const CreateBarChart = (data, xScale, yScale) => {
  // Group each bar and its labels together so they move as one unit
  const barAndLabel = svg
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(0, ${yScale(d.Screen_Tech)})`);

  // Bar — starts at x:100 to leave room for the category label on the left
  barAndLabel
    .append("rect")
    .attr("x", 100)
    .attr("y", 0)
    .attr("width", (d) => xScale(d.Count))
    .attr("height", yScale.bandwidth())
    .attr("fill", "#edf7bd");

  // Category label — text-anchor "end" at x:90 pushes text LEFT of the bar
  barAndLabel
    .append("text")
    .text((d) => d.Screen_Tech)
    .attr("x", 90)
    .attr("y", yScale.bandwidth() / 2)
    .attr("dy", "0.35em") // vertically centers text within bandwidth
    .attr("text-anchor", "end")
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .attr("fill", "white");

  // Count label — sits just to the right of the bar's end
  barAndLabel
    .append("text")
    .text((d) => d.Count)
    .attr("x", (d) => 100 + xScale(d.Count) + 4)
    .attr("y", yScale.bandwidth() / 2)
    .attr("dy", "0.35em") // vertically centers text within bandwidth
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .attr("fill", "white");
};
