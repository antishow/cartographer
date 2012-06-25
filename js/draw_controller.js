Draw_controller = function(map, toolbar, stage)
{
	this.map = map;
	this.set_toolbar(toolbar);
	this.set_stage(stage);
	this.drawing = false;
}

Draw_controller.prototype.set_toolbar = function(toolbar)
{
	this.toolbar = toolbar;
	$(toolbar).on('change_tool', $.proxy(this.on_change_tool, this));
}

Draw_controller.prototype.set_stage = function(stage)
{
	this.stage = stage;
	$(this.stage).on('canvas_mousedown', $.proxy(this.on_canvas_mousedown, this));
	$(this.stage).on('canvas_mouseup', $.proxy(this.on_canvas_mouseup, this));
}

Draw_controller.prototype.pick_up_tool = function(tool)
{
	this.put_down_tool(toolbar.last_tool);
	$(tool).on('start', $.proxy(this.on_tool_start, this));
	$(tool).on('stop', $.proxy(this.on_tool_stop, this));
	$(tool).on('finish', $.proxy(this.on_tool_draw, this));
}

Draw_controller.prototype.put_down_tool = function(tool)
{
	$(tool).off('start', $.proxy(this.on_tool_start, this));
	$(tool).off('stop', $.proxy(this.on_tool_stop, this));
	$(tool).off('finish', $.proxy(this.on_tool_draw, this));
}

Draw_controller.prototype.on_canvas_mousedown = function(e)
{
	this.toolbar.active_tool.begin_stroke(stage.mouse_x, stage.mouse_y);
}

Draw_controller.prototype.on_canvas_mouseup = function(e)
{
	this.toolbar.active_tool.end_stroke(stage.mouse_x, stage.mouse_y);
}

Draw_controller.prototype.on_change_tool = function(e)
{
	this.pick_up_tool(toolbar.active_tool);
}

Draw_controller.prototype.on_tool_start = function(e)
{
	$(document).on('enter_frame', $.proxy(this.on_draw_frame, this));
	this.drawing = true;
}

Draw_controller.prototype.on_tool_stop = function(e)
{
	$(document).off('enter_frame', $.proxy(this.on_draw_frame, this));
	stage.clear();
	this.draw_map();
	this.drawing = false;
}

Draw_controller.prototype.on_tool_draw = function(e)
{
	if(toolbar.active_tool instanceof Select_tool)
	{
		$(this).trigger('mouse_select');
	}
	else
	{
		$(this).trigger('draw_new_area');
	}
}

Draw_controller.prototype.draw_map = function()
{
	var self = this;
	map.find("AREA").each(function(){
		self.draw_area(this);
	});
}

Draw_controller.prototype.draw_area = function(area)
{
	var fill_color = COLORS[$(area).data('color')];
	var context = stage.ctx;
	context.fillStyle = fill_color;
	
	var area_obj;
	switch($(area).attr('shape'))
	{
		case 'rect':
			area_obj = new Rectangle_area(area);
			break;
		case 'poly':
			area_obj = new Polygon_area(area);
			break;
		case 'circle':
			area_obj = new Circle_area(area);
			break;
	}
	
	
	context.beginPath();
	area_obj.draw(context);
	
	var shadowColor = context.shadowColor;
	var shadowOffsetX = context.shadowOffsetX;
	var shadowOffsetY = context.shadowOffsetY;
	var shadowBlur = context.shadowBlur;
		
	if($(area).data('selected'))
	{
		
		context.shadowColor = "rgba(255,255,255,0.5)";
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 8;
		
		context.strokeStyle = "#000";
		context.lineWidth = 2;
		context.stroke();
	}
	context.fill();
	context.closePath();
	
	context.shadowColor = shadowColor;
	context.shadowOffsetX = shadowOffsetX;
	context.shadowOffsetY = shadowOffsetY;
	context.shadowBlur = shadowBlur;
}

Draw_controller.prototype.on_draw_frame = function(e)
{
	stage.clear();
	this.draw_map();
	toolbar.active_tool.preview(stage);
}
