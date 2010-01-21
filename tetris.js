//really simple tetris in canvas element
//2009 obneq

document.onkeyup=key;

var shapes = [b_shape, s_shape, z_shape, i_shape, l_shape, r_shape, t_shape];
var colors = ["rgb(13, 13, 13)",   "rgb(200, 13, 13)",
              "rgb(13, 200, 13)",  "rgb(13, 13, 200)",
              "rgb(200, 200, 13)", "rgb(200, 13, 200)",
              "rgb(13, 200, 200)", "rgb(200, 200, 200)"];

var levels  = [888, 666, 555, 444, 404, 333, 303, 222, 202, 111, 101];
var run;

function board(x, y){
  //constructs a new empty board
  this.x=x;
  this.y=y;
  this.val = function(x,y){
    var board=new Array(x);
    for(var i=0; i<x; i++)
      board[i]=new Array(y);
    return board;
  }(x, y);
  
  this.max_pos = y;

  this.add = function(s){
    //shapes get added to the board only after
    //they cant be moved anymore

    //d is a shortcut, this "pattern" is used
    //everywhere...
    var d = s.Shape.data[s.Rotation];
    for(var i=0; i<d.x; i++)
      for(var j=0; j<d.y; j++)
        //FIXME: indexing of shapes and board is braindamaged.
        //its [y][x] for shapes and [x][y] for the board!
        if(d.val[j][i])
          this.val[s.Xpos+i][s.Ypos+j] = s.Shape.color;
  }
  
  this.check_lines=function(){
    //this function checks the board
    //for full lines and collapses them
    for(var i=1; i<this.y; i++)
      if (this.check_line(i))
        this.scroll(i);
    view.update();
  }

  this.check_line=function(l){
    for(var i=0; i<this.x; i++)
      if(!this.val[i][l])
        return false;
    this.max_pos++;
    status.lines++;
    status.check_level();
    return true;
  }
  
  this.scroll=function(l){
    while(--l)
      for(var i=0; i<this.x; i++)
        this.val[i][l+1]=this.val[i][l];
  }
}

function shape (){
  //constructs a new random shape
  this.Xpos = 4;
  this.Ypos = 0;
  this.Shape=shapes[Math.floor(Math.random()*7)]
  this.Rotation = 0;

  this.move=function(x,y){
    //move if new position is valid
    var d=this.Shape.data[this.Rotation];
    var newX = this.Xpos + x;
    var newY = this.Ypos + y;
    //enforce board bounds
    newX=Math.max(0, Math.min(newX, board.x - d.x));
    newY=Math.max(0, Math.min(newY, board.y - d.y));
    //check for obstacles on board
    if(this.check_move(newX, newY)){
      this.Xpos = newX;
      this.Ypos = newY;
    }
    view.update();
  }

  this.rotate = function(r){
    //rotate if new position is valid
    //make cw and ccw rotation work
    var newrot = (this.Rotation+r)%this.Shape.rotations;
    if (newrot<0)
      newrot=this.Shape.rotations+newrot;
    //check for obstacles on board
    if (this.check_rotation(newrot))
      this.Rotation = newrot;
    view.update();
  }
  
  this.drop=function(){
    while(!this.stuck())
      this.Ypos+=1;
    view.update();
  }
}

//dont mind the weird indexes, see above...
shape.prototype.check_move=function(newX, newY){
  var d = this.Shape.data[this.Rotation];
  for(var i=0; i<d.x; i++)
    for(var j=0; j<d.y; j++)
      if(d.val[j][i] && board.val[newX + i][newY + j])
        return false;
  return true;
}

shape.prototype.check_rotation=function (r){
  var d = this.Shape.data[r];
  if(this.Ypos+d.y > board.y || this.Xpos+d.x > board.x)
    return false;
  for(var i=0; i<d.x; i++)
    for(var j=0; j<d.y; j++)
      if(d.val[j][i] && board.val[this.Xpos + i][this.Ypos + j])
        return false;
  return true;
}

shape.prototype.stuck=function (){
  var d = this.Shape.data[this.Rotation];
  if(this.Ypos + d.y==board.y)
    return true;
  for(i=0; i<d.x; i++)
    for(j=0; j<d.y; j++)
      if(d.val[j][i] && board.val[this.Xpos + i][this.Ypos + j + 1])
        return true;
  return false;
}

function view(size){
  //constructs the view
  this.canvas = document.getElementById("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.ctx.strokeStyle = colors[0];
  this.xsize=board.x*size;
  this.ysize=board.y*size;
  
  this.update=function(){
    //draw the board and the current shape
    var d=current.Shape.data[current.Rotation];
    this.ctx.clearRect(0, 0, this.xsize, this.ysize);
    this.draw_board();
    for (var i=0; i<d.y; i++)
      for (var j=0; j<d.x; j++)
        if(d.val[i][j]) {
          this.ctx.fillStyle = colors[current.Shape.color];
          this.ctx.fillRect((current.Xpos + j) * size,
                            (current.Ypos + i) * size, size, size);
          this.ctx.strokeRect((current.Xpos + j) * size,
                              (current.Ypos + i) * size, size, size);
        }
  }
  
  this.draw_board=function(){
    //draw the board
    for (var i=board.max_pos; i<board.y; i++)
      for(var j=0; j<board.x; j++){
        var b=board.val[j][i];
        if(b){
          this.ctx.fillStyle=colors[b];
          this.ctx.fillRect(j * size, i * size, size, size);
          this.ctx.strokeRect(j * size, i * size, size, size);
        }
      }
  }
}

function preview(size){
  //constructs the preview
  this.canvas = document.getElementById("preview");
  this.ctx = this.canvas.getContext("2d");
  this.ctx.strokeStyle = colors[0];

  this.update=function(){
    this.ctx.clearRect(0, 0, 4*size, 4*size);
    var d=next.Shape.data[next.Rotation];
    for (var i=0; i<d.y; i++)
      for (var j=0; j<d.x; j++)
        if(d.val[i][j]) {
          this.ctx.fillStyle = colors[next.Shape.color];
          this.ctx.fillRect(j*size, i*size, size, size);
          this.ctx.strokeRect(j*size, i*size, size, size);
        }
  }
}

function status(){
  this.lines=0;
  this.level=0;
  var s=document.getElementById("status");
  this.check_level=function(){
    if(this.lines%10==0){
      clearInterval(run);
      this.level++;
      run=setInterval(step, levels[this.level]);
      this.update();
    }
  }
  this.update=function(){
    s.innerHTML="lines: "+this.lines+" level: "+this.level;
  }
}

function key(e){
  //stolen from the internet...
  var evt=(e)?e:(window.event)?window.event:null;
  if(evt){
    var key=(evt.charCode)?evt.charCode: 
      ((evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0));
    //vi-style keys. you are allowed to move a shape up for now.
    if(key=="74")
      current.move(0, 1);
    else if(key=="75")
      current.move(0, -1);
    else if(key=="72")
      current.move(-1, 0);
    else if(key=="76")
      current.move(1, 0);
    else if(key=="65")
      current.rotate(-1);
    else if(key=="70")
      current.rotate(1);
    else if(key=="32")
      current.drop();
  }
}

function step(){
  //the main loop
  if(current.stuck()){
    //the board starts at top left... more braindamage
    board.max_pos=Math.min(current.Ypos, board.max_pos);
    board.add(current);
    if(board.max_pos<=0)
      clearInterval(run);
    //FIXME: add scoring
    board.check_lines();
    current = next;
    next = new shape();
    preview.update();
    status.update();
  } else
    current.Ypos += 1;
  view.update();
}

function new_game(){
  //board size
  board   = new board(10,20);
  //size of one unit in pixel
  next    = new shape();
  current = new shape();
  view    = new view(20);
  preview = new preview(20);
  status  = new status();

  status.update();
  preview.update();
  view.update();
  //go!
  run=setInterval(step, 666);
}

