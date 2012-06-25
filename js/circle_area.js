Circle_area = function(area)
{
	this.el = $(area);
}

Circle_area.prototype.draw = function(context)
{
	var vertices = [];
	var coords = this.el.attr('coords').split(',');	
	
	var x = coords[0];
	var y = coords[1];
	var radius = coords[2];
	var bottom = coords[3];
	
	context.arc(x, y, radius, 0, Math.PI * 2);
}

Circle_area.prototype.hit_test_point = function(P)
{
	var coords = this.el.attr('coords').split(',');
	var center = new Vector(coords[0], coords[1]);
	var distance_from_center = P.subtract(center).length();
	var radius = coords[2];	
	
	return (distance_from_center <= radius);
}