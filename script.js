const foxBody = document.getElementById("foxbody");

let d = foxBody.getAttribute("d");
let mousedown = false;
let touchstart = false;
let tailStrength = 0;      
let targetStrength = 0;    
let ease = 0.05;
let animating = false;
let kicked = false;
let isTrackingBall = false;

let tokens = d.split(/(\s|,)/).filter(t => t.trim() !== "");

let xIndex = tokens.indexOf("155");
let yIndex = xIndex + 1;

let baseY = parseFloat(tokens[yIndex]);
let baseX = parseFloat(tokens[xIndex]);
let t = 0;

function animate() {
    animating = true;
    tailStrength += (targetStrength - tailStrength) * ease;

    if (tailStrength > 0.001) {
        let offsetX = Math.sin(t) * 5 * tailStrength;
        tokens[yIndex] = baseY + offsetX;

        let offsetY = Math.cos(t) * 15 * tailStrength;
        tokens[xIndex] = baseX + offsetY;

        foxBody.setAttribute("d", tokens.join(" "));
        t += 0.3;
    }

    if (targetStrength === 0 && tailStrength < 0.001) {
        animating = false;
        t = 0;
        return; 
        
    }
    requestAnimationFrame(animate);
}

document.addEventListener("mousedown", (e)=>{
    mousedown = true;
    const mouse = getSVGPoint(e);
    if(isTrackingBall==false){ 
    lookAt(mouse);
    } 
    targetStrength = 1;   
    if (!animating) requestAnimationFrame(animate);
});

document.addEventListener("mouseup", (e)=>{
    mousedown = false;
    targetStrength = 0;   
    if (!animating) requestAnimationFrame(animate);
});

document.addEventListener("mousemove", (e) => {   
    const mouse = getSVGPoint(e);
    if(isTrackingBall==false){ 
    lookAt(mouse);
    }
});

document.addEventListener("touchstart", (e) =>{
    e.preventDefault();

    touchstart = true;
    targetStrength = 1; 
    const touch = e.changedTouches[0];
    if(touch && isTrackingBall==false){
    const mouse = getSVGPoint(touch);
    lookAt(mouse);
    }
    if (!animating) requestAnimationFrame(animate);
},{ passive: false });


document.addEventListener("touchend", (e) =>{

    touchstart = false;
    targetStrength = 0; 
    if (!animating) requestAnimationFrame(animate);
});

document.addEventListener("touchmove", (e) =>{
    const touch = e.changedTouches[0];
    if(touch && isTrackingBall==false){
    const mouse = getSVGPoint(touch);
    targetStrength = 1;
    lookAt(mouse);
    }
});

const svg = document.querySelector("svg");
const leftEye = document.getElementById("eyeLeft");
const rightEye = document.getElementById("eyeRight");

const eyes = [
  { sclera:{cx:38.5, cy:63, rx:5.5, ry:6.5}, pupil:leftEye },
  { sclera:{cx:63,   cy:69, rx:5.5, ry:6.5}, pupil:rightEye }
];

// Converting Mouse to SvG coordinates.
function getSVGPoint(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function lookAt(mouse)
{
    eyes.forEach(eye => {
        const {cx, cy, rx, ry} = eye.sclera;
        const pupilR = 2;

        let dx = mouse.x - cx;
        let dy = mouse.y - cy;

        let ex = dx / (rx - pupilR);
        let ey = dy / (ry - pupilR);
        let dist = Math.sqrt(ex*ex + ey*ey);

        if (dist > 1) {
        ex /= dist;
        ey /= dist;
        }

        let px = cx + ex * (rx - pupilR);
        let py = cy + ey * (ry - pupilR);

        if(mousedown==true || touchstart==true || isTrackingBall==true){
            eye.pupil.setAttribute("cx", px);
            eye.pupil.setAttribute("cy", py);    
        }
    });
}

let canvas = document.getElementById("canvas");
let soccer = document.getElementById("soccer");
let kick = document.getElementById("kick");
kick.addEventListener("click", kickBall);
kick.addEventListener("touchend", kickBall);
let ballSvg = document.getElementById("ballSvg");
let blinkSvg = document.getElementById("blink");

function lookAtBall(){
    
    const style = window.getComputedStyle(soccer);
    const matrix = new DOMMatrix(style.transform);
    
    const currentX = matrix.m41;
    const currentY = matrix.m42+300;

    const mouse = { x: currentX, y: currentY };
    lookAt(mouse);
    
}

function trackBallLoop() {
    if (isTrackingBall) {
        lookAtBall();
        requestAnimationFrame(trackBallLoop); 
    }
}

function kickBall()
{
    blinkSvg.style.animation = 'none';
    blinkSvg.style.strokeOpacity = '0';
    kick.style.pointerEvents= 'none'; 
    isTrackingBall = true;
    requestAnimationFrame(trackBallLoop);

        const animateOut = soccer.animate([
            { transform: 'translate(-90px, 33px) rotate(200deg)' , composite: "replace"}
        
        ], {
            
            duration: 700, 
            easing: 'ease-out',
            iterations: 1, 
            fill: 'forwards', 
            
        });

        animateOut.finished.then(()=>{

            soccer.style.transform = 'translate(-90px, 33px) rotate(200deg)';
            animateOut.cancel();

            return new Promise(resolve => setTimeout(resolve, 1000));

        }).then (()=>{
            kicked = false;
            kickLeg();

            const style = window.getComputedStyle(soccer);
            const matrix = new DOMMatrix(style.transform);
            const startX = matrix.m41;
            const startY = matrix.m42;

            const [Wx, Hy] = calculateCanvas();

            const distanceX = ((Wx/2)*-1)+100; 
            const apexY =  (Hy/2)*-1;
            const totalRotation = -5000;
            const endYOffset = (Hy/2)-100;
            const duration = 2000;
            const keyframes = [];
            const numKeyframes = 11;


            for (let i = 0; i < numKeyframes; i++) {
            const progress = i / (numKeyframes - 1);

            const verticalProgress = 4 * progress * (1 - progress);
            
            const currentYOffset = endYOffset * progress;

            const currentX = startX + (distanceX * progress);
            const currentY = startY + (apexY * verticalProgress)+currentYOffset;

            const currentRotation = totalRotation * progress;

            keyframes.push({
                transform: `translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg)`
            });
        }

        const finalTransform = keyframes[keyframes.length - 1].transform;

        const soccerAnimation = soccer.animate(
            keyframes , 
            { 
                duration: duration, 
                easing: 'linear',
                iterations: 1, 
                fill: 'forwards',
            });

            const timeBeforeEnd = 1000;
            setTimeout(() => {
               ballSvg.style.opacity = '0';
            }, duration - timeBeforeEnd);

            return soccerAnimation.finished.then (()=>{

            soccer.style.transform = finalTransform;
            soccerAnimation.cancel();
            
            });

        }).then (()=>{ 

            return new Promise(resolve => setTimeout(resolve, 400));

        }).then (()=>{
            kicked=true;
            kickLeg();
            
        }).then (()=>{
            return new Promise(resolve => setTimeout(resolve, 700));

        }).then (()=>{   
             
            isTrackingBall = false; 
            blinkSvg.style.animation = 'blinking 1.5s infinite steps(4)';
            ballSvg.style.opacity = '1';
            kick.style.pointerEvents= 'auto'; 

            soccer.style.transform = 'translate(-220px, 33px)';
        })
        .catch(error => {
        console.error("An animation step failed:", error);
    });
    
}

let LQ = 47.1 ;
let RQ = 53.1 ;

let lxIndex = tokens.indexOf(LQ.toString());
let lyIndex = lxIndex + 1;
let rxIndex = lyIndex + 2;
let offset = 0;

function kickLeg()
{

    if(kicked==false)
    {
        offset = -10;
    }
    else
    {
        offset = 10;
    }
    

    let baseLy = parseFloat(tokens[lyIndex]);
    let baseLx = parseFloat(tokens[lxIndex]);
    let baseRx = parseFloat(tokens[rxIndex]);

    tokens[lyIndex] = baseLy + offset;
    tokens[lxIndex] = baseLx + offset;
    tokens[rxIndex] = baseRx + offset;

    foxBody.setAttribute("d", tokens.join(" "));
}

function calculateCanvas(){

    let sizeX = canvas.offsetWidth;
    let sizeY = canvas.offsetHeight;
    return [sizeX,sizeY];
}