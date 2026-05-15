function renderBarChart(selector) {
  d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv").then((data) => {
    // ── Convert numeric columns ────────────────────────────────────────────
    const VALUE_KEY = "Mean(Labelled energy consumption (kWh/year))";

    data.forEach((d) => {
      d[VALUE_KEY] = +d[VALUE_KEY];
    });

    // ── Container ──────────────────────────────────────────────────────────
    const container = d3.select(selector);
    container.selectAll("*").remove();

    // ── Dimensions ─────────────────────────────────────────────────────────
    const margin = {
      top: 60,
      right: 40,
      bottom: 110,
      left: 90,
    };

    const totalWidth = container.node().getBoundingClientRect().width || 600;

    const width = totalWidth - margin.left - margin.right;
    const height = Math.min(420, width * 0.65);

    // ── SVG ────────────────────────────────────────────────────────────────
    const svg = container
      .append("svg")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right}
              ${height + margin.top + margin.bottom}`,
      )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "700px")
      .attr("class", "chart-svg bar-svg");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── Colour Scale ───────────────────────────────────────────────────────
    const techs = [...new Set(data.map((d) => d.Screen_Tech))].sort();

    const colorScale = d3
      .scaleOrdinal()
      .domain(techs)
      .range(["#edf7bd", "#4361EE", "#FFB703"]);

    // ── Scales ─────────────────────────────────────────────────────────────
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.Screen_Tech))
      .range([0, width])
      .padding(0.38);

    const yMax = d3.max(data, (d) => d[VALUE_KEY]);

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.15])
      .range([height, 0])
      .nice();

    // ── Grid Lines ─────────────────────────────────────────────────────────
    g.append("g")
      .attr("class", "grid grid-y")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat("").ticks(5));

    // ── Axes ───────────────────────────────────────────────────────────────
    g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((ax) => ax.select(".domain").remove());

    g.append("g")
      .attr("class", "axis axis-y")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => `${d} kWh`),
      );

    // ── Axis Labels ────────────────────────────────────────────────────────
    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -72)
      .attr("text-anchor", "middle")
      .text("Avg Energy Consumption (kWh/year)");

    g.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + 55)
      .attr("text-anchor", "middle")
      .text("Screen Technology");

    // ── Title ──────────────────────────────────────────────────────────────
    svg
      .append("text")
      .attr("class", "chart-title")
      .style("font-size", "22px")
      .attr("x", margin.left + width / 2)
      .attr("y", 28)
      .attr("text-anchor", "middle");

    // ── Tooltip ────────────────────────────────────────────────────────────
    const tooltip = d3
      .select("body")
      .selectAll(".bar-tooltip")
      .data([null])
      .join("div")
      .attr("class", "chart-tooltip bar-tooltip");

    // ── Bars ───────────────────────────────────────────────────────────────
    const bars = g
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.Screen_Tech))
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", (d) => colorScale(d.Screen_Tech))
      .attr("rx", 5)
      .attr("ry", 5);

    // ── Hover Effects ──────────────────────────────────────────────────────
    bars
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(140)
          .attr("fill", d3.color(colorScale(d.Screen_Tech)).brighter(0.35));

        tooltip.style("display", "block").html(`
            <span class="tt-label">${d.Screen_Tech}</span>
            <div class="tt-row">
              <span>Avg Energy</span>
              <strong>${d[VALUE_KEY].toFixed(2)} kWh/yr</strong>
            </div>
            <div class="tt-row">
              <span>Screen Size</span>
              <strong>55"</strong>
            </div>
          `);
      })

      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 14 + "px")
          .style("top", event.pageY - 36 + "px");
      })

      .on("mouseleave", function (event, d) {
        d3.select(this)
          .transition()
          .duration(140)
          .attr("fill", colorScale(d.Screen_Tech));

        tooltip.style("display", "none");
      });

    // ── Animation ──────────────────────────────────────────────────────────
    bars
      .transition()
      .duration(750)
      .delay((d, i) => i * 120)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => yScale(d[VALUE_KEY]))
      .attr("height", (d) => height - yScale(d[VALUE_KEY]));

    // ── Value Labels ───────────────────────────────────────────────────────
    g.selectAll(".bar-value")
      .data(data)
      .join("text")
      .attr("class", "bar-value")
      .attr("x", (d) => xScale(d.Screen_Tech) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d[VALUE_KEY]) - 8)
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .text((d) => d[VALUE_KEY].toFixed(1))
      .transition()
      .delay((d, i) => 750 + i * 120)
      .duration(300)
      .style("opacity", 1);
  });
}

// ── Render Chart ─────────────────────────────────────────────────────────
renderBarChart("#chart3-bar");
