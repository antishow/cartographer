function Select_tool()
{
	this.max_points = 1;
	this.name = "Area Select Tool";
}

Select_tool.prototype = new Draw_tool();

Select_tool.prototype.preview = function()
{
	return false;
}

Select_tool.prototype.end_stroke = function()
{
	return false;
}

Select_tool.prototype.start_drawing = function(x, y)
{
	this.finish_drawing();
}