Toolbar = function()
{
	this.active_tool = null;
	this.last_tool = null;
	this.el = $("#toolbar");
	this.init();
};

Toolbar.TOOLS = {	select: new Select_tool(),
					rect: new Rectangle_tool(),
					circle: new Circle_tool(),
					poly: new Polygon_tool()
};

Toolbar.prototype.set_tool = function(tool)
{
	this.last_tool = this.active_tool;
	this.active_tool = Toolbar.TOOLS[tool];
	this.el.find(".tool").removeClass("active-tool");
	$("#"+tool+"-tool-button").addClass("active-tool");
	$(this).trigger('change_tool');
}

Toolbar.prototype.on_click_tool_button = function(e)
{
	var button = $(e.currentTarget);
	var tool_name = button.attr('id').match(/\b([a-z]+)-tool-button\b/).join().split('-')[0];
	this.set_tool(tool_name);
}

Toolbar.prototype.on_click_dialog_button = function(e)
{
	var button = $(e.currentTarget);
	var dialog_id = "#"+button.data('dialog');
}

Toolbar.prototype.init = function()
{
	this.el.on('click', '.tool', $.proxy(this.on_click_tool_button, this));
	this.el.on('click', '.dialog', $.proxy(this.on_click_dialog_button, this));
	
	this.el.find("BUTTON").each(function(){
		var button = $(this);
		var button_config = {
			text: false
		};
		
		var icon_class = button.attr('class').match(/icon-[a-z0-9-]+/);
		if(icon_class)
		{
			button_config.icons = {
				primary: "ui-"+(icon_class.join())
			};
		}
		
		button.button(button_config);
	});
	
	this.set_tool('rect');
}