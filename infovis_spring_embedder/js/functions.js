function isEditable(selection){
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

//non serve
  function showEdit(selection_to_show) {
    if (isEditable(selection_to_show) === "node") {
      document.getElementById("node_id").value = selection_to_show.id;
      document.getElementById("node_label").value = selection_to_show.label;
      document.getElementById("node_type").value = selection_to_show.type;
    }
    else if (isEditable(selection_to_show) === "link") {
      document.getElementById("node_id").value = selection_to_show.id;
      document.getElementById("node_label").value = selection_to_show.label;
      document.getElementById("node_type").value = "";
    }
  }

  // funzione per colorare le icone e mostrare l'editor 
  d3.select(window).on('click', function () {
      if (global.selection !== null) {
        d3.selectAll("#trashIcon").attr("href", "img/red_trash.jpg");
      }
      else {
        d3.selectAll("#trashIcon").attr("href", "img/trash.jpg");
      }        
  });

  d3.select(".overlay").on('click', function () {
    if (global.selection !== null)
        showEdit(global.selection);
    else {
        document.getElementById("node_id").value = "1";
        document.getElementById("node_label").value = "2";
        document.getElementById("node_type").value = "3";
    }
  });

  update();

  global.tool = 'pointer';
  global.new_link_source = null;
  global.vis.on('mousemove.add_link', (function (d) {
    // check if there is a new link in creation
    var p;
    if (global.new_link_source != null) {
      // update the draggable link representation
      p = d3.mouse(global.vis.node());
      return global.drag_link.attr('x1', global.new_link_source.x).attr('y1', global.new_link_source.y).attr('x2', p[0]).attr('y2', p[1]);
    }
  })).on('mouseup.add_link', (function (d) {
    global.new_link_source = null;

    // remove the draggable link representation, if exists
    if (global.drag_link != null) return global.drag_link.remove();
  }));

  // la stringa s diventa un array di byte (rappresentati come interi a 8 bit)
  function encode(s) {
    var out = [];
    for (let i = 0; i < s.length; i++) {
      out[i] = s.charCodeAt(i);
    }
    return new Uint8Array(out);
  }

  // For the clockwise order
  function orderlink(centerNode, listOfLinktoSort) {

    //listOfLinktoSort = [ obj = {id: "", label: "" , x: "" , y: "", type: "" } ... {...}  ]

    const center = {x:centerNode.x, y:centerNode.y};

    var startAng;
    listOfLinktoSort.forEach(point => {
      var ang = Math.atan2(point.y - center.y, point.x - center.x);
      if(!startAng) startAng = ang 
      else {
        if (ang < startAng){  // ensure that all points are clockwise of the start point
          ang += Math.PI * 2;
        }
      }
      point.angle = ang; // add the angle to the point
    });
    // Sort clockwise;
    listOfLinktoSort.sort((a,b) => a.angle - b.angle);

    /*
      for ANTI CLOCKWISE use this sniplet
    // reverse the order
    const ccwPoints = listOfLinktoSort.reverse();
    // move the last point back to the start
    ccwPoints.unshift(ccwPoints.pop());
      */

    //print
    var result = [];
    for (let i = 0; i < listOfLinktoSort.length ; i++)
      result.push(listOfLinktoSort[i].id);
    return result;
  }

  /* SIAMO ARRIVATI QUI */

  function neighborsOfNode(node) {
    var result = [];
    for (let j = 0; j < graph.edges.length ; j++){
      if (node.id === graph.edges[j].source.id){
        result.push(graph.edges[j].target)
      }
      else if (node.id === graph.edges[j].target.id){
        result.push(graph.edges[j].source)
      }
    }
    return result;
  }

  function createResult() {
    var listaNodi = [];
    var listaLink = [];

    for (let i = 0; i < graph.nodes.length ; i++){
      let node = {
        id: graph.nodes[i].id,
        label: graph.nodes[i].label,
        order: orderlink( graph.nodes[i], neighborsOfNode(graph.nodes[i]) ),
        color: graph.nodes[i].type,
        x: graph.nodes[i].x,
        y: graph.nodes[i].y
      };
      listaNodi.push(node);
    }
    for (let j = 0; j < graph.edges.length ; j++){
      let link = {
        id: graph.edges[j].id,
        label: graph.edges[j].label,
        source: graph.edges[j].source.id,
        target: graph.edges[j].target.id
      };
      listaLink.push(link);
    }
    return {
      nodes: listaNodi,
      edges: listaLink
    };
  }

  // Json trascription of the graph
  var button = document.getElementById("json-download");
  button.addEventListener( 'click', function() {
    var result = createResult();
    var data = encode(JSON.stringify(result, null, "\t"));

    // for browser downloading
    var blob = new Blob([data], {type: 'application/octet-stream'});

    url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'graph.json');

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent( event );
  });

  // Inizio Load Json
  var json;

  document.getElementById("json-upload").addEventListener('change', handleFileSelect, false);

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    // files is a FileList of File objects. List some properties.

    for (var i = 0, f; f = files[i]; i++) {
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function (theFile) {
        return function (e) {
          console.log('e readAsText = ', e);
          console.log('e readAsText target = ', e.target);
          try {
            json = JSON.parse(e.target.result);

            let listaNodi = [];

            for (let i = 0; i < json.nodes.length ; i++) {

              let node = {
                id: json.nodes[i].id,
                label: json.nodes[i].label,
                x: json.nodes[i].x,
                y: json.nodes[i].y,
                type: json.nodes[i].color,
                fixed: true
              };

              listaNodi.push(node);
            }
            graph.last_index = json.nodes.length;
            graph.links_index = json.edges.length;
            
            graph.nodes = listaNodi;
            graph.edges = json.edges;
            graph.objectify();
            update();

          } catch (ex) {
            alert('ex when trying to parse json = ' + ex);
          }
        }
      })(f);
      reader.readAsText(f);
    }

  }

  return d3.selectAll('.toolbar-icon').on('click', function () {
    var new_tool, nodes;
    d3.selectAll('.toolbar-icon').classed('active', false);
    d3.select(this).classed('active', true);
    selectedTool = $(this).data('toolbar-icon'); // ricava il nome del tool
    nodes = global.vis.selectAll('.node');
    if (selectedTool === 'add_link' && global.tool !== 'add_link') {
      // remove drag handlers from nodes
      nodes.on('mousedown.drag', null).on('touchstart.drag', null);
      // add drag handlers for the add_link tool
      nodes.call(drag_add_link);
    } else if (new_tool !== 'add_link' && global.tool === 'add_link') {
      // remove drag handlers for the add_link tool
      nodes.on('mousedown.add_link', null).on('mouseup.add_link', null);
      // add drag behavior to nodes
      nodes.call(global.drag);
    }
    if (selectedTool === 'add_node') {
      //library.show();
    } else {
      //library.hide();
    }
    return global.tool = selectedTool;
  });

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