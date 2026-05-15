function renderLineChart(selector, options = {}) {
  d3.csv("data/Ex5_ARE_Spot_Prices.csv").then((data) => {
    // ── Config ─────────────────────────────────────────────────────────────
    const showAverage = options.showAverage === true;

    const stateCols = [
      {
        key: "Queensland ($ per megawatt hour)",
        label: "Queensland",
        short: "QLD",
      },
      {
        key: "New South Wales ($ per megawatt hour)",
        label: "New South Wales",
        short: "NSW",
      },
      {
        key: "Victoria ($ per megawatt hour)",
        label: "Victoria",
        short: "VIC",
      },
      {
        key: "South Australia ($ per megawatt hour)",
        label: "South Australia",
        short: "SA",
      },
      {
        key: "Tasmania ($ per megawatt hour)",
        label: "Tasmania",
        short: "TAS",
      },
    ];

    const avgCol = "Average Price (notTas-Snowy)";

    // ── Parse data ─────────────────────────────────────────────────────────
    const rows = data.map((d) => ({
      year: +d.Year,
      QLD: +d["Queensland ($ per megawatt hour)"] || null,
      NSW: +d["New South Wales ($ per megawatt hour)"] || null,
      VIC: +d["Victoria ($ per megawatt hour)"] || null,
      SA: +d["South Australia ($ per megawatt hour)"] || null,
      TAS: +d["Tasmania ($ per megawatt hour)"] || null,
      avg: +d[avgCol] || null,
    }));

    // ── Container ──────────────────────────────────────────────────────────
    const container = d3.select(selector);
    container.selectAll("*").remove();

    // ── Dimensions ─────────────────────────────────────────────────────────
    const margin = {
      top: 60,
      right: 170,
      bottom: 110,
      left: 80,
    };

    const totalWidth = container.node().getBoundingClientRect().width || 820;

    const width = totalWidth - margin.left - margin.right;
    const height = Math.min(420, width * 0.55);

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
      .attr("class", "chart-svg line-svg");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── Colour scale ───────────────────────────────────────────────────────
    const colorScale = d3
      .scaleOrdinal()
      .domain([...stateCols.map((s) => s.label), "Average"])
      .range([
        "#4CC9F0",
        "#F72585",
        "#7209B7",
        "#06D6A0",
        "#FFB703",
        "#FF6B6B",
      ]);

    // ── Scales ─────────────────────────────────────────────────────────────
    const allValues = showAverage
      ? rows.map((r) => r.avg).filter((v) => v != null)
      : stateCols.flatMap((s) =>
          rows.map((r) => r[s.short]).filter((v) => v != null),
        );

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(rows, (d) => d.year))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(allValues) * 1.1])
      .range([height, 0])
      .nice();

    // ── Grid lines ─────────────────────────────────────────────────────────
    g.append("g")
      .attr("class", "grid grid-y")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat("").ticks(6));

    g.append("g")
      .attr("class", "grid grid-x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat("").ticks(10));

    // ── Axes ───────────────────────────────────────────────────────────────
    g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d")));

    g.append("g")
      .attr("class", "axis axis-y")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickFormat((d) => `$${d}`),
      );

    // ── Axis labels ────────────────────────────────────────────────────────
    g.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .text("Year");

    g.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -64)
      .attr("text-anchor", "middle")
      .text("Price ($ per MWh)");

    // ── Line generator ─────────────────────────────────────────────────────
    const lineGen = (key) =>
      d3
        .line()
        .defined((d) => d[key] != null)
        .x((d) => xScale(d.year))
        .y((d) => yScale(d[key]))
        .curve(d3.curveMonotoneX);

    // ── Series setup ───────────────────────────────────────────────────────
    const series = showAverage
      ? [{ key: "avg", label: "Average", color: colorScale("Average") }]
      : stateCols.map((s) => ({
          key: s.short,
          label: s.label,
          color: colorScale(s.label),
        }));

    // ── Draw lines ─────────────────────────────────────────────────────────
    series.forEach(({ key, label, color }) => {
      const path = g
        .append("path")
        .datum(rows)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.2)
        .attr("d", lineGen(key));

      const totalLength = path.node().getTotalLength();

      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1800)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", () => path.attr("stroke-dasharray", null));

      // points
      g.selectAll(`.dot-${key}`)
        .data(rows.filter((d) => d[key] != null))
        .join("circle")
        .attr("class", `dot-${key}`)
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d[key]))
        .attr("r", 4)
        .attr("fill", color)
        .attr("opacity", 0)
        .transition()
        .delay(1850)
        .duration(200)
        .style("opacity", 0.85);
    });

    // ── Tooltip ───────────────────────────────────────────────────────────
    const tooltip = d3
      .select("body")
      .selectAll(".line-tooltip")
      .data([null])
      .join("div")
      .attr("class", "chart-tooltip line-tooltip");

    const overlay = g
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    const crosshair = g
      .append("line")
      .attr("y1", 0)
      .attr("y2", height)
      .style("display", "none");

    overlay
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const year = Math.round(xScale.invert(mx));
        const row = rows.find((r) => r.year === year);
        if (!row) return;

        crosshair
          .style("display", null)
          .attr("x1", xScale(year))
          .attr("x2", xScale(year));

        const lines = showAverage
          ? [{ label: "Average", val: row.avg }]
          : stateCols.map((s) => ({ label: s.label, val: row[s.short] }));

        tooltip.style("display", "block").html(`
            <span class="tt-label">${year}</span>
            ${lines
              .filter((l) => l.val != null)
              .map(
                (l) => `
                <div class="tt-row">
                  <span>${l.label}</span>
                  <strong>$${l.val.toFixed(1)}/MWh</strong>
                </div>
              `,
              )
              .join("")}
          `);
      })

      .on("mousemove.pos", function (event) {
        tooltip
          .style("left", event.pageX + 14 + "px")
          .style("top", event.pageY - 36 + "px");
      })

      .on("mouseleave", function () {
        crosshair.style("display", "none");
        tooltip.style("display", "none");
      });

    // ── Legend ─────────────────────────────────────────────────────────────
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${margin.left + width + 16}, ${margin.top})`,
      );

    series.forEach((s, i) => {
      const row = legend
        .append("g")
        .attr("transform", `translate(0, ${20 + i * 24})`);

      row
        .append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("stroke", s.color)
        .attr("stroke-width", 2.5);

      row
        .append("text")
        .attr("x", 26)
        .attr("y", 4)
        .text(s.label)
        .style("fill", "white");
    });

    // ── Title ─────────────────────────────────────────────────────────────
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", margin.left + width / 2)
      .attr("y", 28)
      .attr("text-anchor", "middle")
      .text("Spot Power Prices by State (1998–2024)");
  });
}

// ── Render ───────────────────────────────────────────────────────────────
renderLineChart("#chart4-line");
