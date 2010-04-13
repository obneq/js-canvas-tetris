//really simple tetris in canvas element
//2009, 2010 obneq

document.onkeyup=key;

var colors = ["rgb(13, 13, 13)",   "rgb(200, 13, 13)",
              "rgb(13, 200, 13)",  "rgb(13, 13, 200)",
              "rgb(200, 200, 13)", "rgb(200, 13, 200)",
              "rgb(13, 200, 200)", "rgb(200, 200, 200)"];

var levels  = [777, 666, 555, 444, 404, 333, 303, 222, 202, 111, 101];
var run;
var shapes = [  [ [[0,0],[1,0],[0,1],[1,1]] ], //box

                [ [[1,0],[1,1],[1,2],[1,3]],
                  [[0,1],[1,1],[2,1],[3,1]] ], //line

                [ [[0,0],[0,1],[1,1],[1,2]],
                  [[1,0],[2,0],[0,1],[1,1]] ], //s

                [ [[1,0],[0,1],[1,1],[0,2]],
                  [[0,0],[1,0],[1,1],[2,1]] ], //z

                [ [[1,0],[2,0],[1,1],[1,2]],
                  [[0,0],[0,1],[1,1],[2,1]],
                  [[1,0],[1,1],[0,2],[1,2]],
                  [[0,1],[1,1],[2,1],[2,2]] ], //r

                [ [[1,0],[1,1],[1,2],[2,2]],
                  [[0,1],[1,1],[2,1],[2,0]],
                  [[0,0],[1,0],[1,1],[1,2]],
                  [[0,1],[1,1],[2,1],[0,2]] ], //l

                [ [[0,0],[1,0],[2,0],[1,1]],
                  [[0,0],[0,1],[1,1],[0,2]],
                  [[0,2],[1,2],[2,2],[1,1]],
                  [[1,1],[2,0],[2,1],[2,2]] ],  ]; //t

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

  this.add = function(s){
    //shapes are added to the board after
    //they cant be moved anymore
    var d=s.Shape[s.Rotation]
    for(var i=0; i<4; i++)
      this.val[s.Xpos+d[i][0]][s.Ypos+d[i][1]]=s.Color;
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
  var id = Math.floor(Math.random()*7);
  this.Color=id+1;
  this.Shape=shapes[id];
  this.Rotation = 0;

  this.move=function(x,y){
    //move if new position is valid
    var newX = this.Xpos + x;
    var newY = this.Ypos + y;
    //check for obstacles on board
    if(!this.check_position(newX, newY, this.Rotation))
      return;
    this.Xpos = newX;
    this.Ypos = newY;
    view.update();
  }

  this.rotate = function(r){
    //rotate if new position is valid
    //make cw and ccw rotation work
    var newrot = (this.Rotation+r)%this.Shape.length;
    if (newrot<0)
      newrot=this.Shape.length+newrot;
    //check for obstacles on board
    if (!this.check_position(this.Xpos, this.Ypos, newrot))
      return;
    this.Rotation = newrot;
    view.update();
  }

  this.drop=function(){
    while(!this.stuck())
      this.Ypos+=1;
    view.update();
  }
}

shape.prototype.check_position=function(newX, newY, newR){
  var d = this.Shape[newR];
  for(var i=0; i<4; i++){
    if((newX+d[i][0]<0 || newX+d[i][0]>=board.x) ||
       (newY+d[i][1]<0 || newY+d[i][1]>=board.y))
      return false;
    if(board.val[newX+d[i][0]][newY+d[i][1]])
      return false;
  }
  return true;
}

shape.prototype.stuck=function (){
  if(this.check_position(this.Xpos, this.Ypos+1, this.Rotation))
    return false;
  return true;
}

function view(size){
  //constructs the view
  this.canvas = document.getElementById("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.ctx.strokeStyle = colors[0];
  this.xsize=board.x*size;
  this.ysize=board.y*size;

  this.update=function() {
    //draw the board and the current shape
    this.ctx.clearRect(0, 0, this.xsize, this.ysize);
    this.draw_board();
    var c=current.Shape[current.Rotation];

    this.ctx.fillStyle = colors[current.Color];
    for(var i=0; i<4; i++){
      this.ctx.fillRect((c[i][0]+current.Xpos)*size,
                        (c[i][1]+current.Ypos)*size,
                        size, size);

      this.ctx.strokeRect((c[i][0]+current.Xpos)*size,
                          (c[i][1]+current.Ypos)*size,
                          size, size);
    }
  }


  this.draw_board=function(){
    //draw the board
    for (var i=0; i<board.y; i++)
      for(var j=0; j<board.x; j++){
        var b=board.val[j][i];
        if(b){
          this.ctx.fillStyle=colors[b];
          this.ctx.fillRect(j*size, i*size, size, size);
          this.ctx.strokeRect(j*size, i*size, size, size);
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
    this.ctx.clearRect(0, 0, 5*size, 6*size);
    var d=next.Shape[0];
    for (var i=0; i<4; i++) {
      this.ctx.fillStyle = colors[next.Color];
      this.ctx.fillRect(size+d[i][0]*size, size+d[i][1]*size, size, size);
      this.ctx.strokeRect(size+d[i][0]*size, size+d[i][1]*size, size, size);
    }
  }
}

function status(){
  this.lines=0;
  this.level=1;
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
  //next 4 lines stolen from the internet...
  var evt=(e)?e:(window.event)?window.event:null;
  if(evt){
    var key=(evt.charCode)?evt.charCode:
      ((evt.keyCode)?evt.keyCode:((evt.which)?evt.which:0));
    //vi-style keys. you are allowed
    //to move a shape up for now.
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
    if(current.Ypos==0)
      clearInterval(run);
    board.add(current);
    board.check_lines();
    if(!next.check_position(next.Xpos, next.Ypos, next.Rotation))
      return;
    current = next;
    next = new shape();
    preview.update();
    status.update();
  } else
    current.Ypos += 1;
  view.update();
}

function new_game(){
  board   = new board(10,20);
  next    = new shape();
  current = new shape();
  view    = new view(20);
  preview = new preview(20);
  status  = new status();

  status.update();
  preview.update();
  view.update();
  //go!
  run=setInterval(step, levels[0]);
}
