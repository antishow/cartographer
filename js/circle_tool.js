function Circle_tool()
{
	this.max_points = 2;
	this.name = "Circle Area Tool";
	this.shape = "circle";
	this.preview_line_width = 2;
}

Circle_tool.prototype = new Draw_tool();

Circle_tool.prototype.area_coords = function()
{
	var O = this.origin();
	var P = this.path[1];
	
	var center = O.midpoint(P);
	
	var x = Math.floor(center.x);
	var y = Math.floor(center.y);
	var radius = Math.floor(center.subtract(O).length());
		
	var area_coords = [x, y, radius];
	return area_coords.join(',');
}


Circle_tool.prototype.preview = function(stage)
{
	Draw_tool.prototype.preview.call(this, stage);
	
	var origin_point = this.origin();
	if(!origin_point)
	{
		return false;
	}
	else
	{
		var O = this.origin();
		var P = new Vector(stage.mouse_x, stage.mouse_y);
		
		var center = O.midpoint(P);
		var radius = center.subtract(O).length();
		
		var context = stage.ctx;
		context.lineWidth = this.preview_line_width;
		context.strokeStyle = this.preview_stroke_color;
		context.fillStyle = this.preview_fill_color;
		
		context.beginPath();
		context.arc(center.x, center.y, radius, 0, Math.PI * 2);
		context.stroke();
		context.fill();
		context.closePath();
	}
	
}