Stage = function()
{
	this.el = $("#stage");
	this.image = this.el.find("IMG");
	this.canvas = document.getElementById('area-canvas');
	this.ctx = this.canvas.getContext('2d');
	this.draw_interval = null;
	this.mouse_x = 0;
	this.mouse_y = 0;
	
	this.init();
}

Stage.POINT_SNAP_THRESHOLD = 12;
Stage.FRAMES_PER_SECOND = 24;

Stage.prototype.draw_point = function(x, y, color, size)
{
	if(!color)
	{
		color = "rgba(255,255,255,1)";
	}
	
	if(!size)
	{
		size = 2;
	}
	
	this.ctx.fillStyle = color;
	this.ctx.beginPath();
	this.ctx.arc(center.x, center.y, size, 0, Math.PI * 2);
	this.ctx.fill();
	this.ctx.closePath();
}

Stage.prototype.on_image_load = function(e)
{
	this.canvas.width = this.image.width();
	this.canvas.height = this.image.height();
	this.el.trigger('image_changed');
}

Stage.prototype.clear = function()
{
	this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
}

Stage.prototype.set_image = function(image_url)
{
	this.image.attr('src', image_url);
}

Stage.prototype.pause_drawing = function()
{
	clearInterval(this.draw_interval);
}

Stage.prototype.start_drawing = function()
{
	this.draw_interval = setInterval(this.draw_frame, (1000/Stage.FRAMES_PER_SECOND));
}

Stage.prototype.draw_frame = function()
{
	$(document).trigger('enter_frame');
}

Stage.prototype.blah = function(e)
{
	console.log('wtf');
}

Stage.prototype.on_canvas_mousedown = function(e)
{
	$(this).trigger('canvas_mousedown');
	$(document).on('mouseup', $.proxy(this.on_mouseup, this));
	
	e.preventDefault();
	return false;
}

Stage.prototype.on_mouseup = function()
{
	$(this).trigger('canvas_mouseup');
	$(document).off('mouseup', $.proxy(this.on_mouseup, this));
}

Stage.prototype.init = function()
{
	this.image.on('load', $.proxy(this.on_image_load, this));
	
	$(this.canvas).on('mousedown', $.proxy(this.on_canvas_mousedown, this));
	$(this.canvas).on('selectstart', function(e){ e.preventDefault(); return false; });
	
	$(this).on('enter_frame', $.proxy(this.blah, this));
	
	this.set_image('images/picture.png');
	this.start_drawing();
	
	var self = this;
	$(document).on('mousemove', function(e){
		var canvas_pos = $(self.canvas).offset();
		self.mouse_x = e.pageX - canvas_pos.left;
		self.mouse_y = e.pageY - canvas_pos.top;
	});
}

