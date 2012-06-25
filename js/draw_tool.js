function Draw_tool()
{	
	this.max_points = 0;
	this.path = [];
	this.drawing = false;
	this.minimum_stroke_length = 8;
	this.stroke_origin = null;
	this.name = "Draw Tool";
	this.shape = "";
	this.preview_fill_color = "rgba(255,255,255,0.25)";
	this.preview_stroke_color = "#fff";
	this.preview_line_width = 1;
}

Draw_tool.prototype.start_drawing = function(x, y)
{
	this.path = [];
	this.add_point_to_path(new Vector(x, y));
	this.drawing = true;
	$(this).trigger('start');
}

Draw_tool.prototype.stop_drawing = function()
{
	this.drawing = false;
	$(this).trigger('stop');
}

Draw_tool.prototype.finish_drawing = function()
{
	$(this).trigger('finish');
	this.stop_drawing();
}

Draw_tool.prototype.begin_stroke = function(x, y)
{	
	this.stroke_origin = new Vector(x, y);
	if(!this.path.length || !this.drawing)
	{
		this.start_drawing(x, y);
	}
}

Draw_tool.prototype.end_stroke = function(x, y)
{
	var O = this.stroke_origin;
	var V = new Vector(x, y);
	
	var last_point = this.path[this.path.length - 1];
	var stroke_length = V.subtract(last_point).length();
	
	if(stroke_length >= this.minimum_stroke_length)
	{
		this.add_point_to_path(V);
		this.stroke_origin = null;
	}
}

Draw_tool.prototype.add_point_to_path = function(V)
{
	this.path.push(V);
	if(this.path.length == this.max_points)
	{
		this.finish_drawing();
	}
}

Draw_tool.prototype.origin = function()
{
	ret = false;
	if(this.path[0])
	{
		ret = this.path[0];
	}
	
	return ret;
}

Draw_tool.prototype.preview = function(stage)
{
	var context = stage.ctx;
	var origin_point;
	
	if(!this.path.length)
	{
		return false;
	}
	else
	{
		origin_point = this.origin();
	}
	
	context.strokeStyle = '#fff';
	context.lineWidth = 1;
	
	context.beginPath();	
	context.moveTo(origin_point.x, origin_point.y);
	for(var vertex_index in this.path)
	{
		var vertex = this.path[vertex_index];
		context.lineTo(vertex.x, vertex.y);
	}
	context.lineTo(stage.mouse_x, stage.mouse_y);
	context.stroke();
	context.closePath();
}