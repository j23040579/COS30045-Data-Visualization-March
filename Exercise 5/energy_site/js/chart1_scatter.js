function renderScatterPlot(selector) {
  d3.csv("data/Ex5_TV_energy.csv").then((data) => {
    // ── Convert numeric columns ────────────────────────────────────────────
    data.forEach((d) => {
      d.star2 = +d.star2;
      d.energy_consumpt = +d.energy_consumpt;
      d.screensize = +d.screensize;
    });

    // ── Container ──────────────────────────────────────────────────────────
    const container = d3.select(selector);
    container.selectAll("*").remove();

    // ── Dimensions ─────────────────────────────────────────────────────────
    const margin = {
      top: 60,
      right: 40,
      bottom: 110,
      left: 75,
    };

    const totalWidth = container.node().getBoundingClientRect().width || 800;

    const width = totalWidth - margin.left - margin.right;
    const height = 620;

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
      .attr("class", "chart-svg scatter-svg");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── Colour Scale ───────────────────────────────────────────────────────
    const techs = [...new Set(data.map((d) => d.screen_tech))].sort();

    const colorScale = d3
      .scaleOrdinal()
      .domain(techs)
      .range(["#edf7bd", "#4361EE", "#FFB703"]);

    // ── Scales ─────────────────────────────────────────────────────────────
    const xExtent = d3.extent(data, (d) => d.star2);
    const yExtent = d3.extent(data, (d) => d.energy_consumpt);

    const xScale = d3
      .scaleLinear()
      .domain([Math.floor(xExtent[0] * 2) / 2, Math.ceil(xExtent[1] * 2) / 2])
      .range([0, width])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, yExtent[1] * 1.05])
      .range([height, 0])
      .nice();

    // ── Radius Scale ───────────────────────────────────────────────────────
    const rScale = d3
      .scaleSqrt()
      .domain(d3.extent(data, (d) => d.screensize))
      .range([4, 13]);

    // ── Grid Lines ─────────────────────────────────────────────────────────
    g.append("g")
      .attr("class", "grid grid-y")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

    g.append("g")
      .attr("class", "grid grid-x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));

    // ── Axes ───────────────────────────────────────────────────────────────
    g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(6)
          .tickFormat((d) => `${d}★`),
      );

    g.append("g")
      .attr("class", "axis axis-y")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickFormat((d) => `${d} kWh`),
      );

    // ── Axis Labels ────────────────────────────────────────────────────────
    g.append("text")
      .attr("class", "axis-label")
      .style("font-size", "16px")
      .attr("x", width / 2)
      .attr("y", height + 55)
      .attr("text-anchor", "middle")
      .text("Star Rating");

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -70)
      .attr("text-anchor", "middle")
      .text("Energy Consumption (kWh/year)");

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
      .selectAll(".scatter-tooltip")
      .data([null])
      .join("div")
      .attr("class", "chart-tooltip scatter-tooltip");

    // ── Dots ───────────────────────────────────────────────────────────────
    const dots = g
      .selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.star2))
      .attr("cy", (d) => yScale(d.energy_consumpt))
      .attr("r", 8)
      .attr("fill", (d) => colorScale(d.screen_tech))
      .attr("stroke", (d) => d3.color(colorScale(d.screen_tech)).darker(0.7))
      .attr("stroke-width", 1.2)
      .attr("opacity", 1);

    // ── Hover Effects ──────────────────────────────────────────────────────
    dots
      .on("mouseover", function (event, d) {
        d3.select(this)
          .raise()
          .transition()
          .duration(150)
          .attr("r", 8)
          .attr("opacity", 1);

        tooltip.style("display", "block").html(`
            <span class="tt-label">
              ${d.brand}
            </span>

            <span class="tt-tech">
              ${d.screen_tech}
            </span>

            <div class="tt-row">
              <span>Screen</span>
              <strong>${d.screensize}"</strong>
            </div>

            <div class="tt-row">
              <span>Energy</span>
              <strong>
                ${d.energy_consumpt.toFixed(1)} kWh
              </strong>
            </div>

            <div class="tt-row">
              <span>Stars</span>
              <strong>
                ${d.star2.toFixed(2)} ★
              </strong>
            </div>
          `);
      })

      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 35 + "px");
      })

      .on("mouseleave", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 8)
          .attr("opacity", 1);

        tooltip.style("display", "none");
      });

    // ── Animation ──────────────────────────────────────────────────────────
    dots.attr("opacity", 1);

    // ── Legend ─────────────────────────────────────────────────────────────
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${margin.left}, ${height + margin.top + 75})`,
      );

    legend
      .append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", 0)
      .text("Screen Technology");

    techs.forEach((tech, i) => {
      const row = legend
        .append("g")
        .attr("transform", `translate(${i * 95}, 24)`);

      row.append("circle").attr("r", 6).attr("fill", colorScale(tech));

      row
        .append("text")
        .attr("class", "legend-label")
        .attr("x", 14)
        .attr("y", 4)
        .text(tech);
    });
  });
}

// ── Render Chart ───────────────────────────────────────────────────────────
renderScatterPlot("#chart1-scatter");
