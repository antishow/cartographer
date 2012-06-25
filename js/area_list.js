function Area_list()
{
	this.el = $("#area-list");
	this.el.on('click', '.area', $.proxy(this.on_area_div_click, this));
	this.el.on('dblclick', '.area', $.proxy(this.on_area_doubleclick, this));
	this.selected_area = null;
}

Area_list.prototype.get_div_area = function(div)
{
	return ($(div).data('area'))[0];
}

Area_list.prototype.on_area_div_click = function(e)
{
	var area = this.get_div_area(e.currentTarget);
	this.select_area(area);
}

Area_list.prototype.select_area = function(area)
{
	var self = this;
	this.el.find('.area').each(function(){
		var div = $(this);
		var div_area = self.get_div_area(div);
		if(area == div_area)
		{
			$(div_area).data('selected', !$(div_area).data('selected'));
		}
		else
		{
			$(div_area).data('selected', false);
		}
	});
	
	$(document).trigger('map_change');
}

Area_list.prototype.on_area_doubleclick = function(e)
{

}

Area_list.prototype.add_area = function(area_index, area)
{
	area = $(area);
	var color = area.data('color');
	var shape = area.attr('shape');
	var area_title = area.attr('title') || "Area #"+(area_index+1);
	var area_class = ["area ui-widget-content ui-corner-all", color, shape];
	if(area.data('selected'))
	{
		area_class.push('ui-state-highlight');
	}
	var area_class = area_class.join(' ');
	var icon = "<div class=\"ui-icon\"></div>";
	var title = "<span class=\"title\">"+area_title+"</span>";
	
	var area_div = $("<div/>").addClass(area_class).data({area: area}).append(icon, title);
	this.el.prepend(area_div);
}

Area_list.prototype.display_map = function(map)
{
	this.el.html('');
	var map_areas = map.find("AREA");
	if(map_areas.length)
	{
		map_areas.each($.proxy(this.add_area, this));
	}
	else
	{
		this.el.html("<p>No areas</p>");
	}
}