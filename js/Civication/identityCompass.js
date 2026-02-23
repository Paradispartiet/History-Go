(function () {

  function svgEl(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  function renderIdentityCompass(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    const identity = window.HG_IdentityCore?.getIdentity();
    if (!identity) return;

    const focus = identity.focus;

    const types = Object.keys(focus);
    const size = 240;
    const center = size / 2;
    const radius = 90;

    const svg = svgEl("svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);

    // Background circle
    const circle = svgEl("circle");
    circle.setAttribute("cx", center);
    circle.setAttribute("cy", center);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "rgba(255,255,255,0.1)");
    svg.appendChild(circle);

    const points = [];

    types.forEach((type, i) => {
      const angle = (i / types.length) * Math.PI * 2 - Math.PI / 2;
      const value = focus[type] || 0;

      const x = center + Math.cos(angle) * radius * value;
      const y = center + Math.sin(angle) * radius * value;

      points.push(`${x},${y}`);

      // Axis line
      const axisX = center + Math.cos(angle) * radius;
      const axisY = center + Math.sin(angle) * radius;

      const line = svgEl("line");
      line.setAttribute("x1", center);
      line.setAttribute("y1", center);
      line.setAttribute("x2", axisX);
      line.setAttribute("y2", axisY);
      line.setAttribute("stroke", "rgba(255,255,255,0.08)");
      svg.appendChild(line);

      // Label
      const label = svgEl("text");
      label.setAttribute("x", center + Math.cos(angle) * (radius + 15));
      label.setAttribute("y", center + Math.sin(angle) * (radius + 15));
      label.setAttribute("fill", "rgba(255,255,255,0.6)");
      label.setAttribute("font-size", "10");
      label.setAttribute("text-anchor", "middle");
      label.textContent = type;
      svg.appendChild(label);
    });

    // Polygon shape
    const polygon = svgEl("polygon");
    polygon.setAttribute("points", points.join(" "));
    polygon.setAttribute("fill", "rgba(123, 216, 143, 0.3)");
    polygon.setAttribute("stroke", "rgba(123, 216, 143, 0.8)");
    polygon.setAttribute("stroke-width", "2");

    svg.appendChild(polygon);

    container.appendChild(svg);
  }

  function init() {
    renderIdentityCompass("identityCompass");

    window.addEventListener("updateProfile", () => {
      renderIdentityCompass("identityCompass");
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  window.HG_IdentityCompass = {
    render: renderIdentityCompass
  };

})();
