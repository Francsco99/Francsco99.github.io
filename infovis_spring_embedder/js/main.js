// Canvas e dimensioni
const canvas = document.getElementById('graph-canvas');
const width = canvas.clientWidth;
const height = canvas.clientHeight;

// Input range per i parametri della simulazione
const chargeSlider = document.getElementById('charge');
//const linkSlider = document.getElementById('link');
const attractSlider = document.getElementById('attract');

// Interruttore on off per la simulazione
const simulationOffIcon = document.getElementById("force-off");
const simulationOnIcon = document.getElementById("force-on");
// Collegamento degli event listeners ai toggle
simulationOnIcon.addEventListener('click', toggleSimulation);
simulationOffIcon.addEventListener('click', toggleSimulation);

//Input checkbox per i parametri del download json
const nodeLinkList = document.getElementById("node-link-list");
const allGraph = document.getElementById("all-graph-info");


// Colori dei nodi
const colors = ['red', 'blue', 'green', 'purple', 'orange'];

// Gestisce la selezione e il tool corrente
var global = {
  selection: null,
  tool: 'pointer',
  simulationActive : true
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
      if (condemned.type == "bend") {
        var links = graph.links;
        var ends = [];
        var linksToReplace = [];
        for (let i = 0; i < links.length; i++) {
          if (links[i].source === condemned) {
            ends.push(links[i].target);
            linksToReplace.push(links[i]);
          }
          else if (links[i].target === condemned) {
            ends.push(links[i].source);
            linksToReplace.push(links[i]);
          }
        }
        graph.links = graph.links.filter(function(l) {
          return l !== linksToReplace[0] && l !== linksToReplace[1];
        });

        graph.add_link(ends[0], ends[1], true);

        graph.nodes = graph.nodes.filter(function(n) {
          return n !== condemned;
        });
      }
      else {
        graph.nodes = graph.nodes.filter(function(n) {
          return n !== condemned;
        });
        var links = graph.links;
        for (let i = 0; i < links.length; i++) {
          if (links[i].source === condemned || links[i].target === condemned) {
            graph.remove(links[i]);
          }
        }
      }
    }
    // this part is for deleting the single link
    else if (graph.links.indexOf(condemned) >= 0) {
      const source = condemned.source;
      const target = condemned.target;
      graph.links = graph.links.filter(function(l) {
        return l !== condemned;
      });
      if (source.type == "bend") {
        var links = graph.links;
        for (let i = 0; i < links.length; i++) {
          if (links[i].source === source || links[i].target === source) {
            graph.remove(links[i]);
          }
        }
        graph.nodes = graph.nodes.filter(function(n) {
          return n !== source;
        });
      }
      if (target.type == "bend") {
        var links = graph.links;
        for (let i = 0; i < links.length; i++) {
          if (links[i].source === target || links[i].target === target) {
            graph.remove(links[i]);
          }
        }
        graph.nodes = graph.nodes.filter(function(n) {
          return n !== target;
        });
      }
    }
  },

  add_node: (function(type, x=null, y=null) {
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

    var label = newId;

    if (type == "bend") label = "";

    if (x === null) x = width / 2;
    if (y === null) y = height / 2;
  
    newNode = {
      id: newId,
      label: label,
      x: x,
      y: y,
      type: type
    };
  
    // Add the new node to the graph
    graph.nodes.push(newNode);
    return newNode;
  }),

  add_link: (function(source, target, permitBends=false) {
    if (!permitBends && (source.type == "bend" || target.type == "bend")) return null;
    // avoid links to self
    if (source === target) return null;

    var newLink, i, links, link;
    links = graph.links;

    // avoid link duplicates
    for (i = 0; i < links.length; i++) {
      link = links[i];
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

// Funzione principale
function main() {
/*
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

  graph.objectify();*/

  populateGraph(10, 10);

  // Aggiungi event listener agli slider per aggiornare la simulazione quando i valori cambiano
  chargeSlider.addEventListener('input', updateForces);
  //linkSlider.addEventListener('input', updateForces);
  attractSlider.addEventListener('input', updateForces);

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
  
  // Inizializzazione layout force directed
  //.force("link", d3.forceLink(graph.links).distance(+linkSlider.value).id(d => d.id))
  global.simulation = d3.forceSimulation(graph.nodes)
    .force("charge", d3.forceManyBody().strength(-300))
    .force("link", d3.forceLink(graph.links).strength(0.1))
    .force("attract", d3.forceRadial(0, width / 2, height / 2).strength(0.1)) // Forza che tende a tenere i nodi al centro
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
        if (!event.active) 
          global.simulation.alphaTarget(0.5).restart();
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
        if (!event.active)
          global.simulation.alphaTarget(0);
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

// Funzione che aggiorna la visualizzazione del grafo
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
    .attr('class', function(d) {
      if (d.type == "bend") return "node bend";
      return "node";
    })
    .call(global.drag)
    .on('click', function(event, d) {
      // selezione del nodo
      global.selection = d;
      d3.selectAll('.node').classed('selected', p => p === d);
      d3.selectAll('.link').classed('selected', false);

      // visualizzazione statistiche
      visualizeStatistics(d.id, d.label, d.type);
    });

  nodes_enter.append('circle')
    .attr('r', function(d) {
      if (d.type == "bend") return 10;
      return 25})
    .attr('fill', function(d) {
      if (d.type == "bend") return "gray";
      return d.type})

  nodes_enter.append('text')
    .attr('text-anchor', 'middle')
    .attr('user-select', 'none')
    .attr('dy', '.35em')
    .attr('font-size',"20px")
    .text( function(d) {
      if (d.type == "bend") return "";
      return d.label});

  nodes.exit().remove();

  // Aggiorna i nodi esistenti
  nodes.select('circle')
    .attr('fill', function(d) {
      if (d.type == "bend") return "gray";
        return d.type})
  nodes.select('text')
    .text(function(d) {
      if (d.type == "bend") return "";
      return d.label});

  nodes = global.vis.selectAll('.node').attr('transform', d => `translate(${d.x},${d.y})`);

  // Restart the force simulation.
  global.simulation.force("link").links(graph.links);
  global.simulation.nodes(graph.nodes);
  global.simulation.alpha(1).restart();
  
};
  
// Funzione che mostra il selettore dei colori per i nodi
function showLibrary() {
  // Costruzione del contenuto HTML per il color picker
  let colorPickerHtml = '<div id="color-picker">';
  colors.forEach(color => {
    colorPickerHtml += `<div class="color-option" data-color="${color}" style="background-color: ${color};"></div>`;
  });
  colorPickerHtml += '</div>';

  // Inserimento del color picker nell'elemento con id "toolbar-extra"
  $("#toolbar-extra").html(colorPickerHtml);

  // Aggiungere il gestore di eventi per le opzioni di colore
  $(".color-option").on("click", function() {
    const color = $(this).data("color");
    if (color) {
      graph.add_node(color); // Supponendo che graph.add_node() sia una funzione definita altrove
      update(); // Supponendo che update() sia una funzione definita altrove per aggiornare l'interfaccia utente
    }
  });
}

// Funzione che nasconde il selettore colori per i nodi
function hideLibrary() {
  $("#toolbar-extra").html(``);
}

// Funzione per caricare il file json del grafo
function upload(json) {
  // Extract only the necessary attributes for nodes
  graph.nodes = json.nodes.map(node => ({
    id: node.id,
    label: node.label,
    x: node.x,
    y: node.y,
    type: node.type
  }));

  // Extract only the necessary attributes for links
  graph.links = json.links.map(link => ({
    id: link.id,
    label: link.label,
    source: link.source.id,
    target: link.target.id,
    index: link.index
  }));

  graph.objectify();
  update();
}

// Funzione che restituisce il tipo di selezione corrente (nodo o link)
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

// Funzione per aggiornare un nodo o un arco
function submitChanges(selection) {
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

// Funzione per visualizzare le statistiche in alto a sinistra
function visualizeStatistics(id,label,color){
  document.querySelector('.toolbar-left').innerHTML = `
            <span>ID: ${id}</span>
            <span>LABEL: ${label}</span>
            <span>COLOR: ${color}</span>
  `;
}

// Funzione per aggiornare la forza con i valori inseriti tramite gli slider
function updateForces() {
    const chargeValue = +chargeSlider.value;
    //const linkDistance = +linkSlider.value;
    const attractStrength = +attractSlider.value;
    
    global.simulation
        .force("charge", d3.forceManyBody().strength(chargeValue))
        .force("link", d3.forceLink(graph.links).strength(0))
        .force("attract", d3.forceRadial(0, width / 2, height / 2).strength(attractStrength))
        .alpha(1)
        .restart();
}

// Funzione per costruire un grafo random
function populateGraph(numNodes, numLinks){
  // Creazione dei nodi
  for (let i = 1; i <= numNodes; i++) {
    graph.add_node(colors[Math.floor(Math.random() * 5)] ); // Assegna un colore casuale
}
  
  // Creazione degli archi
  let edgeCount = 0;
  while (edgeCount < numLinks) {
    const sourceIndex = Math.floor(Math.random() * graph.nodes.length);
    const targetIndex = Math.floor(Math.random() * graph.nodes.length);
    const source = graph.nodes[sourceIndex];
    const target = graph.nodes[targetIndex];
    
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

// Funzione per gestire l'avvio e l'arresto della simulazione
function toggleSimulation() {
  if (!global.simulationActive) {
    global.simulationActive = true;
    
    global.simulation
      .force("charge", d3.forceManyBody().strength(-300))
      .force("link", d3.forceLink(graph.links).strength(0))
      .force("attract", d3.forceRadial(0, width / 2, height / 2).strength(0.1)); // Forza che tende a tenere i nodi al centro
    
      simulationOnIcon.style.display = 'block';
    simulationOffIcon.style.display = 'none';
  } else if(global.simulationActive){
    global.simulationActive = false;
    
    global.simulation
      .force("charge", d3.forceManyBody().strength(0))
      .force("link", d3.forceLink(graph.links).strength(0))
      .force("attract", d3.forceRadial(0, width / 2, height / 2).strength(0)); // Forza che tende a tenere i nodi al centro
    
      simulationOnIcon.style.display = 'none';
    simulationOffIcon.style.display = 'block';
  }
}

d3.select(window).on('click', function () {
  if (global.selection !== null) {
    d3.select("#delete").classed('active', true);
    d3.select("#delete").classed('unactive', false);

    if (selectionType(global.selection) == "node") {
      if (global.selection.type != "bend") {
        d3.select("#edit").classed('active', true);
        d3.select("#edit").classed('unactive', false);
      }
      else {
        d3.select("#edit").classed('active', false);
        d3.select("#edit").classed('unactive', true);
      }

      d3.select("#add-bend").classed('active', false);
      d3.select("#add-bend").classed('unactive', true);
    }
    else {
      d3.select("#edit").classed('active', true);
      d3.select("#edit").classed('unactive', false);
      d3.select("#add-bend").classed('active', true);
      d3.select("#add-bend").classed('unactive', false);
    }
  }
  else {
    d3.select("#delete").classed('active', false);
    d3.select("#delete").classed('unactive', true);
    d3.select("#edit").classed('active', false);
    d3.select("#edit").classed('unactive', true);
    d3.select("#add-bend").classed('unactive', true);
    d3.select("#add-bend").classed('active', false);

    // Svuota le statistiche
    visualizeStatistics("","","");
  }
});

// Gestione dello strumento puntatore
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

    showLibrary()});

    // Gestione aggiunta archi
d3.select("#add-link")
  .on("click", function () {
    global.tool = "add-link";
    d3.select("#pointer").classed('active', false);
    d3.select("#add-node").classed('active', false);
    d3.select("#add-link").classed('active', true);
    hideLibrary();
  });

// Gestione aggiunta piegamenti
d3.select("#add-bend")
.on("click", function () {
  d3.selectAll('.link').classed('selected', false);
  if (global.selection) {
    if (selectionType(global.selection) == "link") {
      const link = global.selection;
      const sourceNode = link.source;
      const targetNode = link.target;
      const bendNode = graph.add_node("bend", (sourceNode.x + targetNode.x) / 2, (sourceNode.y + targetNode.y) / 2);
      link.target = bendNode;
      graph.add_link(bendNode, targetNode, true);
      global.selection = null;
      update();
    }
  }
});

// Gestione modifica elemento
d3.select("#edit")
  .on("click", function () {
    if (global.selection) {
      if (selectionType(global.selection) == "node") {
        if (global.selection.type == "bend") {
          return;
        }
      }
      const success = submitChanges(global.selection);
      if (success) {
        update();
      }
    }
  });

// Gestione cancellazione elemento
d3.select("#delete")
  .on("click", function () {
    if (global.selection) {
      graph.remove(global.selection);
      global.selection = null;
      update();
    }
  });

// Gestione cancellazione grafo
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

// Add event listener for SVG download
d3.select("#svg-download")
  .on("click", function () {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(document.querySelector('svg'));
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, "graph.svg");
  });

// Add event listener for JSON download
/*d3.select("#json-download")
  .on("click", function () {
    const json = JSON.stringify({ nodes: graph.nodes, links: graph.links });
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, "graph.json");
  });*/


// Gestione upload json
d3.select("#json-upload")
.on("click", function () {
  document.getElementById('json-file-input').click();
});

// Gestione upload file
d3.select("#json-file-input")
  .on("change", function () {
    const file = this.files[0];
    if (file) {
      // Check if the file type is JSON
      if (file.type !== "application/json") {
        swal({
          title: "Error!",
          text: "Please select a JSON file.",
          icon: "error",
          timer: 2000,
          buttons: false
        });

        // Reset the input element
        document.getElementById('json-file-input').value = "";
        return;
      }

      swal({
        title: "Are you sure you want to load a new graph?",
        text: "This operation will overwrite the current graph.",
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
      }).then((willLoad) => {
        if (willLoad) {
          const reader = new FileReader();
          reader.onload = function (event) {
            try {
              const json = JSON.parse(event.target.result);
              upload(json);
              
              // Display success notification
              swal({
                title: "Success!",
                text: "Your graph has been loaded",
                icon: "success",
                timer: 2000,
                buttons: false
              });
            } catch (error) {
              // Display error notification
              swal({
                title: "Error!",
                text: "The graph could not be loaded",
                icon: "error",
                timer: 2000,
                buttons: false
              });
            }
            
            // Reset the input element
            document.getElementById('json-file-input').value = "";
          };
          reader.readAsText(file);
        } else {
          // Reset the input element if the user cancels the operation
          document.getElementById('json-file-input').value = "";
        }
      });
    }
  });

main();