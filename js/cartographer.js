ERRORS = {
	missing_image_url: "Enter the URL of the image you want to create a map for, then click \"OK\""
};

COLOR_NAMES = ['grey', 'red', 'green', 'blue', 'yellow', 'cyan', 'purple'];
COLORS = {
	grey: "rgba(40,40,40, 0.5)",
	red: "rgba(255,0,0, 0.5)",
	green: "rgba(0,255,0, 0.5)",
	blue: "rgba(0,0,255, 0.5)",
	yellow: "rgba(255,255,0, 0.5)",
	cyan: "rgba(0,255,255, 0.5)",
	purple: "rgba(255,0,255, 0.5)"
};

selected_area = null;

map = $("<map/>");
toolbar = null;
stage = null;

$(function(){
	toolbar = new Toolbar();
	stage = new Stage();
	area_list = new Area_list();
	
	draw_controller = new Draw_controller(map, toolbar, stage);
	$(draw_controller).on('draw_new_area', on_draw_new_area);
	$(draw_controller).on('mouse_select', on_mouse_select);
	
	$(document).on('map_change', on_map_change);
	toolbar.set_tool('rect');
	
	$(document).trigger('map_change');
});

function on_mouse_select(e)
{
	var area = get_area_at_point(stage.mouse_x, stage.mouse_y);
	area_list.select_area(area);
}

function get_area_at_point(x, y)
{
	var classes = {
		rect: Rectangle_area,
		circle: Circle_area,
		poly: Polygon_area
	};
	
	var areas = map.find("AREA");
	var l = areas.length;
	var point = new Vector(x, y);
	var i, ret;
	
	ret = false;
	for(i=0; i<l; i++)
	{
		var area = areas[i];
		var shape = $(area).attr('shape');
		if(!classes.hasOwnProperty(shape))
		{
			continue;
		}
		else
		{
			var area_obj = new (classes[shape])(area);
			if(area_obj.hit_test_point(point))
			{
				ret = area;
			}
		}
		
	}
	
	return ret;
}

function on_draw_new_area(e)
{
	var area_count = map.find("AREA").length;
	var color = COLOR_NAMES[area_count % COLOR_NAMES.length];
	var area_title = "Area #"+(area_count + 1);
	var area = $("<area/>");
	
	area.attr({	shape: toolbar.active_tool.shape, 
				coords: toolbar.active_tool.area_coords(),
				title: area_title	});			
	area.data('color', color);
	
	add_area(area);
}

function add_area(area)
{
	map.append(area);
	$(document).trigger('map_change');
}

function on_map_change(e)
{
	area_list.display_map(map);
	render_map_html();
	stage.clear();
	draw_controller.draw_map();
}

function render_map_html()
{
	var map_config_form = $("#map-settings");
	var map_name = map_config_form.find('[name=id]').val();
	
	var img = $("<img/>").attr({src: $("#image-display").find("IMG").attr('src'), usemap: "#"+map_name});
	
	if(map_config_form.find('[name=default_link]').val())
	{
		var default_area = $("<area/>").attr({shape: 'default', href: map_config_form.find('[name=default_link]').val()});
		map.append(default_area);
	}
	
	var wrapper = $("<div/>").append(img, "\r\n", map);
	var html = wrapper.html();
	var code = $("<code/>").text(html.replace(/\s*<area/g, '\r\n\t<area').replace(/<\/map>/, '\r\n</map>'));
	$("#source-code").html(code);
}

function select_area(area)
{
	selected_area = area;
	$(".area").removeClass("ui-state-highlight");
	$(area).addClass("ui-state-highlight");
	$(document).trigger('map_change');
}

function select_area_at_point(x,y)
{
	var match = null;
	var areas = $("#area-list").find(".area");
	var i;
	var hit_test;
	
	for(i=0; i<areas.length; i++)
	{
		var area_div = areas[i];
		var el = $(area_div).data().area;		
		switch($(el).attr('shape'))
		{
			case 'rect':
				hit_test = hit_test_rect_area;
				break;
			case 'circle':
				hit_test = hit_test_circle_area;
				break;
			case 'poly':
				hit_test = hit_test_polygon_area;
				break;
		}
		
		if(hit_test(x, y, el))
		{
			match = area_div;
			break;
		}
	}
	
	select_area(match);
}

function clear_areas()
{
	map.html('');
}

function on_click_set_image_url(e)
{
	var form = $("#image-locator");
	var input = form.find("[name=image_url]");
	var image_url = input.val();
	if(!image_url || image_url.match(/^\s*$/))
	{
		error_message(ERRORS.missing_image_url);
	}
	else
	{
		set_image(image_url);
		input.val('');
		form.dialog('close');
	}
}

function configure_map()
{
	var dialog_div = $("#map-settings");
	var form_cache = {};
	dialog_div.find('[name]').each(function(){
		var el = $(this);
		form_cache[el.attr('name')] = el.val();
	});
	
	dialog_div.dialog({
		title: "Configure Map Settings",
		width: 600,
		modal: true,
		buttons: {
			OK: function(){
				$(this).dialog('close');
				$(document).trigger('map_change');
			},
			Cancel: function(){ 
				$(this).dialog('close'); 
				for(var key in form_cache)
				{
					dialog_div.find('[name='+key+']').val(form_cache[key]);
				}
			}
		}
	});
}

function get_image_url()
{
	$("#image-locator").dialog({
		title: "Enter image URL",
		width: 600,
		modal: true,
		buttons: {
			OK: on_click_set_image_url,
			Cancel: function(){ 
				$(this).find("[name=image_url]").val('');
				$(this).dialog('close'); 
			}
		}
	});
}

function error_message(message)
{
	var error_message = $("<div/>").css("padding", "1em").addClass("ui-state-error ui-corner-all").text(message);
	$("<div/>").append(error_message).dialog({
		title: "Error",
		modal: true
	});
}