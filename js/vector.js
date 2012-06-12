function Vector(x,y)
{
	if(arguments.length == 1 && arguments[0].length == 2)
	{
		if(x.hasOwnProperty('x'))
		{
			this.x = x.x;
			this.y = x.y;
		}
		else
		{
			this.x = x[0];
			this.y = x[1];
		}
	}
	else
	{
		this.x = x;
		this.y = y;
	}
}
	
Vector.prototype.length = function(length)
{
	if(arguments.length)
	{
		//set the length
		return this.normalize(arguments[0]);
	}
	else
	{
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}
}

Vector.prototype.multiply_by_scalar = function(n)
{
	this.x *= n;
	this.y *= n;
	
	return this;
}

Vector.prototype.normalize = function(n)
{	
	var l = this.length();
	if(arguments.length)
	{
		l = l / arguments[0];
	}
	if(l)
	{
		this.x = this.x / l;
		this.y = this.y / l;
	}
	
	return this;
}

Vector.prototype.add = function(V)
{
	return new Vector(this.x + V.x, this.y + V.y);
}

Vector.prototype.subtract = function(V)
{
	return new Vector(this.x - V.x, this.y - V.y);
}

Vector.prototype.midpoint = function(V)
{
	return new Vector((this.x + V.x)/2, (this.y + V.y)/2);
}

Vector.prototype.left_normal = function()
{
	return new Vector(this.y,-this.x);
}

Vector.prototype.right_normal = function()
{
	return new Vector(-this.y,this.x);
}

Vector.prototype.to_array = function()
{
	return [this.x, this.y];
}

Vector.prototype.to_string = function()
{
	return this.x+","+this.y;
}