// lib_plot.js

var setup_plot = function(plot_info) {

  var g = plot_info.global;

  g.angle_dom = [], g.angle_rng = [];

  axes_info = plot_info.axes;
  for (var axis_name in axes_info) {
    axis_info = axes_info[axis_name];
    g.angle_dom.push(axis_name);
    g.angle_rng.push(axis_info.angle);
  }

  g.angle_f     = d3.scale.ordinal().domain(g.angle_dom).range(g.angle_rng);

  var radii     = [ g.inner_radius, g.outer_radius ]
  g.radius_f    = d3.scale.linear().range(radii);

  g.color_f     = d3.scale.category10();

  g.transform   = 'translate(' + g.x_off + ',' + g.y_off + ')';

  g.svg         = d3.select(g.selector + ' .chart')
                    .append('svg')
                      .attr('width',      g.x_max)
                      .attr('height',     g.y_max)
                      .append('g')
                        .attr('transform',  g.transform);

  // console.log('plot_info', plot_info); //T
};


var degrees = function(radians) { return radians / Math.PI * 180 - 90; }


var display_plot = function(plot_info) {

  var g = plot_info.global;

  // Set the radius domain.

  var index   = function(d) { return d.index; };

  var extent  = d3.extent(g.nodes, index);
  g.radius_f.domain(extent);

  // Draw the axes.

  var transform = function(d) {
    return 'rotate(' + degrees( g.angle_f(d.key) ) + ')';
  };

  var x1 = g.radius_f(0) - 10;
  var x2 = function(d) { return g.radius_f(d.count) + 10; };
  var x3 = function(d) { return (g.radius_f(d.count) + 50); };

  g.svg.selectAll('.axis')
    .data(g.nodesByType)
    .enter().append('line')
      .attr('class', 'axis')
      .attr('transform', transform)
      .attr('x1', x1)
      .attr('x2', x2)
      
 var rotandtransform   = function(d) {
    return  'translate(-80,10) rotate(' + degrees( g.angle_f(d.key) ) + ') rotate('+(-degrees( g.angle_f(d.key) ))+', '+(g.radius_f(d.count) + 50)+', 0)';
  };
  
g.svg.selectAll('.axislabl')
    .data(g.nodesByType)
    .enter().append('text')
      .attr('class', 'axislabl')
      .attr('transform', rotandtransform)
      .attr("x", x3)
      .text( function(d) { 
        if(d.key=='target') return 'skills';
        if(d.key=='source') return 'people';
        return 'projects';
      })
      .attr("font-family", "monospace")
      .attr("font-size", "50px")
      .style('fill', '#ddd');
  // Draw the links.

  var path_angle  = function(d) { return g.angle_f(d.type);    };
  var path_radius = function(d) { return g.radius_f(d.node.index); };

  g.svg.append('g')
    .attr('class', 'links')
    .selectAll('.link')
    .data(g.links)
    .enter().append('path')
      .attr('d', make_link().angle(path_angle).radius(path_radius) )
      .attr('class', 'link')
      .on('mouseover', on_mouseover_link)
      .on('mouseout',  on_mouseout);

  // Draw the nodes.  Note that each node can have up to two connectors,
  // representing the source (outgoing) and target (incoming) links.

  var connectors  = function(d) { return d.connectors; };
  var cx          = function(d) { return g.radius_f(d.node.index); };
  var fill        = function(d) { return g.color_f(d.packageName); };
  var positioner  = function(type, len) { 
        if(type=='target'){
                return '-'+(8*len+20)+', 0';
        }else if(type=='source'){
                return '-'+(8*len+20)+', 7';
        }else{
                return '5, -5';
        }
  };

  var transform   = function(d) {
    return 'rotate(' + degrees( g.angle_f(d.type) ) + ')';
  };
  var rotandtransform   = function(d) {
          if(d.type=='target' || d.type=='source'){
            return 'translate('+positioner(d.type, d.node.name.length/1.2) + ') rotate(' + degrees( g.angle_f(d.type) ) + ') rotate('+(-degrees( g.angle_f(d.type) ))+', ' + g.radius_f(d.node.index) + ', 0)';
          }else{
            return 'translate('+positioner(d.type, d.node.name.length/1.2) + ') rotate(' + degrees( g.angle_f(d.type) ) + ') rotate('+(-2*degrees( g.angle_f(d.type) ))+', ' + g.radius_f(d.node.index) + ', 0)';
          }
  };
  gEnter = g.svg.append('g')
    .attr('class', 'nodes')
    .selectAll('.node')
    .data(g.nodes)
    .enter().append("svg:a")
      .attr("xlink:href", function(d){ return d.ref;})
      .attr("target","_blank")
      .attr('class', 'node')
      .style('fill', fill)
      .selectAll('g')
      .data(connectors)
      .enter().append('g');
      
  gEnter.append('ellipse')
    .attr('transform', transform)
    .attr('cx', cx)
    .attr('rx', 4)
    .attr('ry', 4)
    .on('mouseover', on_mouseover_node)
    .on('mouseout',  on_mouseout);

  gEnter.append('text')
      .attr('class', function(d) { return 'labl '+d.type;})
      .attr('transform', rotandtransform)
      .attr("x", cx)
      .text( function(d) { return d.node.name;})
      .attr("font-family", "monospace")
      .attr("font-size", "12px")
      .on('mouseover', on_mouseover_node)
    .on('mouseout',  on_mouseout);

    
};
