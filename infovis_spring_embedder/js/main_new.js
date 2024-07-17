(function() {
    // Area di disegno
    const svg = document.getElementById('graph-canvas');
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    var drag_add_link, global, graph, update;
  
    // Tool della toolbar in alto
    const toolbar = document.querySelector('.toolbar');
    const selectTool = document.getElementById('select');
    const addNodeTool = document.getElementById('add-node');
    const addLinkTool = document.getElementById('add-link');
    const editTool = document.getElementById('edit');
    const deleteTool = document.getElementById('add-node');
    const saveSVG = document.getElementById('svg-download');
    const saveJSON = document.getElementById('json-download');
    const uploadJSON = document.getElementById('json-upload');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
  
    const colors = ['red', 'blue', 'green', 'yellow', 'purple']
  
    // Per rendere l'applicazione retrocompatibile
    var _indexOf = Array.prototype.indexOf || function(item) {
      for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) return i;
      }
      return -1;
    };
  
    /* SELECTION - store the selected node */  
    /* EDITING - store the drag mode (either 'drag' or 'add_link') */
  
    global = {
      selection: null,
    };
  
    // create some fake data
    graph = {
      nodes: [
        { id: '1', label:"a", type: 'blue' },
        { id: '2', label:"b", x: 793, y: 364, type: 'blue' },
        { id: '3', label:"c", x: 442, y: 365, type: 'orange' },
        { id: '4', label:"d", x: 467, y: 314, type: 'green' }
      ],
      edges: [
        { id:"1", source: '1', target: '2', label:"a->b" },
        { id:"2", source: '2', target: '3', label:"b->c" },
        { id:"3", source: '3', target: '1', label:"c->a" },
        { id:"4", source: '4', target: '1', label:"d->a" },
        { id:"5", source: '4', target: '2', label:"d->b" }
      ],
  
      last_index: 5,
      links_index: 6,
  
      objectify: function() {
        const idToNodeMap = new Map();
        var nodes = graph.nodes;
        var edges = graph.edges;
        for (let i = 0; i < nodes.length; i++) {
          idToNodeMap.set(nodes[i].id, nodes[i]);
        }
        for (let i = 0; i < edges.length; i++) {
          edges[i].source = idToNodeMap.get(edges[i].source);
          edges[i].target = idToNodeMap.get(edges[i].target);
        }
      },
  
      remove: function(condemned) {
        if (_indexOf.call(graph.nodes, condemned) >= 0) {
          graph.nodes = graph.nodes.filter(function(n) {
            return n !== condemned;
          });
          graph.edges = graph.edges.filter(function(l) {
            return l.source.id !== condemned.id && l.target.id !== condemned.id;
          });
        } else if (_indexOf.call(graph.edges, condemned) >= 0) {
          graph.edges = graph.edges.filter(function(l) {
            return l !== condemned;
          });
        }
      },
  
      add_node: function(type) {
        var newNode;
        newNode = {
          id: graph.last_index++,
          label: "node: " + graph.last_index,
          x: width / 2,
          y: height / 2,
          type: type
        };
        graph.nodes.push(newNode);
        return newNode;
      },
  
      add_link: function(source, target) {
        if (source === target) return null;
  
        var newEdge, i, edges, edge;
        edges = graph.edges;
  
        for (i = 0; i < edges.length; i++) {
          edge = edges[i];
          if (edge.source === source && edge.target === target) {
            alert("errore: arco duplicato");
            return null;
          }
        }
  
        newEdge = {
          id: graph.links_index++,
          label: source.id + "->" + target.id,
          source: source,
          target: target
        };
        graph.edges.push(newEdge);
        return newEdge;
      },
  
      add_modified_link: function(source, target, mod_id, mod_lab) {
        if (source === target) return null;
  
        var newEdge, i, edges, edge;
        edges = graph.edges;
  
        for (i = 0; i < edges.length; i++) {
          edge = edges[i];
          if (edge.source === source && edge.target === target) return null;
        }
  
        newEdge = {
          id: mod_id,
          label: mod_lab,
          source: source,
          target: target
        };
        graph.edges.push(newEdge);
        return newEdge;
      }
    };
  
    graph.objectify();
  
    window.main = function () {
      console.log("INIZIATO IL MAIN");
      var container, library, toolbar;
  
      var svg = d3.select('#graph-canvas');
  
      // Initialize editor at first open
      document.getElementById("node_id").value = "";
      document.getElementById("node_label").value = "";
      document.getElementById("node_type").value = "";
  
      // ZOOM and PAN
      container = svg.append('g');
  
      var zoom = d3.zoom().scaleExtent([0.5, 8]).on('zoom', (event) => {
        global.vis.attr('transform', event.transform);
      });
  
      container.call(zoom);
  
      global.vis = container.append('g');
  
      global.vis.append('rect')
        .attr('class', 'overlay')
        .attr('x', -500000)
        .attr('y', -500000)
        .attr('width', 1000000)
        .attr('height', 1000000)
        .on('click', function () {
          global.selection = null;
          d3.selectAll('.node').classed('selected', false);
          d3.selectAll('.link').classed('selected', false);
        });
  
      global.colorify = d3.scaleOrdinal(d3.schemeCategory10);
  
      // Inizializzazione layout force directed
      global.force = d3.forceSimulation(graph.nodes)
        .force("charge", d3.forceManyBody().strength(-200))
        .force("link", d3.forceLink(graph.edges).distance(100).id(d => d.id))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", () => {
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
          if (!event.active) global.force.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) global.force.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
  
      function isEditable(selection) {
        if (selection !== null) {
          if (_indexOf.call(graph.nodes, selection) >= 0) {
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
            for (let i = 0; i < graph.edges.length; i++) {
              if (graph.edges[i].id === new_id)
                return false;
            }
            return true;
          }
        }
      }
  
      function submit_changes(selection) {
        const mode = isEditable(selection);
  
        if (mode === "node") {
          if (isAvailableId(selection, document.getElementById("node_id").value, mode)) {
            selection.id = document.getElementById("node_id").value;
            selection.label = document.getElementById("node_label").value;
            selection.type = document.getElementById("node_type").value;
            update();
            return true;
          } else {
            alert("Errore, l'id selezionato è già in uso");
            return false;
          }
        } else if (mode === "link") {
          if (isAvailableId(selection, document.getElementById("node_id").value, mode)) {
            const sourceNode = selection.source;
            const targetNode = selection.target;
  
            // Rimuovi l'arco
            graph.remove(selection);
  
            // Aggiungi l'arco modificato
            graph.add_modified_link(sourceNode, targetNode, document.getElementById("node_id").value, document.getElementById("node_label").value);
  
            update();
            return true;
          } else {
            alert("Errore, l'id selezionato è già in uso");
            return false;
          }
        }
        return false;
      }
  
      // Export grafico come SVG
      document.getElementById('svg-download').addEventListener('click', function() {
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg.node());
  
        // Add name spaces.
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
  
        const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "graph.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
  
      document.getElementById('json-download').addEventListener('click', function() {
        const data = JSON.stringify(graph, (key, value) => {
          if (key === "source") return value.id;
          if (key === "target") return value.id;
          return value;
        }, 2);
  
        const jsonBlob = new Blob([data], { type: 'application/json;charset=utf-8' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = jsonUrl;
        downloadLink.download = "graph.json";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
  
      // Importa JSON
      uploadJSON.addEventListener("change", function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
  
        reader.onload = function(event) {
          const importedData = JSON.parse(event.target.result);
          graph.nodes = importedData.nodes;
          graph.edges = importedData.edges;
          graph.last_index = importedData.last_index;
          graph.links_index = importedData.links_index;
          graph.objectify();
          update();
        };
  
        reader.readAsText(file);
      });
  
      update = function () {
        var edges, links, nodes, _ref, _ref1;
  
        // Modifica degli archi
        links = global.vis.selectAll('.link').data(graph.edges, function(d) {
          return d.source.id + "-" + d.target.id;
        });
  
        links.enter().append('line')
          .attr('class', 'link')
          .on('click', function(event, d) {
            global.selection = d;
            d3.selectAll('.link').classed('selected', p => p === d);
            d3.selectAll('.node').classed('selected', false);
            document.getElementById("node_id").value = global.selection.id;
            document.getElementById("node_label").value = global.selection.label;
            document.getElementById("node_type").value = global.selection.type;
          });
  
        links.exit().remove();
  
        // Modifica dei nodi
        nodes = global.vis.selectAll('.node').data(graph.nodes, d => d.id);
  
        nodes_enter = nodes.enter().append('g')
          .attr('class', 'node')
          .call(global.drag)
          .on('click', function(event, d) {
            global.selection = d;
            d3.selectAll('.node').classed('selected', p => p === d);
            d3.selectAll('.link').classed('selected', false);
            document.getElementById("node_id").value = global.selection.id;
            document.getElementById("node_label").value = global.selection.label;
            document.getElementById("node_type").value = global.selection.type;
          });
  
        nodes_enter.append('circle')
          .attr('r', 20)
          .attr('fill', d.type);
  
        nodes_enter.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '.35em')
          .text(d => d.label);
  
        nodes.exit().remove();
  
        nodes = global.vis.selectAll('.node').attr('transform', d => `translate(${d.x},${d.y})`);
  
        // Restart the force simulation.
        global.force.nodes(graph.nodes);
        global.force.force("link").links(graph.edges);
        global.force.alpha(1).restart();
      };
  
      update();
  
      // Gestione strumenti della toolbar
      addNodeTool.addEventListener('click', () => {
        const type = prompt("Enter node type (e.g. blue, orange, green):", "blue");
        if (type) {
          const newNode = graph.add_node(type);
          update();
        }
      });
  
      addLinkTool.addEventListener('click', () => {
        const sourceId = prompt("Enter source node ID:");
        const targetId = prompt("Enter target node ID:");
        const sourceNode = graph.nodes.find(node => node.id == sourceId);
        const targetNode = graph.nodes.find(node => node.id == targetId);
        if (sourceNode && targetNode) {
          graph.add_link(sourceNode, targetNode);
          update();
        } else {
          alert("Invalid source or target node ID.");
        }
      });
  
      deleteTool.addEventListener('click', () => {
        if (global.selection) {
          graph.remove(global.selection);
          global.selection = null;
          update();
        }
      });
  
      editTool.addEventListener('click', () => {
        if (global.selection) {
          const success = submit_changes(global.selection);
          if (success) {
            update();
          }
        }
      });
  
      zoomIn.addEventListener('click', () => {
        container.transition().call(zoom.scaleBy, 1.2);
      });
  
      zoomOut.addEventListener('click', () => {
        container.transition().call(zoom.scaleBy, 0.8);
      });
    };
  
    window.onload = window.main;
  }).call(this);
  