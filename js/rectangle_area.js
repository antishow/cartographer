Rectangle_area = function(area)
{
	this.el = $(area);
}

Rectangle_area.prototype.draw = function(context)
{
	var vertices = [];
	var coords = this.el.attr('coords').split(',');	
	
	var left = coords[0];
	var top = coords[1];
	var right = coords[2];
	var bottom = coords[3];
	
	vertices.push(new Vector(left, top));
	vertices.push(new Vector(right,top));
	vertices.push(new Vector(right,bottom));
	vertices.push(new Vector(left,bottom))
	
	context.moveTo(left, top);
	context.lineTo(right, top);
	context.lineTo(right, bottom);
	context.lineTo(left, bottom);
	context.lineTo(left, top);
}

Rectangle_area.prototype.hit_test_point  = function(P)
{
	var coords = this.el.attr('coords').split(',');
	
	var left = coords[0];
	var top = coords[1];
	var right = coords[2];
	var bottom = coords[3];
	
	return ((P.x >= left) && (P.x <= right) && (P.y >= top) && (P.y <= bottom));
}