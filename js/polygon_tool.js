function Polygon_tool()
{
	this.max_points = 0;
	this.name = "Polygon Area Tool";
	this.shape = "poly";
	this.preview_line_width = 2;
}

Polygon_tool.prototype = new Draw_tool();

Polygon_tool.prototype.add_point_to_path = function(V)
{
	if(this.path.length > 2)
	{
		var O = this.origin();
		var distance_from_origin = V.subtract(O).length();
		if(distance_from_origin < this.minimum_stroke_length)
		{
			this.finish_drawing();
		}
	}
	
	Draw_tool.prototype.add_point_to_path.call(this, V);
}

Polygon_tool.prototype.area_coords = function()
{
	var area_coords = [];
	$(this.path).each(function(){
		area_coords.push(this.x);
		area_coords.push(this.y);
	});
	
	return area_coords.join(',');
}

Polygon_tool.prototype.preview = function(stage)
{
	var origin_point = this.origin();
	if(!origin_point)
	{
		return false;
	}
	else
	{
		var O = this.origin();
		var context = stage.ctx;
		
		context.lineWidth = this.preview_line_width;
		context.strokeStyle = this.preview_stroke_color;
		context.fillStyle = this.preview_fill_color;
		
		context.beginPath();
		context.moveTo(O.x, O.y);
		for(var vertex_index in this.path)
		{
			var vertex = this.path[vertex_index];
			context.lineTo(vertex.x, vertex.y);
		}
		context.lineTo(stage.mouse_x, stage.mouse_y);
		context.stroke();
		context.fill();
		context.closePath();
	}
	
}