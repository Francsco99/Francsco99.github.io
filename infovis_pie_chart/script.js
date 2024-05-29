/*
Crea un file json con dei dati bivariati: ci sono 10 data-case e ogni data-case ha due variabili quantitative. 
Prima disegna questo dataset tramite un diagramma a torta in cui la prima variabile quantitativa è utilizzata per l'angolo 
dello spicchio di torta (attento, devi fare una proporzione in modo che la somma dia 360°) e la seconda variabile 
quantitativa è utilizzata per la tonalità di colore dello spicchio. 
Facendo click con il pulsante sinistro del mouse su uno spicchio di torta i due valori per quello spicchio 
di torta si scambiano: la prima variabile viene utilizzata per la tonalità di colore e la seconda per l'angolo 
dello spicchio di torta. Continuando a cliccare si possono trasformare tutti gli spicchi e, volendo, 
tornare alla situazione iniziale. Fai in modo che le transizioni siano progressive e non a salti. 
Usa le scale d3.js per mappare l'intervallo dei valori delle variabili (che deve poter essere arbitrario) 
sull'intervallo dei valori delle coordinate o delle grandezze geometriche (che dipende dalla tua interfaccia).
*/

//Graph dimensions
const margin = 20;
const width = Math.floor(0.8*window.screen.width);
const height =Math.floor(0.8*window.screen.height);

//The radius of the pieplot is half the width or half the height (smallest one)
const radius = Math.min(width,height)/2 - margin
//Data loading
d3.json("data/data.json")
    .then(function(data){
    
    
    // Function to map the second variable to a hue
    const hueScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)]) //second variable
    .range(["#e8e2ab", "#8c2a0a"]); //hue range

    /*
    //Function to map the first variable to an angle
    const valScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.x )])
    .range([0,360])
    */


    // Pie creation
    const pie = d3.pie()
    //.sort((a, b) => a.y - b.y)
    .sort(null)
    .value(function(d){return d.x;}); // same as .value(d => d.x)
    //.value(d => valScale(d.x));

    // Arcs creation
    const arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(0); //if set to a value > 0 you have a donut chart

    // Svg container creation
    const svg = d3.select("body").append("svg") //Select body element from html and append a new svg element
    .attr("width", width+margin) //set the width of svg element
    .attr("height", height+margin) //set the height of svg element
    .append("g") // append a group <g> to contain the pie chart
    .attr("stroke", "black")
    .attr("transform", `translate(${width / 2}, ${height / 2})`); //center the chart in the svg element

    // Drawing of the pie chart segments
    const path = svg.selectAll("path") //select every path in the svg element
    .data(pie(data)) //associate a dataset where pie(data) gives an array of objects that represent the segments of the chart
    .enter()
    .append("path") //add the paths
    .attr("d", arc) //set the arc shape with "d" attribute
    .attr("fill",d=> hueScale(d.data.y)) //use the function to color each segment
    .on("click", function(event,d){
        
        // Swap x and y values
        const temp = d.data.x;
        d.data.x = d.data.y;
        d.data.y = temp;

        // Update the chart with new data
        updateChart(data);
    });

    // Function to update the chart with new data
    function updateChart(data) {
        // Update the pie chart segments
        path.data(pie(data))
            .transition()
            .duration(1000) //transition duration
            .attrTween("d", arcTween) //interpolate data
            .attr("fill", d => hueScale(d.data.y)); //color the arcs
            
    }   
    
    // Function to create smooth transitions between arcs
    function arcTween(a) {
        //a is the new data, this._current is the current state of the arc
        const i = d3.interpolate(this._current, a); //use d3.interpolate to interpolate old data and new data.
        this._current = i(0); // Set initial value for a smooth transition
        return function(t) {
            return arc(i(t)); //calculates the arc path using the interpolated value
        };
    }

    updateChart(data); //call the update function to get the smooth transition for the first click

});