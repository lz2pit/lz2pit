import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { NatalChartData } from "@shared/schema";
import { ZODIAC_SIGNS } from "@/lib/astrology-constants";
import { getPlanetColor, getPlanetSymbol } from "@/lib/astrology-utils";

interface NatalChartProps {
  data: NatalChartData | null;
}

const HOUSE_ORDER = ["ASC", "2", "3", "IC", "5", "6", "DSC", "8", "9", "MC", "11", "12"];

export default function NatalChart({ data }: NatalChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 500;
    const radius = 200;
    const center = { x: width / 2, y: height / 2 };

    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .style("max-width", "100%")
       .style("height", "auto");

    // Outer circle
    svg.append("circle")
       .attr("cx", center.x)
       .attr("cy", center.y)
       .attr("r", radius)
       .attr("class", "chart-circle");

    // Inner circle
    svg.append("circle")
       .attr("cx", center.x)
       .attr("cy", center.y)
       .attr("r", radius * 0.7)
       .attr("class", "chart-circle");

    // House lines - подредени по HOUSE_ORDER
    HOUSE_ORDER.forEach(houseKey => {
      const house = data.houses?.[houseKey];
      if (!house || typeof house.cusp !== "number") return;

      const angle = (house.cusp - 90) * Math.PI / 180;
      const x1 = center.x + Math.cos(angle) * radius * 0.7;
      const y1 = center.y + Math.sin(angle) * radius * 0.7;
      const x2 = center.x + Math.cos(angle) * radius;
      const y2 = center.y + Math.sin(angle) * radius;

      svg.append("line")
         .attr("x1", x1)
         .attr("y1", y1)
         .attr("x2", x2)
         .attr("y2", y2)
         .attr("class", "house-line");

      svg.append("text")
         .attr("x", center.x + Math.cos(angle + Math.PI / 12) * radius * 0.85)
         .attr("y", center.y + Math.sin(angle + Math.PI / 12) * radius * 0.85)
         .attr("class", "house-label")
         .text(houseKey);
    });

    // Zodiac signs
    ZODIAC_SIGNS.forEach(sign => {
      const angle = (sign.degrees - 90) * Math.PI / 180;
      const labelAngle = angle + Math.PI / 12;
      const x = center.x + Math.cos(labelAngle) * radius * 0.92;
      const y = center.y + Math.sin(labelAngle) * radius * 0.92;

      svg.append("text")
         .attr("x", x)
         .attr("y", y)
         .attr("text-anchor", "middle")
         .attr("dy", "0.35em")
         .attr("font-size", "18px")
         .attr("class", "symbol-font")
         .attr("fill", "hsl(var(--foreground))")
         .text(sign.symbol);
    });

    // Planets - само глифове, без имена
    Object.entries(data.planets || {}).forEach(([planetName, planetData]) => {
      if (!planetData || typeof planetData.longitude !== "number") return;

      const angle = (planetData.longitude - 90) * Math.PI / 180;
      const x = center.x + Math.cos(angle) * radius * 0.8;
      const y = center.y + Math.sin(angle) * radius * 0.8;

      svg.append("circle")
         .attr("cx", x)
         .attr("cy", y)
         .attr("r", 12)
         .attr("fill", getPlanetColor(planetName))
         .attr("class", "planet-marker");

      svg.append("text")
         .attr("x", x)
         .attr("y", y)
         .attr("text-anchor", "middle")
         .attr("dy", "0.35em")
         .attr("font-size", "14px")
         .attr("class", "symbol-font")
         .attr("font-weight", "bold")
         .attr("fill", "white")
         .text(getPlanetSymbol(planetName));
    });

    // Aspect lines (planet-planet)
    (data.aspects || []).forEach(aspect => {
      if (
        aspect.type === "planet-planet" &&
        data.planets?.[aspect.planet1] &&
        data.planets?.[aspect.planet2]
      ) {
        const planet1Data = data.planets[aspect.planet1];
        const planet2Data = data.planets[aspect.planet2];

        if (
          !planet1Data ||
          !planet2Data ||
          typeof planet1Data.longitude !== "number" ||
          typeof planet2Data.longitude !== "number"
        ) return;

        const angle1 = (planet1Data.longitude - 90) * Math.PI / 180;
        const angle2 = (planet2Data.longitude - 90) * Math.PI / 180;

        const x1 = center.x + Math.cos(angle1) * radius * 0.6;
        const y1 = center.y + Math.sin(angle1) * radius * 0.6;
        const x2 = center.x + Math.cos(angle2) * radius * 0.6;
        const y2 = center.y + Math.sin(angle2) * radius * 0.6;

        svg.append("line")
           .attr("x1", x1)
           .attr("y1", y1)
           .attr("x2", x2)
           .attr("y2", y2)
           .attr("stroke", aspect.color)
           .attr("class", "aspect-line");
      }
    });
  }, [data]);

  return (
    <div className="bg-gray-50 rounded-2xl p-6 min-h-[500px] flex items-center justify-center">
      <svg ref={svgRef} width="500" height="500"></svg>
    </div>
  );
}
