Polygon_area = function(area)
{
	this.el = $(area);
}

Polygon_area.prototype.draw = function(context)
{
	var vertices = [];
	var coords = this.el.attr('coords').split(',');
	var vertices = coords.length / 2;
	context.moveTo(coords[0], coords[1]);
	for(var v=0; v<vertices; v++)
	{
		var vertex = new Vector(coords[v*2], coords[v*2 + 1]);
		context.lineTo(vertex.x, vertex.y);
	}
	context.lineTo(coords[0], coords[1]);
}

Polygon_area.prototype.hit_test_point = function(P)
{
	return false;
}