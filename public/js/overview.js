// TODO: make r based on width and height;
// currently, minicircle settings depend on radius scale being 850
var r = 750,
	x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]), 
	sizeLabelLimit = 28,
    sizeLabelLimitParent = 30,
    maxEdgeWidth = 6,
    minEdgeWidth = 2,
    overviewVisible = true,
    selectedNodes = [],
    w, h, r, x, y, diseasename, url, node, root, nodes, vis, overviewVis, tooltip, wd, barht, ht, bar, bx, by, rxname, rxcount, hashtable, leftwidth, dataset, format, drught;

$(document).ready(function() {

	vis = d3.select("#svg-container");
	w = $(vis[0][0]).width();
	h = $(vis[0][0]).height();
	//console.log("found svg element with width", w, "and height", h);

  barht = 40;
  drught = barht + 10;
  ht= window.innerHeight;

	overviewVis = transform(vis.append("svg:g"));
    
    $(document).click(function(e) {
    	// if user clicked on empty space
    	if (!e.target.id) {
    		reset();
    	}
	});

	d3.json("../data/disease_tree.json", function(data) {
		var pack = d3.layout.pack()
			.size([r, r])
			.padding(1)
			.value(function(d) { return d.size; })
		//pack.sort(null);
		node = root = data;
		nodes = pack.nodes(root);
		drawAll();
	});
});

function reset() {
	// nodes
	overviewVis.selectAll("circle").classed("dim", false);
  // links
  overviewVis.selectAll("line").style("visibility", "hidden");
	// labels
  overviewVis.selectAll("text").classed("dim", false);
}

function transform(d3Elem) {
	return d3Elem.attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");
}

function updateTitle(newTitle) {
  var title = d3.select("#title");
  $("#title_text").fadeTo(0,0);
  $("#title_text").text(newTitle);
  $("#title_text").delay(DemoConstants.duration.RepositionChart).fadeTo( 2000, 1 );
}

function mouseHandler(d, dim) {
	if (overviewVisible) {
		//console.log("mouseout:", d.name);
		// only act when zoomed fully out
		if ((!d.children) && (node === root)) {
				// dimAllOtherNodes(d, dim);
				// showComorbidEdges(d, dim);
		}
  if (d.children) {
      if (node === d) {
        document.getElementById('instructions_text')
          .innerHTML = d.name;
      }
      else {
        document.getElementById('instructions_text')
              .innerHTML = d.name; }
  }
  if (!dim) {document.getElementById('instructions_text')
                .textContent = '';}
}

  if (dim) {
    if (selectedNodes.length == 0) {
      // drawtt(d);
      var labelName = d.name;
      var label = overviewVis.selectAll("text").filter(function(d) {return d.name == labelName;});
      label.style("opacity",1);
    }
  } else {
    if (selectedNodes.length == 0) {
      // destroytt(d);
      var labelName = d.name;
      var label = overviewVis.selectAll("text").filter(function(d) {return d.name == labelName;});
      label.style("opacity",function(focalNode) { if(focalNode.depth == 1) {return 1;} else {return 0;}
          });
    }
  }
}

// function getdrugname(maxdrugs, d) {
//   var drugname = [];
//   for (var i=0;i<maxdrugs;i++) {
//       drugname.push(d.drugs[i].drug);
//   }
//   return drugname;
// }

// function getdrugcount(maxdrugs, d) {
//   var drugcount = [];
//   for (var i=0;i<maxdrugs;i++) {
//       drugcount.push(d.drugs[i].pct);
//   }
//   return drugcount;
// }

// function getdrugclass(maxdrugs, d) {
//   var drugclass = [];
//   for (var i=0;i<maxdrugs;i++) {
//       drugclass.push(d.drugs[i].drugclass);
//   }
//   return drugclass;
// }

function truncateLabel(label) {
  var maxChars = 19;
  var numChars = label.length;

  if (numChars <= maxChars) {
    return label;
  }
  // replace middle of text with ellipses
  else {
    var numCharsToRemove = numChars - maxChars;
    var endIndexFirstChunk = (numChars / 2) - (numCharsToRemove / 2);
    var startIndexSecondChunk = endIndexFirstChunk + numCharsToRemove;
    return label.substring(0, endIndexFirstChunk) + "..." + label.substring(startIndexSecondChunk, numChars);
  }
}

// function hash (maxdrugs, d) {
//   hashtable = {};
//   for (var i =0; i<maxdrugs;i++) {
//     drugname = d.drugs[i].drug;
//     drugclass = d.drugs[i].drugclass;
//     hashtable[drugname] = drugclass;
//   }
// }

// function drawtt (d) {
//    var maxdrugs = 0;
//   if (d.drugs) {
//     maxdrugs = Math.floor(ht / drught);
//   }
//   var drugnames = getdrugname(maxdrugs, d);
//   var drugcounts = getdrugcount(maxdrugs, d);
//   var drugclass = getdrugclass(maxdrugs, d);

//   hash(maxdrugs, d);

// if (d.children) {
//   return;
//   }
  
//   else {
//         document.getElementById('tt_title_text')
//           .innerHTML = 'Top drugs for indication<br/><strong>' + d.name +'</strong>';
//         document.getElementById('instructions_text')
//           .textContent='Click to freeze & explore the bar chart';

//          left_width = 150;

//          barchart_width = window.innerWidth - 950 - left_width;
//          barchart_bar_margin = 4;

//           wd = barchart_width + 100 + left_width;
//           bx = d3.scale.linear()
//             .domain ([0, d3.max(drugcounts)])
//             .range([0, barchart_width]);
//           format = d3.format("%")
          
          

//            bar = d3.select("body")
//             .append("svg")
//             .attr("id", "barchart")
//             .attr("width", wd)
//             .attr("height", ht);
//           bar.selectAll("rect")
//             .data(drugcounts)
//             .enter().append("rect")
//             .attr("x", left_width)
//             .attr("y", function (d,i) { return (i+0.5) * barht})
//             .attr("width", bx)
//             .attr("height", barht - barchart_bar_margin);
//           bar.selectAll("text")
//              .data(drugcounts)
//              .enter().append("text")
//              .attr("x", function (d) { return bx(d) + left_width + 5; })
//              .attr("y", function (d, i) {return (i + 1) * barht})
//              .attr("dy", ".39em")
//              .attr("dx", "2.4em")
//              .attr("text-anchor", "left")
//              .text(function(d) { return d + "%"; })
//              .attr('class', 'bar-label');
//           bar.selectAll("text.name")
//             .data(drugnames)
//             .enter().append("text")
//             .attr("y", function(d, i) {return (i + 1) * barht})
//             .attr("dy", ".39em")
//             .attr("text-anchor", "left")
//             .attr('class', 'rxname')
//             .style("cursor", "pointer")
//             .on("mouseover", function(d) {document.getElementById('instructions_text').textContent = 'Click to explore this drug on Practice Fusion Insight';})
//             .on("mouseout", function(d) {document.getElementById('instructions_text').textContent = '';})
//             .on("click", function(d) {return drugurl(d);})
//             .text(function(d, i) { return truncateLabel(drugnames[i]); });
//     }
// }

// function destroytt (d) {

//  document.getElementById('instructions_text')
//     .textContent = 'Hover over a diagnosis to see related drugs';
//     document.getElementById('tt_title_text')
//     .textContent = '';
//   if (d.children) {return;} else {
//   var elem = document.getElementById('barchart');
//   elem.parentNode.removeChild(elem);
//   return false;}
// }

function clickHandler(d) {
	//console.log("click:", d.name);
	// console.log(d);
	// if clicking on same node for a second time, zoom out to main
	if (node === d) {
		reset();
		zoom(root);
	}
	//if not a leaf node, just zoom in
	else if (d.children) {
		zoom(d);
	}
	
	else {
			// clicked on a leaf node: select that node
			if (selectedNodes.indexOf(d.name) < 0) {
			  //console.log("selected", d.name);
        deselectAll();
        selectedNodes.length = 0;
        // destroytt(d);
        // drawtt(d);
        d3.selectAll("circle.child").filter("." + cleanUp(d.name)).classed("selected", true).style("opacity", 1);
				selectedNodes.push(d.name);
        //console.log(selectedNodes);
				highlightNode(d.name);
			}
			else {
				//console.log("unselected", d.name);
        selectedNodes.splice(selectedNodes.indexOf(d.name), 1);
				unHighlightNode(d.name);
			}
			d3.event.stopPropagation();
	}
}

// function diseaseUrl (d) {
//   if (d.children) {return;} else {
//   diseasename = d.name;
//   if (diseasename === "Hypertensive disorder, systemic arterial") {
//     diseasename = "Hypertensive disorder";
//   } else if (diseasename === "Diabetes mellitus type 2") {
//     diseasename = "Type 2 diabetes mellitus";
//   } else if (diseasename === "Immunoglobulin E-mediated allergic asthma") {
//     diseasename = "IgE-mediated allergic asthma";
//   } else if (diseasename === "Viral hepatitis type C") {
//     diseasename = "Viral hepatitis C";
//   }
//   diseasename = diseasename.replace("Age-related", "Age+related").replace("Gastroesophageal", "Gastro-esophageal");
//   diseasename = encodeURIComponent(diseasename);
//   disurl = "https://insight.practicefusion.com/#/diseases/" + diseasename + "/diagnosis/search";
//   return document.location.href = disurl;}
// }

// function drugurl (d) {
//   drugname = d;
//   drugclass = hashtable[drugname];
//   drugname = encodeURIComponent(drugname);
//   drugclass = encodeURIComponent(drugclass);
//   drughyp = "https://insight.practicefusion.com/#/drugs/" + drugname + "/" + drugclass + "/marketshare";
//   console.log(drughyp);
//   return document.location.href = drughyp;}


function drawAll() {
  // drawAllEdges(nodes);

  overviewVis.selectAll("circle")
      .data(nodes)
    .enter().append("svg:circle")
      .attr("class", function(d) { return getClassName(d, "node"); })
      .attr("name", function(d) { return d.name; })
      .attr("id", function(d) { return cleanUp(d.name); })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .on("click", function(d) { clickHandler(d);})
      .on("mouseover", function(d) {
        mouseHandler(d, true);
        })
      .on("mouseout", function(d) {
        mouseHandler(d, false);
        });

  overviewVis.selectAll("text")
      .data(nodes)
    .enter().append("svg:text")
      .attr("class", function(d) { return getClassName(d, "text"); })
      .attr("name", function(d) { return d.name; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", ".35em")
      //.attr("font-size", function(d) { return d.r; })
      .attr("text-anchor", "middle")
      .on("mouseover", function(d) {mouseHandler(d,true); document.getElementById('instructions_text')
    .textContent = d.name + ', ' + Math.round(d.value / 32.79) + '%';})
      .on("mouseout", function(d) {mouseHandler(d,false);})
      .style("cursor", "pointer")
    //   .on("click", function(d) {return diseaseUrl(d);})
      .style("opacity", function(d) { return showLabelTest(d, 1); })
      .text(function (d) { return d.name; });
  

function deselectAll() {
  for (var n in selectedNodes) {
    unHighlightNode(selectedNodes[n]);
  }
  selectedNodes = [];
}

//normally call with k=1 (k = other things is for zooming; see zoom())
function showLabelTest(d, k) {
  if (d.children) {
    return k*d.r > sizeLabelLimitParent ? 1 : 0;
  } else {
    return k*d.r > sizeLabelLimit ? 1 : 0;
  }
}

// function drawAllEdges(nodes) {
//   for (var i in nodes) {
//     var focalNode = nodes[i];
//     if (focalNode.comorbid) {
//       //find max edge value for this scenario
//       var maxEdgeValue = 0;
//       var highlightComorbidTop = focalNode.comorbid.length;
//       for (var i=0;i<highlightComorbidTop;i++) {
//         //console.log("show edge from", focalNode.name, "to", focalNode.comorbid[i].name, "with weight ", focalNode.comorbid[i].weight);
//         maxEdgeValue = (maxEdgeValue<focalNode.comorbid[i].weight) ? focalNode.comorbid[i].weight : maxEdgeValue;
//       }

//       //calculate line widths for all edges and draw them
//       for (var i=0;i<highlightComorbidTop;i++) {
//         var edgeWidth = (focalNode.comorbid[i].weight/maxEdgeValue)*maxEdgeWidth;
//         if (edgeWidth<minEdgeWidth) { edgeWidth = minEdgeWidth; }
//         // console.log("edge width to", focalNode.comorbid[i].name, "is", edgeWidth);

//         var comorbidNode = getNodeWithName(nodes, focalNode.comorbid[i].name);

//         //draw line from focalNode.x,y to otherNode.x,y with stroke-width edgeWidth
//         overviewVis.append("svg:line")
//           .attr("x1", focalNode.x)
//           .attr("y1", focalNode.y)
//           .attr("x2", comorbidNode.x)
//           .attr("y2", comorbidNode.y)
//           .attr("class", "edge " + cleanUp(focalNode.name))
//           .style("stroke-width", edgeWidth)
//           .style("visibility", "hidden");
//       }
//     }
//   }
// }

function getNodeWithName(nodes, name) {
  for (var i in nodes) {
    if (nodes[i].name == name) { return nodes[i]; }
  }
  return null;
}

// function showComorbidEdges(focalNode, showEdges) {
//   var visibleStateStr = showEdges ? "visible" : "hidden";
//   var endOpacity = showEdges ? 0.1 : 0;
//   var selection = d3.selectAll("."+cleanUp(focalNode.name));
//   //console.log(cleanUp(focalNode.name));
//   if (!selection) { return; }
//   //if we're showing edges, make them visible first
//   if (showEdges) { 
//     selection.style("visibility", visibleStateStr);
//     selection.transition()
//       .duration(500)
//       .style("opacity",endOpacity);
//   }
  
//   //if we're hiding edges, just hide them immediately
//   if (!showEdges) { 
//     selection.style("opacity", endOpacity)
//     selection.style("visibility", visibleStateStr);
//   }
// }

function dimAllOtherNodes(focalNode, dim) {
  // exclude comorbid nodes from dim
  highlightComorbidTop = focalNode.comorbid.length;
  notThese = getTopComorbidNodes(focalNode, highlightComorbidTop);
  //console.log(notThese);

  // exclude currently selected nodes from dim
  for (var i in selectedNodes) {
    notThese.push(selectedNodes[i]);
  }
  
  var filterFn = function(focalNode) {
  	return helpers.isEmpty(focalNode) ? false : notThese.indexOf(focalNode.name) < 0;
  }
  
  //dim the other circles
  var selection = overviewVis.selectAll("circle").filter(filterFn);
  selection.filter(":not(.bright)").classed("dim", dim);
  
  //and the text
  overviewVis.selectAll("text").filter(filterFn).classed("dim", dim);
  
  var textSelection = overviewVis.selectAll("text").filter(function(focalNode) {
  	return helpers.isEmpty(focalNode) ? true : notThese.indexOf(focalNode.name) >= 0;
  });
  
  textSelection.style("opacity", function(focalNode) {
  	//ensure all comorbid labels are displayed or set back to hidden if returning to non-dimmed state
  	return dim ? 1.0 : showLabelTest(focalNode, 1);
  });
}

// function getTopComorbidNodes(focalNode) {
//   highlightComorbidTop = focalNode.comorbid.length;
//   var notThese = [];
//   for (var i=0;i<highlightComorbidTop;i++) {
//     if (focalNode.comorbid) {
//       notThese.push(focalNode.comorbid[i].name);
//     }
//   }
//   notThese.push(focalNode.name);
//   return notThese;
// }

// function outlineNode(name) {
//   d3.select("#"+cleanUp(name)).classed("outline", true);
// }

// function highlightNode(name) {
//   d3.select("#"+cleanUp(name)).classed("bright", true);
//   d3.selectAll("text").filter(function(d,i) { 
//     return d.name==name;
//   }).classed("bright selected", true);
// }

// function unOutlineNode(name) {
//   d3.select("#"+cleanUp(name)).classed("outline", false);
// }

// function unHighlightNode(name) {
//   //console.log("unhighlighting", name);
//   d3.select("#"+cleanUp(name)).classed("bright", false);
//   d3.selectAll("text").filter(function(d,i) {
//   	return helpers.isEmpty(d) ? false : d.name === name; 
//     //return d.name==name;
//   }).classed("bright", false);
// }

function cleanUp(name) {
  return name.toLowerCase().replace(/ /gi, "_").replace(/'/gi, "").replace(/\//gi, "_").replace(",", "");
}

function getClassName(d, s) {
  var classStr = d.children ? "parent" : "child";
  if (d.parent) {
    if (d.parent.name=="diseases") {
      classStr += " " + d.name.toLowerCase().replace(" ", "_");
    } else {
      classStr += " " + d.parent.name.toLowerCase().replace(" ", "_");
    }
  } else {
    classStr += " main";
  }
  classStr += " " + s;
  return classStr; 
}

function zoom(d) {
	node = d;
	
	if (d3.event) {
		var k = r / d.r / 2;
		x.domain([d.x - d.r, d.x + d.r]);
		y.domain([d.y - d.r, d.y + d.r]);
		
		var duration = d3.event.altKey ? 7500 : 750;
		var t = overviewVis.transition().duration(duration);
		
		// don't show any edges if zooming
		t.selectAll("line").style("visibility", "hidden");
		
		// nodes
		t.selectAll("circle")
			.attr("cx", function(d) { return x(d.x); })
			.attr("cy", function(d) { return y(d.y); })
			.attr("r", function(d) { return k * d.r; });
	
		// labels
		t.selectAll("text")
			.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.style("opacity", function(d) { return showLabelTest(d,k); });
	
		d3.event.stopPropagation();
	}

  deselectAll();
}

//TODO: move to unit tests
// function testSelection(errors, debug, expectedNum, key, selector) {
// 	selector = "circle." + minicircleGroup.clsName + "." + selector;
// 	var selection = vis.selectAll(selector)[0];
// 	var actualNum = selection.length;
	
// 	if (expectedNum !== actualNum) {
// 		errors.push("Expected [" + expectedNum + "] " + key + ", but found [" + actualNum + "].");
// 	}
	
// 	else if (debug) {
// 		console.log("[" + actualNum + "] " + key + ", selector: [" + selector + "]");
// 	}
}