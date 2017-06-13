       window.onload = function() {
           var back = document.getElementById("back"),
               ctx = back.getContext("2d"),
               flag = '',
               moveTool = document.getElementsByClassName("move")[0],
               ballTool = document.getElementsByClassName("ball")[0],
               playerTool = document.getElementsByClassName("player")[0],
               lineTool = document.getElementsByClassName("line")[0],
               reactTool = document.getElementsByClassName("react")[0],
               textTool = document.getElementsByClassName("text")[0],
               curveTool = document.getElementsByClassName("curve")[0],
               circleTool = document.getElementsByClassName("circle")[0],
               undoTool = document.getElementsByClassName("undo")[0],
               redoTool = document.getElementsByClassName("redo")[0],
               downTool = document.getElementsByClassName("down")[0],
               sidebar = document.getElementById('sidebar'),
               bgi = document.getElementsByClassName("bgi")[0],
               w = document.getElementsByClassName("bgi")[0].width,
               h = document.getElementsByClassName("bgi")[0].height,
               elemList = [moveTool, ballTool, playerTool, lineTool, reactTool, textTool, curveTool, circleTool, downTool],
               lineStack = new objStack,
               circleStack = new objStack,
               reactStack = new objStack,
               playerStack = new objStack,
               textStack = new objStack,
               rectStack = new objStack,
               ellipseStack = new objStack,
               ballStack = new objStack,
               lineType = 'fullline',
               status = new statusStack;
           //定制右键菜单
           var menu = document.getElementsByClassName('menu')[0];
           back.oncontextmenu = function(event) {
               var event = back.getEvent(event);
               if (document.all) {
                   window.event.returnValue = false;
               } else {
                   event.preventDefault();
               }
               if (menu.style.display == 'block') {
                   menu.style.display = 'none';
                   return;
               }
               menu.style.display = 'block';
               menu.style.top = event.pageY + 'px';
               menu.style.left = event.pageX + 20 + 'px';
           };
           menu.onclick = function(ev) {
               var target = menu.getTarget(menu.getEvent(ev));
               if (target.nodeType == 1 && target.nodeName == 'LI') {
                   flag = target.className;
                   menu.style.display = 'none';

               };
           };
           //初始化画布
           // (function init() {
           //绘制虚线      
           //左边工具栏功能控制
           function setShadow(ele) {
               for (var i = 0; i < elemList.length; i++) {
                   var cn = elemList[i].className,
                       index = 0;
                   if (cn.search(/\s/) == -1) {
                       index = cn.search(/\w$/g) + 1;
                   } else index = cn.search(/\s/g);
                   elemList[i].className = elemList[i].className.slice(0, index);
               }
               ele.className += ' active-tool';
           }
           for (var i = 0; i < elemList.length; i++) {
               elemList[i].addEvent('click', function move() {
                   setShadow(this);
                   var cn = this.className,
                       index = 0;
                   if (cn.search(/\s/) == -1) {
                       index = cn.search(/\w$/g) + 1;
                   } else index = cn.search(/\s/g);
                   flag = this.className.slice(0, index);
                   console.log(flag);

               })
           };
           ctx.canvas.width = w;
           ctx.canvas.height = h;
           undoTool.onclick = function() {
               for (var i = 0; i < elemList.length; i++) {
                   var cn = elemList[i].className,
                       index = 0;
                   if (cn.search(/\s/) == -1) {
                       index = cn.search(/\w$/g) + 1;
                   } else index = cn.search(/\s/g);
                   elemList[i].className = elemList[i].className.slice(0, index);
               };
               var sta = status.undo();
               if (sta) {
                   ctx.putImageData(sta, 0, 0);
               }

           };
           redoTool.onclick = function() {
               var sta = status.redo()
               if (sta) {
                   ctx.putImageData(sta, 0, 0);
               }
           };
           lineTool.onclick = function(e) {
                   var ev = e || window.e;
                   if (ev.stopPropagation()) {
                       ev.stopPropagation()
                   } else {
                       ev.cancelBubble = true;
                   };
                   flag = 'line';
                   var modal = document.getElementsByClassName("modal")[0];
                   modal.style.display = 'block';
                   var line = modal.getElementsByTagName('span')[0],
                       dashed = modal.getElementsByTagName('span')[1];
                   line.onclick = function() {
                       lineType = 'fullline';
                       modal.style.display = 'none';
                   };
                   dashed.onclick = function() {
                       lineType = 'dashed';
                       modal.style.display = 'none';
                   };
                   sidebar.onclick = function() {
                       modal.style.display = 'none';
                   };
               }
               //ctx.drawImage(bgi, 0, 0, w, h);
           downTool.onclick = downImg;
           // function drag(f1, f2, f3) {
           //     this.mousedown = false;
           //     this.addEvent('mousedown', f1(e));
           //     this.addEvent('mousemove', f2(e));
           //     this.addEvent('mouseup', f3(e));
           // };
           //编辑
           function amplify() {
               var mousedown = false,
                   obj = null;
               back.onclick = null;
               back.onmousedown = function(e) {
                   var event = event || window.event;
                   var pos = canvasMousePos(back, event);
                   //确定鼠标点击的对象
                   function clickTarget(Stack) {
                       Stack.status.forEach(function(pla) {
                           if (pla.inCircle(pos.x, pos.y)) {
                               mousedown = true;
                               obj = pla;
                           };
                       });
                   };
                   clickTarget(playerStack);
                   clickTarget(ballStack);
                   clickTarget(rectStack);
                   clickTarget(ellipseStack);
               };
               back.onmousemove = function(e) {
                   if (mousedown) {
                       var ev = e || window.e;
                       var pos = canvasMousePos(back, ev);
                       if (obj instanceof(drawBall) || obj instanceof(SoccerPlayer)) {
                           obj.radius = Math.abs(pos.x - obj.x);
                       } else if (obj instanceof(drawEllipse)) {
                           obj.a = Math.abs(pos.x - obj.x);
                           obj.b = Math.abs(pos.y - obj.y);
                       } else if (obj instanceof(drawRect)) {
                           obj.end.x = pos.x;
                           obj.end.y = pos.y;
                       };
                       ctx.clearRect(0, 0, w, h);
                       reDraw();
                       obj.update();
                   }
               };
               back.onmouseup = function() {
                   mousedown = false;
                   var sta = ctx.getImageData(0, 0, w, h);
                   status.push(sta);
               };
           }
           //拖拽对象
           function drag() {
               var mousedown = false;
               var obj = null;
               back.onclick = null;
               back.onmousedown = function(e) {
                   var event = event || window.event;
                   var pos = canvasMousePos(back, event);
                   //确定鼠标点击的对象
                   function clickTarget(Stack) {
                       Stack.status.forEach(function(pla) {
                           if (pla.inCircle(pos.x, pos.y)) {
                               mousedown = true;
                               obj = pla;
                               if (obj instanceof(drawRect)) {
                                   obj.diffX = pos.x - obj.start.x;
                                   obj.diffY = pos.y - obj.start.y;
                               }
                           };
                       });
                   };
                   clickTarget(playerStack);
                   clickTarget(ballStack);
                   clickTarget(rectStack);
                   clickTarget(ellipseStack);
               };
               back.onmousemove = function(e) {
                   if (mousedown) {
                       var ev = e || window.e;
                       var pos = canvasMousePos(back, ev);
                       obj.move(pos.x, pos.y);
                       ctx.clearRect(0, 0, w, h);
                       reDraw();
                       obj.update();
                       console.log(obj)
                   }
               };
               back.onmouseup = function(e) {
                   mousedown = false;
                   var sta = ctx.getImageData(0, 0, w, h);
                   status.push(sta);
               };
           };
           // drag(s1);
           function player() {
               console.log('playerStack');
               var pos = {};
               back.onmousedown = null;
               back.onmousemove = null;
               back.onmouseup = null;
               back.onclick = function(e) {
                   console.log('player');
                   var ev = e || window.e;
                   pos = canvasMousePos(back, ev);
                   var pla = new SoccerPlayer(ctx, pos, 11, 2.5, 'blue', '6');
                   playerStack.push(pla);
                   var sta = ctx.getImageData(0, 0, w, h);
                   status.push(sta);
               };
           };

           function line(lineType) {
               var fullLine;
               var start = {},
                   mousedown = false,
                   end = {};
               back.onclick = null;
               back.onmousedown = function(e) {
                   var event = event || window.event;
                   start = canvasMousePos(back, event);
                   mousedown = true;
               };
               back.onmousemove = function(e) {
                   if (mousedown) {
                       var ev = e || window.e;
                       end = canvasMousePos(back, ev);
                       if (lineType == "fullline") {
                           fullLine = new drawLine(ctx, start, end, lineType);
                       } else if (lineType == "dashed") {
                           fullLine = new drawLine(ctx, start, end, lineType);
                       };
                       ctx.clearRect(0, 0, w, h);
                       reDraw();
                       fullLine.update();
                   };
               };
               back.onmouseup = function(e) {
                   mousedown = false;
                   if (fullLine) {
                       lineStack.push(fullLine);
                   }
                   var sta = ctx.getImageData(0, 0, w, h);
                   status.push(sta);
               };
           };

           function text() {
               var pos = {};
               back.onmousedown = null;
               back.onmousemove = null;
               back.onmouseup = null;
               back.onclick = function(e) {
                   var event = event || window.event;
                   var pos = canvasMousePos(back, event);
                   console.log(pos);
                   var inCircle = false;
                   playerStack.status.forEach(function(pla) {
                       if (pla.inCircle(pos.x, pos.y)) {
                           mousedown = true;
                           inCircle = true;
                           var inputText = document.getElementById("inputText");
                           inputText.style.display = 'block';
                           inputText.style.top = pos.y + 'px';
                           inputText.style.left = pos.x + 'px';
                           inputText.focus();
                           document.onkeydown = function(e) {
                               var ev = e || window.e;
                               if (e.keyCode == 13) {
                                   pla.text = inputText.value;
                                   inputText.style.display = 'none';
                                   ctx.clearRect(0, 0, w, h);
                                   pla.update();
                                   reDraw();
                                   var sta = ctx.getImageData(0, 0, w, h);
                                   status.push(sta);
                               }
                           }
                       }
                   });
                   if (!inCircle) {
                       var inputText = document.getElementById("inputText");
                       inputText.style.display = 'block';
                       inputText.style.top = pos.y + 'px';
                       inputText.style.left = pos.x + 'px';
                       document.onkeydown = function(e) {
                           var ev = e || window.e;
                           if (e.keyCode == 13) {
                               var text = new drawText(ctx, pos, inputText.value);
                               textStack.push(text);
                               inputText.value = '';
                               inputText.style.display = 'none';
                               var sta = ctx.getImageData(0, 0, w, h);
                               status.push(sta);
                           }
                       }
                   }
               };
           };

           function curve() {
               var point = [];
               var mousedown = false;
               var curve = null;
               back.onclick = null;
               back.onmousedown = function(event) {
                   var e = event || window.event;
                   var pos = canvasMousePos(back, e);
                   mousedown = true;
                   point.push({
                       x: pos.x,
                       y: pos.y
                   });
               };
               back.onmousemove = function(e) {
                   if (mousedown) {
                       var ev = e || window.e;
                       var pos = canvasMousePos(back, ev);
                       if (Math.abs(pos.x - point[point.length - 1].x) >= 20 && Math.abs(pos.y - point[point.length - 1].y) >= 20) {
                           point.push({
                               x: pos.x,
                               y: pos.y
                           });
                           curve = new drawLine(ctx, false, false, 'curve', point);
                           ctx.clearRect(0, 0, w, h);
                           reDraw();
                           curve.update();
                       };
                   };
               };
               back.onmouseup = function(e) {
                   mousedown = false;
                   if (curve) {
                       lineStack.push(curve);
                   };
                   var sta = ctx.getImageData(0, 0, w, h);
                   status.push(sta);
               };
           };

           function rect() {
               var mousedown = false,
                   rect,
                   start;
               back.onclick = null;
               back.onmousedown = function(e) {
                   var event = event || window.event;
                   start = canvasMousePos(back, event);
                   mousedown = true;
               };
               back.onmousemove = function(e) {
                   if (mousedown) {
                       var ev = e || window.e;
                       var end = canvasMousePos(back, ev);
                       rect = new drawRect(ctx, start, end);
                       ctx.clearRect(0, 0, w, h);
                       reDraw();
                       rect.update();
                   }
               };
               back.onmouseup = function(e) {
                   mousedown = false;
                   var sta = ctx.getImageData(0, 0, w, h);
                   status.push(sta);
                   if (rect) {
                       rect.first = true;
                       rectStack.push(rect);
                   }
               };
           };

           function ellipse() {
               var mousedown = false,
                   ellipse,
                   start;
               back.onclick = null;
               back.onmousedown = function(e) {
                   var event = event || window.event;
                   start = canvasMousePos(back, event);
                   mousedown = true;
                   console.log(start);
               };
               back.onmousemove = function(e) {
                   if (mousedown) {
                       var ev = e || window.e;
                       var end = canvasMousePos(back, ev);
                       var center = {
                           x: (end.x - start.x) / 2 + start.x,
                           y: (end.y - start.y) / 2 + start.y
                       }
                       ellipse = new drawEllipse(ctx, center, Math.abs(end.x - start.x) / 2);
                       ctx.clearRect(0, 0, w, h);
                       reDraw();
                       ellipse.update();
                   }
               };
               back.onmouseup = function(e) {
                   mousedown = false;
                   var sta = ctx.getImageData(0, 0, w, h);
                   status.push(sta);
                   if (ellipse) {
                       ellipseStack.push(ellipse);
                   }
               };
           };

           function ball() {
               var ball = new Image();
               ball.src = 'image/tool/ball-tool-icon.svg';
               var pos = {};
               back.onmousedown = null;
               back.onmousemove = null;
               back.onmouseup = null;
               back.onclick = function(e) {
                   var ev = e || window.e;
                   pos = canvasMousePos(back, ev);
                   var pla = new drawBall(ctx, pos);
                   ballStack.push(pla);
               };
           }
           //重绘
           function reDraw() {
               lineStack.status.forEach(function(current) {
                   current.update();
               });
               textStack.status.forEach(function(current) {
                   current.update();
               });
               playerStack.status.forEach(function(current) {
                   current.update();
               });
               rectStack.status.forEach(function(current) {
                   current.update();
               });
               ellipseStack.status.forEach(function(current) {
                   current.update();
               });
               ballStack.status.forEach(function(current) {
                   current.update();
               });
           };

           function downImg() {
               html2canvas(document.body, {
                   height: h + 20,
                   onrendered: function(canvas) {

                       var url = canvas.toDataURL();
                       var triggerDownload = $("<a>").attr("href", url).attr("download", new Date() + ".png").appendTo("body");
                       triggerDownload[0].click();
                       triggerDownload.remove();
                   }
               });
           }
           back.onmouseover = function(e) {
                   switch (flag) {
                       case 'move':
                           drag();
                           break;
                       case 'line':
                           line(lineType);
                           break;
                       case 'circle':
                           ellipse();
                           break;
                       case 'text':
                           text()
                           break;
                       case 'curve':
                           curve()
                           break;
                       case 'react':
                           rect();
                           break;
                       case 'player':
                           player();
                           break;
                       case 'ball':
                           ball();
                           break;
                       case 'amplify':
                           amplify();
                           break;
                       default:
                           break;
                   };
               }
               // })();
       };
