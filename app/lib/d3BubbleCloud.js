import d3 from "d3";
import d3MeasureText from "d3-measure-text"; d3MeasureText.d3 = d3;

Array.prototype.indexOfObj = function arrayObjectIndexOf(property, value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === value) return i;
    }
    return -1;
};

const width = 1100;
const height = 800;
const center = {
    x: width / 2,
    y: height / 2
};
// const margin = {left: 100, right: 100, top: 100, bottom: 100};

const color = d3.scale.linear()
    .domain([10, 15, 20, 25, 30, 40, 50, 55, 60, 80, 90, 95, 97, 98, 99, 150])
    .range((["#041d4c", "#041d4c", "#041d4c", "#041d4c", "#041d4c",
        "#003269", "#003269", "#003269", "#003269", "#31669e",
        "#041d4c", "#041d4c", "#31659d", "#38507e", "#979696",
        "#939393"
    ]));

const color2 = d3.scale.linear()
    .domain([10, 15, 20, 25, 30, 40, 50, 55, 60, 80, 90, 95, 97, 98, 99,
        150
    ])
    .range(["#ffffe0", "#fff6cf", "#ffeec1", "#ffe6b2", "#ffdda7",
        "#ffd59b", "#ffcb91", "#ffc287", "#ffb880", "#ffaf79",
        "#ffa474", "#ff9a6e", "#fe8f6a", "#fb8767", "#f87d64",
        "#f47361", "#f06a5e", "#eb615b", "#e65758", "#e14f55",
        "#db4551", "#d53d4c", "#ce3447", "#c82b42", "#c0223b",
        "#b81b34", "#b0122c", "#a70b24", "#9e051b", "#94010f",
        "#8b0000"
    ].reverse());

const force = d3.layout.force()
    .charge((d) => { return -Math.pow(d.radius, 4 / 3);
    })
    .gravity(-0.01)
    .friction(0.9)
    .size([width, height])
    .linkDistance(0);


// Move d to be adjacent to the cluster node.
// function cluster(alpha, radius) {
//   return function(d) {
//     // if (cluster === d) return;
//     var x = d.x - d.initX,
//         y = d.y - d.initY,
//         l = Math.sqrt(x * x + y * y),
//         r = radius; // tooltip len
//     if (l != r) {
//       l = (l - r) / l * alpha;
//       d.x -= x *= l;
//       d.y -= y *= l;
//       // d.initX += x;
//       // d.initY += y;
//     }
//   };
// }


function cropLen(d) {
  var circum = d3MeasureText(d.key).width + 10;
  // var needLen = circum;
  var needLen = circum / Math.PI / 2;
  // var availLen = d.radius * 2 * Math.PI;
  var availLen = d.radius - (79/320 * d.radius);
  if (availLen > needLen) return d.key.length;
  else {
    var offset = parseInt(needLen - availLen);
    var len = d.key.length - offset;
    return len;
  }
}


// Resolves collisions between d and all other circles.
function collide(data, alpha, padding) {
    var quadtree = d3.geom.quadtree(data);
    return function(d) {
        var r = d.radius + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + padding + quad.point.radius;

                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}


function overlap(a, b) {
    // return ( (a.x < b.x < a.x2() && a.y < b.y < a.y2()) || (a.x < b.x2() < a.x2() && a.y < b.y2() < a.y2()) );
    // TODO: understand
    var ref, ref1, ref2, ref3;
    return ((a.x < (ref = b.x) && ref < a.x2()) && (a.y < (ref1 = b.y) && ref1 < a.y2())) || ((a.x < (ref2 = b.x2()) && ref2 < a.x2()) && (a.y < (ref3 = b.y2()) && ref3 < a.y2()));
}


function collideTooltip(data) {
    var quadtree = d3.geom.quadtree(data);
    return function(node) {
        var nx1, nx2, ny1, ny2, padding;
        padding = 40;
        nx1 = node.x - padding;
        nx2 = node.x2() + padding;
        ny1 = node.y - padding;
        ny2 = node.y2() + padding;

        quadtree.visit(function(quad, x1, y1, x2, y2) {
            // var dx;
            var dy;
            if (quad.point && (quad.point !== node)) {
                if (overlap(node, quad.point)) {
                    // dx = Math.min(node.x2() - quad.point.x, quad.point.x2() - node.x) / 2;
                    // node.x -= dx;
                    // quad.point.x -= dx;

                    dy = Math.min(node.y2() - quad.point.y, quad.point.y2() - node.y) / 2;
                    node.y -= dy;
                    quad.point.y += dy;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}


function radial(d, index, alpha, radius, length, energy, startAngle) {
    const D2R = Math.PI / 180;
    var currentAngle = startAngle + (360 / length * index);
    var currentAngleRadians = currentAngle * D2R;

    //console.log(360/length);
    var radialPoint = {
        x: center.x + radius * Math.cos(currentAngleRadians),
        y: center.y + radius * Math.sin(currentAngleRadians)
    };

    var affectSize = alpha * energy;

    d.x += (radialPoint.x - d.x) * affectSize;
    d.y += (radialPoint.y - d.y) * affectSize;
    d.angle = currentAngle;
}


function linkArc(d) {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    return ("M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr +
        " 0 0,1 " + d.target.x + "," + d.target.y);
}


// function highlighted(d, selNode, history) {
//     //TODO: id
//     return (selNode.context_words.indexOf(d.key) !== -1 ||
//         history.indexOf(d.id) !== -1 || d.id === selNode.id);
// }


// function previewContext(history, selNode) {
//   var edges = [];
//
//   d3.select("#BubbleCloud").selectAll("circle").each(function(d) {
//     if (selNode.context_words.indexOf(d.key) !== -1) {
//       edges.push({
//         id: selNode.key + d.key,
//         source: selNode,
//         target: d
//       });
//     }
//   });
//
//   const paths = d3.select("#BubbleCloud").selectAll("path")
//     .data(edges, function(d) {
//       return d.source.key + "-" + d.target.key;
//     });
//
//   paths.enter().insert("path", ":first-child")
//     .attr("class", "bubblelink")
//     .style("stroke", (d) => {
//       return color(d.target.i);
//     })
//     .attr("d", "M" + 0 + "," + 0 + "A" + 0 + "," + 0 + " 0 0,1 " + 0 + "," + 0)
//     .transition()
//     .duration(200)
//     .attr("class", "link")
//     .style("stroke", (d) => {
//       return color2(d.target.i);
//     });
//     // .attr("d", linkArc);
//
// }


function move_to_center(alpha) {
    return function(d) {
        d.x = d.x + (center.x - d.x) * (0.1 + 0.02) * alpha * 1.1;
        d.y = d.y + (center.y - d.y) * (0.1 + 0.02) * alpha * 1.1;
    };
}


function defaultTick(node, data) {
  var lenNodes = data.filter(d => d.radius > 20).length;
  return function(e) {
    node.each(move_to_center(e.alpha));
    node.each((d, i) => {
        if (d.radius > 20) radial(d, i, e.alpha, 400, lenNodes/3, 0.3, 0);
        else move_to_center(e.alpha);
    });

    node.each(collide(data, 0.8, 1));
    node.attr("transform", d => "translate(" + [d.x, d.y] + ")");
  };
}


function contextViewTick(data, contextData, node, tooltip, link) {
  var lenNodes = data.filter(d => d.radius > 20).length;
  return function(e) {
    node.each(move_to_center(e.alpha));
    node.each((d, i) => {
      if (d.radius > 20) radial(d, i, e.alpha, 400, lenNodes, 0.3, 0);
      else move_to_center(e.alpha);
    });
    node.each(collide(data, 0.8, 1));
    node.attr("transform", d => "translate(" + [d.x, d.y] + ")");

    tooltip.each(collideTooltip(contextData));
    tooltip
    .style("left", d => d.x + "px")
    .style("top", d => d.y + "px");
    link
    .attr("d", linkArc);
  };
}


function contextView(data, history, node, selNode) {
    var edges = [];
    var curContext = Object.assign({}, selNode);
    curContext.id = selNode.key + "context";
    curContext.x2 = function() {
        return this.x + 0;
    };
    curContext.y2 = function() {
        return this.y + 0;
    };
    curContext.cat = "context";
    var contextData = [];

    node.each(d => {
      if (selNode.context_words.indexOf(d.key) !== -1 &&
        contextData.indexOfObj("id", d.id) === -1) {

        // copy node for context info
        var dContext = Object.assign({}, d);
        dContext.id = d.key + "context";
        dContext.key = d.key;

        //TODO: size of tooltip
        dContext.x2 = function() {
            return this.x + 140;
        };
        dContext.y2 = function() {
            return this.y + 40;
        };
        dContext.cat = "context";
        contextData.push(dContext);

        d.selected = true;

        // tooltip links
        edges.push({
            id: curContext.key + dContext.key,
            source: dContext,
            target: d
        });

        edges.push({
            id: selNode.key + d.key,
            source: selNode,
            target: d
        });
      }
    });

    force.stop();
    force.nodes(contextData.concat(data));

    var tooltip = d3.select("#bc-cont").selectAll("div")
        .data(contextData, d => "tooltip" + d.key);

    tooltip.enter()
        .append("div")
        .attr("class", d => d.x > center.x ? "tooltip-right" : "tooltip-left") // TODO
        .append("span").text(d => d.key);

    var link = d3.select("#BubbleCloud").selectAll(".link")
        .data(edges, d => d.source.key + "-" + d.target.key);

    link
      .enter()
      .insert("path", ":first-child")
        .style("stroke", (d) => {
            return color(d.target.i);
        })
        .attr("d", "M" + 0 + "," + 0 + "A" + 0 + "," + 0 + " 0 0,1 " + 0 + "," + 0)
        .attr("class", "link")
        .style("stroke", (d) => color2(d.source.radius))
        .attr("d", linkArc);

    force.links(edges);
    force.linkStrength(d => d.source.cat === "context" ? 1 : 0);
    force.linkDistance(d => d.source.cat === "context" ? 1 : 1);

    force.on("tick", contextViewTick(data, contextData, node, tooltip, link));

    node.exit()
        .remove();

    tooltip.exit()
        .remove();

    link.exit()
        .remove();

    force.start();
}


function resetView(force, node, data) {
    force.links([]);
    force.nodes(data);

    d3.selectAll("#BubbleCloud path").remove();
    d3.selectAll("#bc-cont div").remove();

    force.on("tick", e => defaultTick(e, node, data));

    d3.selectAll("#BubbleCloud circle").style("opacity", 1);
    d3.selectAll("#BubbleCloud circle").each(e => {
        return e.selected = false;
    });
}


function render(data, history, selNode) {
    var bubbleCloud = d3.select("#BubbleCloud");

    var node = bubbleCloud.selectAll("g.group")
        .data(data, d => d.id);

    var arc = d3.svg.arc()
      .innerRadius(d => d.radius - 10)
      .outerRadius(d => d.radius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    // TODO: important
    var groupEnter = node
      .enter()
      .append("g")
      .attr("class", "group");

    groupEnter.append("circle")
      .attr("class", "node")
      .attr("r", d => d.radius)
      .style("opacity", 1)
      .style("fill", d => color2(d.radius))
      .call(force.drag);

    groupEnter.append("path")
      .attr("d", arc)
      .attr("fill", "lightgrey")
      .attr("id", (_, i) => "arc"+i);
      // .style("font-size", 20)
      // // .attr({
      // //       "alignment-baseline": "middle",
      // //       "text-anchor": "middle"
      // //     })
      // .text(d => d.key);

    groupEnter.append("text")
      // .attr("x", 8)
      .attr("dy", 10)
      .append("textPath")
      .attr("textLength", d => {
        return d3MeasureText(d.key.substring(0, cropLen(d))).width + 10;
      })
      .attr("xlink:href",(_, i) => "#arc"+i)
      .attr("startOffset", 3/20)
      .attr("dy","-1em")
      // add ...
      .text(d => d.size > 20 ? d.key.substring(0, cropLen(d)) : null);

    node.each(d => d.selected = false);

    force.on("tick", defaultTick(node, data));

    node
      .on("click", (d) => {
        if (!d.selected) {
          d.selected = true;
          render(data, history, d);
        }
        else {
          d.selected = false;
          render(data, history, null);
        }
      });
    // .on("mouseover", function(d) {
    //   var opacity = parseInt(d3.select(this).style("opacity"));
    //   if (!d.selected && opacity === 1) {
    //     d3.selectAll("#BubbleCloud circle").style("opacity", (e) => {
    //       return highlighted(e, d, history) ? 1 : 0.5;
    //     });
    //   }
    // })
    // .on("mouseout", (d) => {
    //   if (!d.selected) d3.selectAll("#BubbleCloud circle").style("opacity", 1);
    // });

    // contextView(d);
    if (selNode) contextView(data, history, node, selNode);
    else {
      var tooltip = d3.select("#bc-cont").selectAll("div")
        .data([], d => "tooltip" + d.key);

      var link = d3.select("#BubbleCloud").selectAll(".link")
        .data([], d => d.source.key + "-" + d.target.key);

      link.exit().remove();
      tooltip.exit().remove();
    }

    node.exit()
      .remove();

    force.start();

    node.style("opacity", d => d.selected ? 1 : 0.5);

}

const d3BubbleCloud = {};

d3BubbleCloud.create = function(el, props, callback) {
    //TODO: props to include as arg
    d3.select(el).append("svg")
        .attr("id", "BubbleCloud")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(545,300)");

    this.update(el, props, callback);
};


d3BubbleCloud.update = function(el, props) {
    force.nodes(props.data);

    render(props.data, props.history, null);
};

export
default d3BubbleCloud;
