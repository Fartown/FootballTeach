(function(window) {

    //关于事件兼容性处理
    var eventUtil = {
        addEvent: function(event, func, bool) {
            bool = bool || false;
            if (this.addEventListener) {
                this.addEventListener(event, func, bool)
            } else {
                this.attachEvent('on' + event, func, bool);
            }
        },
        removeEvent: function(event, func, bool) {
            bool = bool || false;
            if (this.removeEventListener) {
                this.removeEventListener(event, func, bool);
            } else {
                this.detachEvent('on' + event, func, bool);
            }
        },
        getEvent: function(event) {
            return event || window.event;
        },
        getTarget: function(event) {
            return event.target || event.srcElement;
        }
    };
    for (key in eventUtil) {
        HTMLElement.prototype[key] = eventUtil[key];
    };
    /*根据已知点获取第i个控制点的坐标
     *param ps   已知曲线将经过的坐标点
     *param i    第i个坐标点
     *param a,b  可以自定义的正数
     */
    function getCtrlPoint(ps, i, a, b) {
        if (!a || !b) {
            a = 0.25;
            b = 0.25;
        }
        //处理两种极端情形
        if (i < 1) {
            var pAx = ps[0].x + (ps[1].x - ps[0].x) * a;
            var pAy = ps[0].y + (ps[1].y - ps[0].y) * a;
        } else {
            var pAx = ps[i].x + (ps[i + 1].x - ps[i - 1].x) * a;
            var pAy = ps[i].y + (ps[i + 1].y - ps[i - 1].y) * a;
        }
        if (i > ps.length - 3) {
            var last = ps.length - 1
            var pBx = ps[last].x - (ps[last].x - ps[last - 1].x) * b;
            var pBy = ps[last].y - (ps[last].y - ps[last - 1].y) * b;
        } else {
            var pBx = ps[i + 1].x - (ps[i + 2].x - ps[i].x) * b;
            var pBy = ps[i + 1].y - (ps[i + 2].y - ps[i].y) * b;
        }
        return {
            pA: {
                x: pAx,
                y: pAy
            },
            pB: {
                x: pBx,
                y: pBy
            }
        }
    }

    //拓展canvas虚线
    var context = document.getElementById('back').getContext('2d'),
        moveToFunction = CanvasRenderingContext2D.prototype.moveTo;
    CanvasRenderingContext2D.prototype.lastMoveToLocation = {};
    CanvasRenderingContext2D.prototype.moveTo = function(x, y) {
        moveToFunction.apply(context, [x, y]);
        this.lastMoveToLocation.x = x;
        this.lastMoveToLocation.y = y;
    };
    CanvasRenderingContext2D.prototype.dashedLineTo = function(x, y, dashLength) {
        dashLength = dashLength === undefined ? 3 : dashLength;
        var startX = this.lastMoveToLocation.x;
        var startY = this.lastMoveToLocation.y;
        var deltaX = x - startX;
        var deltaY = y - startY;
        var numDashes = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength);

        for (var i = 0; i < numDashes; ++i) {
            this[i % 2 === 0 ? 'moveTo' : 'lineTo'](startX + (deltaX / numDashes) * i, startY + (deltaY / numDashes) * i);
        }
        this.moveTo(x, y);
    };
    // 箭头
    function getArrow(start, end, beta, length) {
        var alpha = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
        var angle1 = (alpha + beta) * Math.PI / 180;
        var angle2 = (alpha - beta) * Math.PI / 180;
        return {
            left: {
                x: end.x - length * Math.cos(angle1),
                y: end.y + length * Math.sin(angle1)
            },
            right: {
                x: end.x - length * Math.cos(angle2),
                y: end.y + length * Math.cos(angle2)
            }
        }
    };
    // 计算坐标
    function jisuan(x, y, defaultX, defaultY) {
        var angle = parseInt(Math.atan2(y - defaultX, x - defaultY) / Math.PI * 180);
        var arr = [];
        arr[0] = x - parseInt(45 * Math.cos(Math.PI / 180 * (angle - 35)));
        arr[1] = y - parseInt(45 * Math.sin(Math.PI / 180 * (angle - 35)));
        arr[2] = x - parseInt(45 * Math.cos(Math.PI / 180 * (angle + 35)));
        arr[3] = y - parseInt(45 * Math.sin(Math.PI / 180 * (angle + 35)));
        arr[4] = angle
        return arr;
    }
    //运动员对象
    var SoccerPlayer = function(context, center, radius, ring, color, text) {
        this.x = center.x;
        this.y = center.y;
        this.radius = radius;
        this.ring = ring;
        this.strokeStyle = color;
        this.context = context;
        this.text = text || 0;
        this.update();
    };

    SoccerPlayer.prototype = {
        drawCircle: function() {
            this.context.save();
            this.context.beginPath();
            this.context.strokeStyle = this.strokeStyle;
            this.context.fillStyle = this.strokeStyle;
            this.context.lineWidth = 1;
            this.context.moveTo(this.x + this.radius + 0.5, this.y);
            this.context.arc(this.x, this.y, this.radius + 0.5, 0, Math.PI * 2, true);
            this.context.moveTo(this.x + this.radius + this.ring + 0.5, this.y);
            this.context.arc(this.x, this.y, this.radius + this.ring + 0.5, 0, Math.PI * 2, false);
            this.context.closePath();
            this.context.fill();
            this.context.restore();
        },
        drawText: function() {
            this.context.save();
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.strokeText(this.text, this.x, this.y);
            this.context.restore();
        },
        inCircle: function inCircle(x, y) {
            if (Math.abs(x - this.x) <= this.radius && Math.abs(y - this.y) <= this.radius) {
                return true;
            };
            return false;
        },
        move: function(x, y) {
            this.x = x;
            this.y = y;
        },
        update: function() {
            this.drawCircle();
            this.drawText();
        }
    };
    //足球绘制
    drawBall = function(ctx, center, radius) {
        this.ctx = ctx;
        this.x = center.x;
        this.y = center.y;
        this.radius = radius || 11;
        this.ring = '3';
        this.strokeStyle = 'black';
        this.update();
    };
    drawBall.prototype = {
            ball: function() {
                this.ctx.save()
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.strokeStyle;
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(this.x + this.radius + 0.5, this.y);
                this.ctx.arc(this.x, this.y, this.radius + 0.5, 0, Math.PI * 2, true);
                this.ctx.moveTo(this.x + this.radius + this.ring + 0.5, this.y);
                this.ctx.arc(this.x, this.y, this.radius + this.ring + 0.5, 0, Math.PI * 2, false);
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.restore();
            },
            update: function() {
                this.ball();
            },
            inCircle: function inCircle(x, y) {
                if (Math.abs(x - this.x) <= this.radius && Math.abs(y - this.y) <= this.radius) {
                    return true;
                };
                return false;
            },
            move: function(x, y) {
                this.x = x;
                this.y = y;
            }
        }
        //状态栈,用于撤销恢复当前绘制的状态
    var statusStack = function() {
        this.status = [];
        this.index = 0;
        this.cache = [];
        this.arr = [];
        this.arrCache = [[]];
    };
    statusStack.prototype = {
        push: function(val) {
            // for (var stack of this.arr) {
            //     var len = stack.status.length - this.index;
            //     if (len >= 0) {
            //         stack.status.length = len + 1;
            //     };
            //     // console.log(stack, len);
            // };
            // debugger;
            this.status.push(val);
            this.index = 0;
            if (this.status.length > 12) {
                this.status.shift();
                return this.status;
            }
            return this.status;
        },
        undo: function() {
            if (this.status.length >= 1) {
                var sta = this.status.pop();
                this.cache.push(sta);
                this.index++;
                return sta;
            }
            this.arr.forEach( function(element, index) {
              if (element.status.length>=1) {
                this.arrCache[index].push(element.status.pop());
              }
            });
        },
        redo: function() {
            if (this.cache.length >= 1) {
                var sta = this.cache.pop();
                this.status.push(sta);
                this.index--;
                return sta;
            }
            this.arr.forEach( function(element, index) {
              var cache = this.arrCache[index];
              if (cache||cache.length>=1) {
                
              }
            });
            // if (this.currentIndex > 0) {
            //   return this.status[this.status.length - (--this.currentIndex)];
            // }
        },
        record: function(arr) {
            this.arr = arr;
        },
        clear: function() {
            this.status = [];
        }
    };
    //球员对象,线段对象栈
    var objStack = function() {
        this.status = [];
    };
    objStack.prototype = {
        push: function(val) {
            this.status.push(val);
            return this.status;
        },
        pop: function() {
            this.status = this.status.slice(0, this.status.length - 1);
            return this.status;
        }
    };

    // 画线
    function drawLine(ctx, start, end, control, point, color) {
        if (start) {
            this.start = start;
            this.end = end;
        };
        this.ctx = ctx;
        this.control = control;
        this.color = color;
        this.arrow = getArrow(start, end, Math.PI / 6, 15);
        this.arr = jisuan(end.x, end.y, start.x, start.y);
        if (point) {
            this.point = point;
            this.arrow = getArrow(point[point.length - 2], point[point.length - 1], Math.PI / 6, 15);
        };
        console.log(this.arrow);
        console.log(this.start, this.end);
        this.update();
    };
    drawLine.prototype = {
        drawFulline: function() {
            this.ctx.save();
            this.ctx.strokeStyle = this.color || 'black';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.start.x, this.start.y);
            this.ctx.lineTo(this.end.x, this.end.y);
            // var arr = this.arr;
            // this.ctx.moveTo(arr[0],arr[1]);
            this.ctx.lineTo(this.end.x, this.end.y)
                // this.ctx.lineTo(arr[2],arr[3]);
                //下面这个计算是用来在箭头与虚线的交叉点。直角三角形计算原理。。
                // this.ctx.lineTo(this.end.x-parseInt(25*Math.cos(arr[4]*Math.PI/180)), this.end.y-parseInt(25*Math.sin(arr[4]*Math.PI/180)));
                // this.ctx.lineTo(arr[0],arr[1]);
                // this.ctx.lineTo(this.arrow.left.x, this.arrow.left.y);
                // this.ctx.moveTo(this.end.x, this.end.y);
                // this.ctx.lineTo(this.arrow.right.x, this.arrow.right.y);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
            this.drawArrow(this.ctx, this.start.x, this.start.y, this.end.x, this.end.y)
        },
        drawDashedline: function() {
            this.ctx.save();
            this.ctx.strokeStyle = this.color || 'black';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.start.x, this.start.y);
            this.ctx.dashedLineTo(this.end.x, this.end.y);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
            this.drawArrow(this.ctx, this.start.x, this.start.y, this.end.x, this.end.y)
        },
        drawCurve: function() {
            this.ctx.save();
            this.ctx.strokeStyle = this.color || 'black';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for (var i = 0; i < this.point.length; i++) {
                if (i == 0) {
                    this.ctx.moveTo(this.point[i].x, this.point[i].y);
                } else {
                    var ctrlP = getCtrlPoint(this.point, i - 1);
                    this.ctx.bezierCurveTo(ctrlP.pA.x, ctrlP.pA.y, ctrlP.pB.x, ctrlP.pB.y, this.point[i].x, this.point[i].y);
                }
            };
            this.ctx.stroke();
            this.ctx.restore();
        },
        drawArrow: function(ctx, x1, y1, x2, y2) {
            var endRadians = Math.atan((y2 - y1) / (x2 - x1));
            endRadians += ((x2 > x1) ? 90 : -90) * Math.PI / 180;
            ctx.save();
            ctx.beginPath();
            ctx.translate(x2, y2);
            ctx.rotate(endRadians);
            ctx.moveTo(0, 0);
            ctx.lineTo(5, 20);
            ctx.lineTo(-5, 20);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        update: function() {
            if (this.control == 'fullline') {
                this.drawFulline();
            } else if (this.control == 'dashed') {
                this.drawDashedline();
            } else if (this.control == 'curve') {
                this.drawCurve();
            }
        }
    };
    //文本绘制
    function drawText(ctx, pos, text) {
        this.ctx = ctx;
        this.text = text;
        this.position = pos;
        this.update();
    };
    drawText.prototype = {
        drawtext: function() {
            this.ctx.strokeText(this.text, this.position.x, this.position.y);
        },
        update: function() {
            this.drawtext();
        }
    };
    //四边形绘制
    drawRect = function(ctx, start, end) {
        this.ctx = ctx;
        this.start = start;
        this.end = end;
        this.width = end.x - start.x;
        this.height = end.y - start.y;
        this.diffX = 0;
        this.diffY = 0;
        this.update();
    };
    drawRect.prototype = {
        rect: function() {
            this.ctx.strokeRect(this.start.x, this.start.y, this.end.x - this.start.x, this.end.y - this.start.y);
        },
        inCircle: function inCircle(x, y) {
            if (this.start.x <= x && this.start.y <= y && this.end.y >= y && this.end.x >= x) {
                return true;
            };
            return false;
        },
        move: function(x, y) {
            this.start.x = x - this.diffX;
            this.start.y = y - this.diffY;
            this.end.x = this.start.x + this.width;
            this.end.y = this.start.y + this.height;
        },
        update: function() {
            this.rect();
        }
    };
    //椭圆绘制
    drawEllipse = function(ctx, center, a) {
        this.ctx = ctx;
        this.x = center.x;
        this.y = center.y;
        this.a = a;
        this.b = 2 * a / 5;
        this.update();
    };
    drawEllipse.prototype = {
        ellipse: function() {
            var step = (this.a > this.b) ? 1 / this.a : 1 / this.b;
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + this.a, this.y);
            for (var i = 0; i < 2 * Math.PI; i += step) {
                this.ctx.lineTo(this.x + this.a * Math.cos(i), this.y + this.b * Math.sin(i));
            }
            this.ctx.closePath();
            this.ctx.stroke();
        },
        inCircle: function inCircle(x, y) {
            if (Math.abs(x - this.x) <= this.a && Math.abs(y - this.y) <= this.b) {
                return true;
            };
            return false;
        },
        move: function(x, y) {
            this.x = x;
            this.y = y;
        },
        update: function() {
            this.ellipse();
        }
    };

    window.objStack = objStack;
    window.SoccerPlayer = SoccerPlayer;
    window.statusStack = statusStack;
    window.drawLine = drawLine;
    window.drawText = drawText;
    window.drawEllipse = drawEllipse;
    window.drawBall = drawBall;
})(window);

//获取图片宽高
function getImg(img) {
    if (img.naturalWidth) {
        return { h: img.naturalHeight, w: img.naturalWidth }
    } else {
        var imgObj = new Image();
        imgObj.src = img.src;
        return { h: imgObj.height, w: imgObj.width }
    }
};


//  获取滚动条滚动竖直距离
function getScrollTop() {
    var scrollTop = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
        scrollTop = document.documentElement.scrollTop;
    } else if (document.body) {
        scrollTop = document.body.scrollTop;
    }
    return scrollTop;
}

//获取鼠标位置
function canvasMousePos(ele, event) {
    var x = (document.documentElement.scrollLeft || document.body.scrollLeft) + (event.clientX || event.pageX);
    var y = (event.clientY || event.pageY) + getScrollTop();
    return {
        x: x - ele.offsetParent.offsetLeft,
        y: y - ele.offsetParent.offsetTop
    }
};

Array.prototype.remove = function(item) {
    var index = this.indexOf(item);
    if (index != -1) {
        return this.splice(index, 1);
    } else {
        return this;
    }
};
