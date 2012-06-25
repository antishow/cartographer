function Rectangle_tool()
{
	this.max_points = 2;
	this.name = "Rectangle Area Tool";
	this.shape = "rect";
	this.preview_line_width = 2;
}

Rectangle_tool.prototype = new Draw_tool();

Rectangle_tool.prototype.area_coords = function()
{
	var top, left, right, bottom = null;
	for(var vertex_index in this.path)
	{
		var p = this.path[vertex_index];
		if(top == undefined || p.y < top)
		{
			top = p.y
		}
		if(bottom == undefined || p.y > bottom)
		{
			bottom = p.y
		}
		if(left == undefined || p.x < left)
		{
			left = p.x;
		}
		if(right == undefined || p.x > right)
		{
			right = p.x;
		}
	}
		
	var area_coords = [left,top,right,bottom];
	return area_coords.join(',');
}


Rectangle_tool.prototype.preview = function(stage)
{
	Draw_tool.prototype.preview.call(this, stage);
	
	var origin_point = this.origin();
	if(!origin_point)
	{
		return false;
	}
	else
	{
		var x = Math.min(origin_point.x, stage.mouse_x);
		var y = Math.min(origin_point.y, stage.mouse_y);
		var width = Math.abs(stage.mouse_x - origin_point.x);
		var height = Math.abs(stage.mouse_y - origin_point.y);
		
		var context = stage.ctx;
		context.lineWidth = this.preview_line_width;
		context.strokeStyle = this.preview_stroke_color;
		context.fillStyle = this.preview_fill_color;
		
		context.beginPath();
		context.fillRect(x, y, width, height);
		context.moveTo(x, y);
		context.lineTo(x + width, y);
		context.lineTo(x + width, y + height);
		context.lineTo(x, y + height);
		context.lineTo(x, y);
		context.stroke();
		context.closePath();
	}
	
}