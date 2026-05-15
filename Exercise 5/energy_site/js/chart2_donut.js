function renderDonutChart(selector) {
  d3.csv("data/Ex5_TV_energy.csv").then((rawData) => {
    // ── Group Data By Screen Technology ────────────────────────────────────
    const grouped = d3.rollups(
      rawData,
      (v) => d3.mean(v, (d) => +d.energy_consumpt),
      (d) => d.screen_tech,
    );

    const data = grouped.map((d) => ({
      Screen_Tech: d[0],
      value: d[1],
    }));

    // ── Container ──────────────────────────────────────────────────────────
    const container = d3.select(selector);
    container.selectAll("*").remove();

    // ── Dimensions ─────────────────────────────────────────────────────────
    const totalW = container.node().getBoundingClientRect().width || 700;

    const size = Math.min(totalW, 720);

    const margin = {
      top: 80,
      right: 80,
      bottom: 80,
      left: 80,
    };

    const width = size - margin.left - margin.right;
    const height = size - margin.top - margin.bottom;

    const radius = Math.min(width, height) / 2;

    const innerR = radius * 0.56;

    // ── SVG ────────────────────────────────────────────────────────────────
    const svg = container
      .append("svg")
      .attr("viewBox", `0 0 ${size} ${size}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "700px")
      .attr("class", "chart-svg donut-svg");

    const g = svg
      .append("g")
      .attr("transform", `translate(${size / 2}, ${size / 2})`);

    // ── Color Scale ────────────────────────────────────────────────────────
    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.Screen_Tech))
      .range(["#edf7bd", "#4361EE", "#FFB703"]);

    // ── Pie Generator ──────────────────────────────────────────────────────
    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.03);

    // ── Arc Generators ─────────────────────────────────────────────────────
    const arc = d3.arc().innerRadius(innerR).outerRadius(radius);

    const arcHover = d3
      .arc()
      .innerRadius(innerR)
      .outerRadius(radius + 16);

    const arcLabel = d3
      .arc()
      .innerRadius(radius + 35)
      .outerRadius(radius + 35);

    // ── Tooltip ────────────────────────────────────────────────────────────
    const tooltip = d3
      .select("body")
      .selectAll(".donut-tooltip")
      .data([null])
      .join("div")
      .attr("class", "chart-tooltip donut-tooltip");

    // ── Total ──────────────────────────────────────────────────────────────
    const total = d3.sum(data, (d) => d.value);

    // ── Arcs ───────────────────────────────────────────────────────────────
    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .join("g")
      .attr("class", "arc");

    // ── Arc Paths ──────────────────────────────────────────────────────────
    arcs
      .append("path")
      .attr("fill", (d) => colorScale(d.data.Screen_Tech))
      .attr("stroke", "#0f1117")
      .attr("stroke-width", 3)
      .style("opacity", 0)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(180)
          .attr("d", arcHover)
          .style("opacity", 1);

        const pct = ((d.data.value / total) * 100).toFixed(1);

        tooltip.style("display", "block").html(`
            <span class="tt-label">
              ${d.data.Screen_Tech}
            </span>

            <div class="tt-row">
              <span>Average Energy</span>
              <strong>
                ${d.data.value.toFixed(1)} kWh
              </strong>
            </div>

            <div class="tt-row">
              <span>Share</span>
              <strong>${pct}%</strong>
            </div>
          `);
      })

      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 35 + "px");
      })

      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(180)
          .attr("d", arc)
          .style("opacity", 0.9);

        tooltip.style("display", "none");
      })

      .transition()
      .duration(900)
      .delay((d, i) => i * 160)
      .attrTween("d", function (d) {
        const interp = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);

        return (t) => arc(interp(t));
      })
      .style("opacity", 0.9);

    // ── Percentage Labels ─────────────────────────────────────────────────
    arcs
      .append("text")
      .attr("class", "donut-pct")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "15px")
      .style("font-weight", "700")
      .style("opacity", 0)
      .text((d) => {
        return `${((d.data.value / total) * 100).toFixed(1)}%`;
      })
      .transition()
      .delay(1000)
      .duration(400)
      .style("opacity", 1);

    // ── External Label Lines ───────────────────────────────────────────────
    arcs
      .append("polyline")
      .attr("class", "donut-polyline")
      .attr("stroke", (d) => colorScale(d.data.Screen_Tech))
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .attr("points", (d) => {
        const p1 = arc.centroid(d);

        const p2 = arcLabel.centroid(d);

        const p3 = [...p2];

        p3[0] = p3[0] > 0 ? p3[0] + 24 : p3[0] - 24;

        return [p1, p2, p3];
      })
      .transition()
      .delay(1000)
      .duration(400)
      .style("opacity", 0.7);

    // ── External Labels ────────────────────────────────────────────────────
    arcs
      .append("text")
      .attr("class", "donut-label")
      .attr("transform", (d) => {
        const pos = arcLabel.centroid(d);

        pos[0] = pos[0] > 0 ? pos[0] + 28 : pos[0] - 28;

        return `translate(${pos})`;
      })
      .attr("text-anchor", (d) => {
        const mid = (d.startAngle + d.endAngle) / 2;

        return mid > Math.PI ? "end" : "start";
      })
      .attr("dy", "0.35em")
      .style("font-size", "15px")
      .style("font-weight", "600")
      .style("opacity", 0)
      .text((d) => d.data.Screen_Tech)
      .transition()
      .delay(1000)
      .duration(400)
      .style("opacity", 1);

    // ── Center Text ────────────────────────────────────────────────────────
    g.append("text")
      .attr("class", "donut-centre-label")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.6em")
      .style("font-size", "16px")
      .text("Average");

    g.append("text")
      .attr("class", "donut-centre-value")
      .attr("text-anchor", "middle")
      .attr("dy", "0.8em")
      .style("font-size", "32px")
      .text(`${(total / data.length).toFixed(0)} kWh`);

    g.append("text")
      .attr("class", "donut-centre-sub")
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .style("font-size", "14px")
      .text("per year");

    // ── Title ──────────────────────────────────────────────────────────────
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", size / 2)
      .attr("y", 42)
      .attr("text-anchor", "middle")
      .style("font-size", "24px");
  });
}

renderDonutChart("#chart2-donut");
