ERRORS = {
	missing_image_url: "Enter the URL of the image you want to create a map for, then click \"OK\""
};

TOOLS = {
	select: "Area Select Tool",
	rect: "Rectangle Area Tool",
	circle: "Circle Area Tool",
	poly: "Polygon Area Tool"
};

COLORS = [
	'grey',
	'red',
	'green',
	'blue',
	'yellow',
	'cyan',
	'purple'
];

POINT_SNAP_THRESHOLD = 12;

canvas = null;
ctx = null;

active_tool = null;
frame_interval = null;
frames_per_second = 24;

drawing = false;
drawing_points = null;
max_points = null;

mouse_x = null;
mouse_y = null;

area_counter = 0;
map_changed = false;
selected_area = null;

$(function(){
	$(document).on('click', '#set-image-url', on_click_set_image_url);
	
	$(document).on('click', '.tool', on_click_tool);
	$(document).on('click', '.area', on_click_area);
	$(document).on('dblclick', '.area', on_doubleclick_area);
	$(document).on('click', '#image-select-button', get_image_url);
	$(document).on('click', '#configure-map-button', configure_map);
	$(document).on('delete', on_press_delete);
	
	$(document).on('map_change', on_map_change);
	
	$(document).on('mousedown', '#area-canvas', on_canvas_mousedown);
	$(document).on('mousemove', on_mouse_move);
	
	$(document).on('keydown keyup', on_key);
	
	init_toolbar();
	set_image('images/picture.png');
	set_tool('rect');
	
	frame_interval = setInterval(on_frame, (1000/frames_per_second));
	
	canvas = document.getElementById('area-canvas');
	ctx = canvas.getContext('2d');
	
	$(document).trigger('map_change');
});

function edit_area(area_div)
{
	var map_area = $(area_div).data().area;
	var dialog_div = $("#area-settings");
	
	dialog_div.find('[name]').each(function(){
		var name = $(this).attr('name');
		$(this).val(map_area.attr(name));
	});
	
	dialog_div.dialog({
		title: "Area Settings",
		modal: true,
		width: 600,
		buttons: {
			OK: function(){
				$(this).find("[name]").each(function(){
					var input = $(this);
					map_area.attr(input.attr('name'), input.val());
				})
				$(this).dialog('close');
				$(document).trigger('map_change');
			},
			Cancel: function(){
				$(this).dialog('close');
			}
		}
	});
}

function on_doubleclick_area(e)
{
	var area = $(e.currentTarget);
	edit_area(area);
}

function delete_area(area)
{
	$(area).remove();
}

function on_press_delete(e)
{
	if(selected_area)
	{
		delete_area(selected_area);
		select_area(null);
	}
}

function on_map_change(e)
{
	map_changed = true;
	render_map_html();
}

function on_key(e)
{
	switch(e.keyCode)
	{
		case 27:
			$(document).trigger('escape');
			break;
		case 13:
			$(document).trigger('enter');
			break;
		case 8:
			//Disable the backspace-to-go-back feature. but still let someone erase the content of a field.
			if(document.activeElement.tagName.toLowerCase() == 'body')
			{
				e.preventDefault();
				$(document).trigger('delete');
			}
			break;
	}
}

function stop_interval()
{
	clearInterval(frame_interval);
}

function on_frame()
{
	if(map_changed || drawing)
	{
		render_canvas();
	}
}

function on_click_area(e)
{
	var area = $(e.currentTarget);
	select_area(area);
}

function render_map_html()
{
	var map_config_form = $("#map-settings");
	var map_name = map_config_form.find('[name=id]').val();
	var map = $("<map/>").attr('id', map_name);
	var img = $("<img/>").attr({src: $("#image-display").find("IMG").attr('src'), usemap: "#"+map_name});
	
	if(map_config_form.find('[name=default_link]').val())
	{
		var default_area = $("<area/>").attr({shape: 'default', href: map_config_form.find('[name=default_link]').val()});
		map.append(default_area);
	}
	
	var areas = $("#area-list").find(".area");
	var count = areas.length;
	
	for(i=count-1; i>=0; i--)
	{
		var data = $(areas[i]).data();
		map.append(data.area);
	}
	
	var wrapper = $("<div/>").append(img, "\r\n", map);
	var html = wrapper.html();
	var code = $("<code/>").text(html.replace(/\s*<area/g, '\r\n\t<area').replace(/<\/map>/, '\r\n</map>'));
	$("#source-code").html(code);
}

function render_canvas()
{
	ctx.clearRect(0,0,canvas.width,canvas.height);
	draw_areas();
	if(drawing)
	{
		draw_user_activity();
	}
	map_changed = false;
}

function draw_user_activity()
{
	switch(active_tool)
	{
		case TOOLS.rect:
			preview_rectangle();
			break;
		case TOOLS.circle:
			preview_circle();
			break;
		case TOOLS.poly:
			preview_polygon();
			break;
	}
}

function preview_rectangle()
{
	var origin_point = drawing_points[0];
	var mouse_coords = canvas_mouse_coords();
	var left = Math.min(origin_point[0], mouse_coords[0]);
	var top = Math.min(origin_point[1], mouse_coords[1]);
	var width = Math.abs(mouse_coords[0] - origin_point[0]);
	var height = Math.abs(mouse_coords[1] - origin_point[1]);
	
	ctx.fillStyle = "rgba(255,255,255,0.4)";
	ctx.strokeStyle = "#FFF";
	ctx.lineWidth = 2;
	
	draw_point_dot(origin_point);
	ctx.moveTo(origin_point[0], origin_point[1]);
	ctx.lineTo(mouse_coords[0], mouse_coords[1]);
	ctx.stroke();
	ctx.fillRect(left,top,width,height);
}

function preview_circle()
{
	var origin_point = new Vector(drawing_points[0]);
	var end_point = new Vector(canvas_mouse_coords());
	var center = origin_point.midpoint(end_point);
	var radius = end_point.subtract(center).length();
	
	draw_point_dot(origin_point);
	
	ctx.fillStyle = "rgba(255,255,255,0.4)";
	ctx.strokeStyle = "#FFF";
	ctx.lineWidth = 2;
	
	ctx.beginPath();
	ctx.moveTo(origin_point.x, origin_point.y);
	ctx.lineTo(end_point.x, end_point.y);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
	ctx.fill();
}

function preview_polygon()
{
	var origin_point = new Vector(drawing_points[0]);
	
	ctx.fillStyle = "rgba(255,255,255,0.4)";
	ctx.strokeStyle = "#FFF";
	ctx.lineWidth = 2;
	
	//draw a dot at each point drawn
	for(var i=0; i<drawing_points.length; i++)
	{
		var point = drawing_points[i];
		draw_point_dot(point);
	}
	
	//draw the line connecting the dots
	ctx.beginPath();
	ctx.moveTo(origin_point.x, origin_point.y);
	
	ctx.lineWidth = 2;
	for(var i=0; i<drawing_points.length; i++)
	{
		var point = new Vector(drawing_points[i]);
		ctx.lineTo(point.x, point.y);
	}
	
	//draw a line from the last dot to the mouse
	var mouse_coords = canvas_mouse_coords();
	ctx.lineTo(mouse_coords[0], mouse_coords[1]);
	ctx.stroke();
	ctx.fill();
}

function draw_point_dot(point)
{
	var V = new Vector(point);
	
	ctx.beginPath();
	ctx.arc(V.x, V.y, 2, 0, Math.PI*2, true); 
	ctx.closePath();
	ctx.fill();
}

function draw_areas()
{
	var areas = $("#area-list").find(".area");
	var count = areas.length;
	if(count)
	{
		for(var i=count-1;i>=0;i--)
		{
			var area_div = areas[i];
			var area_color = $(area_div).find('.ui-icon').css('background-color');
			var area = $.data(area_div).area;
			var coords = area.attr('coords');
			var shape = area.attr('shape');
	
			ctx.fillStyle = area_color;
			ctx.beginPath();
			switch(shape)
			{
				case 'rect':
					var coord_array = coords.split(',');
					var left = coord_array[0];
					var top = coord_array[1];
					var right = coord_array[2];
					var bottom = coord_array[3];
					ctx.moveTo(left, top);
					ctx.lineTo(right,top);
					ctx.lineTo(right,bottom);
					ctx.lineTo(left,bottom);
					ctx.lineTo(left,top);
					break;
				case 'circle':
					var coord_array = coords.split(',');
					var center_x = coord_array[0];
					var center_y = coord_array[1];
					var radius = coord_array[2];
					ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
					break;
				case 'poly':
					var coord_array = coords.split(',');
					var vertices = coord_array.length / 2;
					ctx.moveTo(coord_array[0], coord_array[1]);
					for(var v=0; v<vertices; v++)
					{
						var vertex = new Vector(coord_array[v*2], coord_array[v*2 + 1]);
						ctx.lineTo(vertex.x, vertex.y);
					}
					ctx.lineTo(coord_array[0], coord_array[1]);
			}
			
			if($(area_div).hasClass('ui-state-highlight'))
			{
				ctx.strokeStyle = "#000";
				ctx.lineWidth = 4;
				ctx.lineCap = 'round';
				ctx.stroke();
			}
			ctx.fill();
		}
	}
}

function on_canvas_mousedown(e)
{
	$(document).on('mouseup', on_canvas_mouseup);
	switch(active_tool)
	{
		case TOOLS.select:
			select_area_at_point(e.offsetX, e.offsetY);
			break;
		case TOOLS.rect:
			rect_at_point(e.offsetX, e.offsetY);
			break;
		case TOOLS.circle:
			circle_at_point(e.offsetX, e.offsetY);
			break;
		case TOOLS.poly:
			poly_at_point(e.offsetX, e.offsetY);
			break;
	}
}

function on_canvas_mouseup(e)
{
	$(document).off('mouseup', on_canvas_mouseup);
	
	var canvas_pos = new Vector(canvas_mouse_coords());
	if(drawing_points.length)
	{
		var last_point = new Vector(drawing_points[drawing_points.length-1]);
		if(canvas_pos.subtract(last_point).length() > POINT_SNAP_THRESHOLD)
		{
			draw_point(canvas_pos.x,canvas_pos.y);
		}
	}
}

function start_drawing(x, y, points)
{
	select_area(null);
	drawing_points = [];
	max_points = points;
	drawing = true;
	draw_point(x,y);
	$(document).on('escape', cancel_drawing);
}

function draw_point(x,y)
{
	drawing_points.push([x,y]);
	if(drawing_points.length == max_points)
	{
		finish_drawing();
	}
}

function cancel_drawing()
{
	drawing_points = [];
	drawing = false;
	$(document).off('escape', cancel_drawing);
	$(document).trigger('map_change');
}

function finish_drawing()
{
	create_new_area(active_tool, drawing_points)
	drawing = false;
	$(document).off('escape', cancel_drawing);
}

function create_new_area(type, points)
{
	var area;
	
	switch(type)
	{
		case TOOLS.rect:
			area = rectangle_area(points);
			break;
		case TOOLS.circle:
			area = circle_area(points);
			break;
		case TOOLS.poly:
			area = polygon_area(points);
			break;
		default:
			console.log("No constructor yet");
			return false;
	}
	
	add_new_area(area);
}


function rectangle_area(points)
{
	var top, left, right, bottom = null;
	for(var index in points)
	{
		var p = new Vector(points[index]);
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
	
	var area = $("<AREA/>");
	area.attr('coords', area_coords.join(','));
	area.attr('shape', 'rect');
	
	return area;
}

function circle_area(points)
{
	var origin_point = new Vector(points[0]);
	var end_point = new Vector(points[1]);
	
	var center = origin_point.midpoint(end_point);
	var radius = end_point.subtract(center).length();
	
	var area_coords = [Math.floor(center.x), Math.floor(center.y), Math.floor(radius)];
	var area = $("<AREA/>");
	area.attr('coords', area_coords.join(','));
	area.attr('shape', 'circle');
	
	return area;
}

function polygon_area(points)
{
	var area_coords = [];
	for(var index in points)
	{
		area_coords.push(new Vector(points[index]).to_string());
	}
	
	var area = $("<AREA/>");
	area.attr('coords', area_coords.join(','));
	area.attr('shape', 'poly');
	
	return area;
}

function select_area(area)
{
	selected_area = area;
	$(".area").removeClass("ui-state-highlight");
	$(area).addClass("ui-state-highlight");
	$(document).trigger('map_change');
}

function add_new_area(area)
{
	area_counter++;
	
	var area_div = $("<div/>").addClass('area '+area.attr('shape')+' ui-widget-content ui-corner-all');
	var color = COLORS[area_counter % COLORS.length];
	area_div.addClass(color);
	var icon = "<div class=\"ui-icon\"></div>";
	var title = "<span class=\"title\">Area #"+area_counter+"</span>";
	$(area).attr('title', "Area #"+area_counter);
	area_div.append(icon, title).data('area', area);
	
	$("#area-list").prepend(area_div);
	select_area(area_div);
}

function rect_at_point(x,y)
{
	if(!drawing)
	{
		start_drawing(x,y,2);
	}
	else
	{
		draw_point(x,y);
	}
}

function circle_at_point(x,y)
{
	if(!drawing)
	{
		start_drawing(x,y,2);
	}
	else
	{
		draw_point(x,y);
	}
}

function poly_at_point(x,y)
{
	if(!drawing)
	{
		start_drawing(x,y,0);
	}
	else
	{
		var V = new Vector(x,y);
		var O = new Vector(drawing_points[0]);
		if(V.subtract(O).length() < POINT_SNAP_THRESHOLD)
		{
			finish_drawing();
		}
		else
		{
			draw_point(x,y);
		}
	}
}

function on_mouse_move(e)
{
	mouse_x = e.pageX;
	mouse_y = e.pageY;
}

function canvas_mouse_coords()
{
	var canvas_pos = $(canvas).offset();
	return [(mouse_x - canvas_pos.left), (mouse_y - canvas_pos.top)];
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

function hit_test_rect_area(x, y, area)
{
	var coords = $(area).attr('coords').split(',');
	
	var left = coords[0];
	var top = coords[1];
	var right = coords[2];
	var bottom = coords[3];
	
	var ret = ((x >= left) && (x <= right) && (y >= top) && (y <= bottom));
	return ret;
}

function hit_test_circle_area(x, y, area)
{
	var test_point = new Vector(x, y);
	var coords = $(area).attr('coords').split(',');
	var center = new Vector(coords[0], coords[1]);
	var distance_from_center = test_point.subtract(center).length();
	var radius = coords[2];	
	
	return (distance_from_center <= radius);
}

function area_to_polygon(area)
{
	var x, y;
	var ret = [];
	var coords = $(area).attr('coords'); //.split(',');
	coords = coords.split(',');
	
	while(coords.length)
	{
		x = coords.shift();
		y = coords.shift();
		ret.push(new Vector(x,y));
	}
	
	return ret;
}  

function hit_test_polygon_area(x, y, area)
{
	var poly = area_to_polygon(area);
	var pt = {x:x, y:y};
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

function set_image(image_url)
{
	var img = $("#image-display").find("IMG");
	
	clear_areas();  
	
	img.attr('src', image_url);
	img.on('load', function(){
		canvas.width = img.width();
		canvas.height = img.height();
	});
}

function clear_areas()
{
	$("#area-list").html('');
	area_counter = 0;
}

function init_toolbar()
{
	$("#toolbar").find("BUTTON").each(function(){
		var el = $(this);
		var button_config = {
			text: false
		};
		
		var icon_class = el.attr('class').match(/icon-[a-z0-9-]+/);
		if(icon_class)
		{
			button_config.icons = {
				primary: "ui-"+(icon_class.join())
			};
		}
		
		el.button(button_config);
	});
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

function on_click_tool(e)
{
	var el = $(e.currentTarget);
	var tool_name = el.attr('id').match(/\b([a-z]+)-tool-button\b/).join().split('-')[0];
	set_tool(tool_name);
}

function set_tool(tool)
{
	active_tool = TOOLS[tool];
	$("#toolbar").find(".tool").removeClass("active-tool");
	$("#"+tool+"-tool-button").addClass("active-tool");
}

function error_message(message)
{
	var error_message = $("<div/>").css("padding", "1em").addClass("ui-state-error ui-corner-all").text(message);
	$("<div/>").append(error_message).dialog({
		title: "Error",
		modal: true
	});
}