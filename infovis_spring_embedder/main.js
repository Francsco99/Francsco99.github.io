const canvas = document.getElementById('graph-canvas');
const width = canvas.clientWidth;
const height = canvas.clientHeight;

// Seleziona gli input slider
const chargeSlider = document.getElementById('charge');
const linkSlider = document.getElementById('link');
const attractSlider = document.getElementById('attract');

// Aggiungi event listener agli slider per aggiornare la simulazione quando i valori cambiano
chargeSlider.addEventListener('input', updateForces);
linkSlider.addEventListener('input', updateForces);
attractSlider.addEventListener('input', updateForces);

var global = {
  selection: null,
  tool: 'pointer'
};

// Definizione del grafo
var graph = {
  nodes: [],
  links: [],

  objectify: function() {
    const idToNodeMap = new Map();
    var nodes = graph.nodes;
    var links = graph.links;
    for (let i = 0; i < nodes.length; i++) {
      idToNodeMap.set(nodes[i].id, nodes[i]);
    }
    for (let i = 0; i < links.length; i++) {
      links[i].source = idToNodeMap.get(links[i].source);
      links[i].target = idToNodeMap.get(links[i].target);
    }
  },

  remove: function(condemned) {
    // remove the given node or link from the graph, also deleting dangling links if a node is removed
    if (graph.nodes.indexOf(condemned) >= 0) {
      graph.nodes = graph.nodes.filter(function(n) {
        return n !== condemned;
      });
      graph.links = graph.links.filter(function(l) {
        return l.source.id !== condemned.id && l.target.id !== condemned.id;
      });
    }
    // this part is for deleting the single link
    else if (graph.links.indexOf(condemned) >= 0) {
      graph.links = graph.links.filter(function(l) {
        return l !== condemned;
      });
    }
  },

  add_node: (function(type) {
    var newNode;
  
    // Gather all existing node IDs and filter out non-integer IDs
    var existingIds = graph.nodes
      .map(function(n) { return parseInt(n.id, 10); })
      .filter(function(id) { return !isNaN(id); });
      
    existingIds.sort(function(a, b) { return a - b; });
  
    // Find the first missing ID in the sequence
    var newId = existingIds.length ? existingIds[existingIds.length - 1] + 1 : 1; // start with 1
    for (var i = 0; i < existingIds.length; i++) {
      if (existingIds[i] !== i + 1) { // IDs should start from 1
        newId = i + 1;
        break;
      }
    }
  
    newNode = {
      id: newId,
      label: newId,
      x: width / 2,
      y: height / 2,
      type: type
    };
  
    // Add the new node to the graph
    graph.nodes.push(newNode);
    return newNode;
  }),

  add_link: (function(source, target) {
    console.log(source, target)
    // avoid links to self
    if (source === target) return null;

    var newLink, i, links, link;
    links = graph.links;

    // avoid link duplicates
    for (i = 0; i < links.length; i++) {
      link = links[i];
      console.log(link.source + " " + link.target);
      if (link.source === source && link.target === target || link.source === target && link.target === source) {
        console.log("errore");
        swal({
          title: "Error!",
          text: "There is already a link",
          icon: "error",
          timer: 2000,
          buttons: false
        });
        return null;
      }
    }
    // Gather all existing links IDs
    var existingIds = links.map(function(n) { return parseInt(n.id, 10); });
    existingIds.sort(function(a, b) { return a - b; });
    
    // Find the first missing ID in the sequence
    var newId = existingIds.length ? existingIds[existingIds.length - 1] + 1 : 1; // start with 1
    for (var i = 0; i < existingIds.length; i++) {
      if (existingIds[i] !== i + 1) { // IDs should start from 1
        newId = i + 1;
        break;
      }
    }

    newLink = {
      id: newId,
      label: source.label + "-" + target.label,
      source: source,
      target: target
    };
    graph.links.push(newLink);
    return newLink;
  })
};


function main() {

  graph.nodes = [
    { id: '1', label:"A", type: 'blue' },
    { id: '2', label:"B", x: 793, y: 364, type: 'blue' },
    { id: '3', label:"C", x: 442, y: 365, type: 'orange' },
    { id: '4', label:"D", x: 467, y: 314, type: 'green' }
  ];

  graph.links = [
    { id:"1", source: '1', target: '2', label:"A-B" },
    { id:"2", source: '2', target: '3', label:"B-C" },
    { id:"3", source: '3', target: '1', label:"C-A" },
    { id:"4", source: '4', target: '1', label:"D-A" },
    { id:"5", source: '4', target: '2', label:"D-B" }
  ];

  graph.objectify();

  populateGraph(100, 200);

  var svg = d3.select('#graph-canvas').attr("fill","white");

  container = svg.append('g');    

  global.vis = container.append('g');
  
  var zoom = d3.zoom().scaleExtent([0.5, 8]).on('zoom', (event) => {
    global.vis.attr('transform', event.transform);
  });

  var zoom = d3.zoom()
  .scaleExtent([0.5, 8])
  .on('zoom', (event) => {
    global.vis.attr('transform', event.transform);
  });

// Apply zoom behavior to the container
svg.call(zoom);

// Add event listener for mouse wheel zooming
svg.on('wheel', (event) => {
  event.preventDefault();
  zoom.scaleBy(svg.transition().duration(50), Math.pow(2, event.deltaY * -0.002));
});

  // WARNING rect size is huge but not infinite. this is a dirty hack
  global.vis.append('rect')
    .attr('class', 'overlay')
    .attr('x', -500000)
    .attr('y', -500000)
    .attr('width', 1000000)
    .attr('height', 1000000)
    .on('click', function (d) {
      // Pulizia della selezione
      global.selection = null;
      d3.selectAll('.node').classed('selected', false);
      d3.selectAll('.link').classed('selected', false);
    });

  global.colorify = d3.scaleOrdinal(d3.schemeCategory10);
  
  // Inizializzazione layout force directed
  global.simulation = d3.forceSimulation(graph.nodes)
    .force("charge", d3.forceManyBody().strength(+chargeSlider.value))
    .force("link", d3.forceLink(graph.links).distance(+linkSlider.value).id(d => d.id))
    .force("attract", d3.forceRadial(0, width / 2, height / 2).strength(+attractSlider.value)) // Forza che tende a tenere i nodi al centro
    .on("tick", () => {
      // Aggiornamento posizione nodi e archi
      global.vis.selectAll('.node')
        .attr('transform', d => `translate(${d.x},${d.y})`);

      global.vis.selectAll('.link')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    });

    global.drag = d3.drag()
    .on('start', (event, d) => {
      if (global.tool !== "add-link") {
        if (!event.active) global.simulation.alphaTarget(0.5).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
    })
    .on('drag', (event, d) => {
      if (global.tool !== "add-link") {
        d.fx = event.x;
        d.fy = event.y;
      } 
      else {
        // Disegna l'arco temporaneo
        if (!global.tempLine) {
          global.tempLine = global.vis.append('line')
            .attr('class', 'drag_link')
            .attr('class', 'link')
            .attr('stroke-width', '8px')
            .attr('stroke', 'black')
            .attr('opacity', '0.3')
            .attr('stroke-linecap','round')
        }
        global.tempLine
          .attr('x1', d.x)
          .attr('y1', d.y)
          .attr('x2', event.x)
          .attr('y2', event.y);
      }
    })
    .on('end', (event, d) => {
      if (global.tool !== "add-link") {
        if (!event.active) global.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      } else {
        // Rimuovi l'arco temporaneo
        if (global.tempLine) {
          global.tempLine.remove();
          global.tempLine = null;
        }

        // Trova il nodo di destinazione
        const [target] = graph.nodes.filter(node => {
          const dx = node.x - event.x;
          const dy = node.y - event.y;
          return Math.sqrt(dx * dx + dy * dy) < 20; // Raggio di tolleranza per il nodo di destinazione
        });

        if (target && target !== d) {
          // Aggiungi il link solo se un nodo di destinazione è trovato
          graph.add_link(d, target);
          update();
        }
      }
    });

  update();
};

function update() {
  var links, nodes;

  // Selezione degli archi
  links = global.vis.selectAll('.link').data(graph.links, function(d) {
    return d.source.id + "-" + d.target.id;
  });

  links.enter().insert('line', '.node') // Inserisci i link prima dei nodi
    .attr('class', 'link')
    .attr('stroke-width', '8px')
    .attr('stroke', 'black')
    .attr('opacity', '0.3')
    .on('click', function(event, d) {
      // selezione dell'arco
      global.selection = d;
      d3.selectAll('.link').classed('selected', p => p === d);
      d3.selectAll('.node').classed('selected', false);

      // visualizzazione statistiche
      visualizeStatistics(d.id,d.label,"");
    });

  links.exit().remove();

  links = global.vis.selectAll('.link')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  // Selezione dei nodi
  nodes = global.vis.selectAll('.node').data(graph.nodes, d => d.id);

  var nodes_enter = nodes.enter().append('g')
    .attr('class', 'node')
    .call(global.drag)
    .on('click', function(event, d) {
      // selezione del nodo
      global.selection = d;
      d3.selectAll('.node').classed('selected', p => p === d);
      d3.selectAll('.link').classed('selected', false);

      // visualizzazione statistiche
      visualizeStatistics(d.id,d.label,d.type);
    });

  nodes_enter.append('circle')
    .attr('r', 25)
    .attr('fill', d => global.colorify(d.type));

  nodes_enter.append('text')
    .attr('text-anchor', 'middle')
    .attr('user-select', 'none')
    .attr('dy', '.35em')
    .attr('font-size',"20px")
    .text(d => d.label);

  nodes.exit().remove();

  // Aggiorna i nodi esistenti
  nodes.select('circle')
    .attr('fill', d => global.colorify(d.type))
  nodes.select('text')
    .text(d => d.label);

  nodes = global.vis.selectAll('.node').attr('transform', d => `translate(${d.x},${d.y})`);

  // Restart the force simulation.
  global.simulation.force("link").links(graph.links);
  global.simulation.nodes(graph.nodes);
  global.simulation.alpha(1).restart();
};


d3.select(window).on('click', function () {
  if (global.selection !== null) {
    d3.select("#delete").classed('active', true);
    d3.select("#delete").classed('unactive', false);
    d3.select("#edit").classed('active', true);
    d3.select("#edit").classed('unactive', false);
  }
  else {
    d3.select("#delete").classed('active', false);
    d3.select("#delete").classed('unactive', true);
    d3.select("#edit").classed('active', false);
    d3.select("#edit").classed('unactive', true);

    // Svuota le statistiche
    visualizeStatistics("","","");
  }
});

d3.select("#pointer")
    .on("click", function () {
      global.tool = "pointer";
      d3.select("#pointer").classed('active', true);
      d3.select("#add-node").classed('active', false);
      d3.select("#add-link").classed('active', false);
      hideLibrary();
    });

// Gestione strumenti della toolbar
d3.select("#add-node")
  .on("click", function () {
    global.tool = "add-node";
    d3.select("#pointer").classed('active', false);
    d3.select("#add-node").classed('active', true);
    d3.select("#add-link").classed('active', false);

    showLibrary();
  });

function showLibrary() {
  $("#toolbar-extra").html(`
    <div id="color-picker">
        <div class="color-option" data-color="red" style="background-color: ` + global.colorify("red") + ` ;"></div>
        <div class="color-option" data-color="blue" style="background-color: ` + global.colorify("blue") + ` ;"></div>
        <div class="color-option" data-color="green" style="background-color: ` + global.colorify("green") + ` ;"></div>
        <div class="color-option" data-color="violet" style="background-color: ` + global.colorify("violet") + ` ;"></div>
        <div class="color-option" data-color="orange" style="background-color: ` + global.colorify("orange") + ` ;"></div>
    </div>`);
  $(".color-option").on("click", function() {
    const color = $(this).data("color");
    if (color) {
      graph.add_node(color);
      update();
    }
    });
}

function hideLibrary() {
  $("#toolbar-extra").html(``);
}

d3.select("#add-link")
  .on("click", function () {
    global.tool = "add-link";
    d3.select("#pointer").classed('active', false);
    d3.select("#add-node").classed('active', false);
    d3.select("#add-link").classed('active', true);
    hideLibrary();
  });

d3.select("#edit")
  .on("click", function () {
    if (global.selection) {
      const success = submit_changes(global.selection);
      if (success) {
        update();
      }
    }
  });

d3.select("#delete")
  .on("click", function () {
    if (global.selection) {
      graph.remove(global.selection);
      global.selection = null;
      update();
    }
  });

d3.select("#delete-graph")
  .on("click", function() {
    // Mostra l'alert di conferma
    swal({
      title: "Are you sure to remove the graph?",
      text: "Once deleted, you will not be able to recover this graph!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        swal("Your graph has been deleted!", {
          icon: "success",
          timer: 2000,
          buttons: false
        });
        graph.nodes = [];
        graph.links = [];
        update();
      } else {
        swal("The graph is unchanged!", {
          timer: 2000,
          buttons: false
        });
        return
        }
    });
  });  

function selectionType(selection){
  if (selection !== null) {
    if (graph.nodes.indexOf(selection) >= 0) {
      return "node";
    } else {
      return "link";
    }
    }
  return null;
}

function isAvailableId(selection, new_id, mode) {
  if (mode === "node") {
      if (selection.id === new_id)
          return true;
      else {
          for (let i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].id === new_id)
              return false;
          }
          return true;
      }
  }
  else if (mode === "link") {
    if (selection.id === new_id)
      return true;
    else {
      for (let i = 0; i < graph.links.length; i++) {
        if (graph.links[i].id === new_id)
          return false;
      }
      return true;
    }
  }
}

function submit_changes(selection) {
  const mode = selectionType(selection);
  if (mode === "node") {
    $(".toolbar-left").html(`
      <div class="edit-form">
          <label for="node_id">ID:</label>
          <span id="node_id">${selection.id}</span>
          <label for="node_label">LABEL:</label>
          <input type="text" id="node_label" size="4" value="${selection.label}" />
          <label for="node_color">COLOR:</label>
          <select id="node_color">
              <option value="red" ${selection.type === "red" ? "selected" : ""}>Red</option>
              <option value="blue" ${selection.type === "blue" ? "selected" : ""}>Blue</option>
              <option value="green" ${selection.type === "green" ? "selected" : ""}>Green</option>
              <option value="violet" ${selection.type === "violet" ? "selected" : ""}>Violet</option>
              <option value="orange" ${selection.type === "orange" ? "selected" : ""}>Orange</option>
          </select>
      </div>
    `);
    
    $("#node_label").on("input", () => {
      selection.label = document.getElementById("node_label").value;
      update();
    });
    
    $("#node_color").on("change", () => {
      selection.type = document.getElementById("node_color").value;
      update();
    });

  } else if (mode === "link") {
    $(".toolbar-left").html(`
      <div class="edit-form">
          <label for="node_id">ID:</label>
          <span id="node_id">${selection.id}</span>
          <label for="node_label">LABEL:</label>
          <input type="text" id="node_label" size="4" value="${selection.label}" />
      </div>
    `);
    
    $("#node_label").on("input", () => {
      selection.label = document.getElementById("node_label").value;
      update();
    });
  }
  
  return false;
}

function visualizeStatistics(id,label,color){
  document.querySelector('.toolbar-left').innerHTML = `
            <span>ID: ${id}</span>
            <span>LABEL: ${label}</span>
            <span>COLOR: ${color}</span>
  `;
}

d3.select("#svg-download")
  .on("click", function () {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(document.querySelector('svg'));
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, "graph.svg");
  });

d3.select("#json-download")
  .on("click", function () {
    const json = JSON.stringify({ nodes: graph.nodes, links: graph.links });
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, "graph.json");
  });

  function updateForces() {
    const chargeValue = +chargeSlider.value;
    const linkDistance = +linkSlider.value;
    const attractStrength = +attractSlider.value;

    global.simulation
        .force("charge", d3.forceManyBody().strength(chargeValue))
        .force("link", d3.forceLink(graph.links).distance(linkDistance).id(d => d.id))
        .force("attract", d3.forceRadial(0, width / 2, height / 2).strength(attractStrength))
        .alpha(1)
        .restart();
  }

function populateGraph(numNodes, numLinks){
  // Creazione dei nodi
  for (let i = 1; i <= numNodes; i++) {
    graph.add_node(['red', 'blue', 'green', 'violet', 'orange'][Math.floor(Math.random() * 5)] ); // Assegna un colore casuale
}
  
  // Creazione degli archi
  let edgeCount = 0;
  while (edgeCount < numLinks) {
    const sourceIndex = Math.floor(Math.random() * graph.nodes.length);
    const targetIndex = Math.floor(Math.random() * graph.nodes.length);
    const source = graph.nodes[sourceIndex];
    const target = graph.nodes[targetIndex];

    console.log(source + " " + target);

    var valid = true;
    // Evita autocollegamenti e duplicati
    if (sourceIndex !== targetIndex) {
      for (i = 0; i < graph.links.length; i++) {
        link = graph.links[i];
        if (link.source === source && link.target === target || link.source === target && link.target === source) {
          valid = false;
          break;
        }
      }
      if (valid) {
        graph.add_link(source, target);
        edgeCount++;
      }
    }
  }
  return 
}

main();