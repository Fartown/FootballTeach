        //获取鼠标在画布上的位置

        // function canvasMousePos(ele, event) {
        //     var x = getMousePos(event).x,
        //         y = getMousePos(event).y;
        //     return {
        //         x: x - ele.offsetParent.offsetLeft,
        //         y: y - ele.offsetParent.offsetTop
        //     }
        // }
        // back.addEvent('mousedown', function backdown(e) {
        //     console.log(new Date() + flag);
        //     var event = this.getEvent(e);
        //     switch (flag) {
        //         case 'line':
        //             var posX = canvasMousePos(this, event).x,
        //                 posY = canvasMousePos(this, event).y;
        //             back.addEvent('mousemove', function drawLine(e) {
        //                 if (flag == 'line') {
        //                     var event = this.getEvent(e),
        //                         x = canvasMousePos(this, event).x,
        //                         y = canvasMousePos(this, event).y
        //                     bctx.clearRect(posX, posY, x - posX, y - posY);
        //                     bctx.beginPath();
        //                     bctx.strokeStyle = 'black';
        //                     bctx.lineWidth = 1;
        //                     bctx.moveTo(posX, posY);
        //                     bctx.lineTo(x, y);
        //                     bctx.closePath();
        //                     bctx.stroke();
        //                     back.addEvent('click', function end() {
        //                         flag = ''
        //                     })
        //                 }

        //             });
        //             break;
        //         case 'circl':
        //             var posX = canvasMousePos(this, event).x,
        //                 posY = canvasMousePos(this, event).y;
        //             back.addEvent('mousedown', function drawLine(e) {
        //                 if (flag == 'circl') {
        //                     var event = this.getEvent(e),
        //                         x = canvasMousePos(this, event).x,
        //                         y = canvasMousePos(this, event).y
        //                     bctx.beginPath();
        //                     bctx.strokeStyle = 'black';
        //                     bctx.lineWidth = 1;
        //                     bctx.moveTo(posX + 20, posY);
        //                     bctx.arc(posX, posY, 20, 0, Math.PI * 2);
        //                     bctx.closePath();
        //                     bctx.stroke();
        //                     // back.addEvent('click', function end() {
        //                     flag = ''
        //                         // })
        //                 }

        //             });
        //             break;
        //         case 'text':
        //             var posX = canvasMousePos(this, event).x,
        //                 posY = canvasMousePos(this, event).y;
        //             back.addEvent('click', function drawLine(e) {
        //                 if (flag == 'text') {
        //                     var event = this.getEvent(e),
        //                         x = canvasMousePos(this, event).x,
        //                         y = canvasMousePos(this, event).y;
        // var inputText = document.getElementById("inputText");
        // inputText.style.display = 'block';
        // inputText.style.top = posY + 'px';
        // inputText.style.left = posX + 'px';
        // inputText.addEvent('blur', function text() {
        //     var value = inputText.value;
        //     bctx.strokeText(value, posX, posY);
        //     inputText.style.display = 'none';
        //     flag = '';
        // });
        //                     // back.addEvent('click', function end() {

        //                     // });
        //                 }

        //             });
        //             break;
        //         default:
        //             // statements_def
        //             break;
        //     }

        // });