const foxBody = document.getElementById("foxbody");

let d = foxBody.getAttribute("d");
let mousedown = false;
let touchstart = false;
let tailStrength = 0;      
let targetStrength = 0;    
let ease = 0.05;
let animating = false;


// Convert to array of tokens (numbers, letters, commas)
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
        return; 
    }
    requestAnimationFrame(animate);
}

document.addEventListener("mousedown", (e)=>{
    mousedown = true;
    const mouse = getSVGPoint(e);
    lookAt(mouse);  
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
    lookAt(mouse);    
});

document.addEventListener("touchstart", (e) =>{
    touchstart = true;
    targetStrength = 1; 
    const touch = e.changedTouches[0];
    if(touch){
    const mouse = getSVGPoint(touch);
    lookAt(mouse);
    }
    if (!animating) requestAnimationFrame(animate);
});
document.addEventListener("touchend", (e) =>{
    touchstart = false;
    targetStrength = 0; 
    const touch = e.changedTouches[0];
    if(touch){
    const mouse = getSVGPoint(touch);
    lookAt(mouse);
    }
    if (!animating) requestAnimationFrame(animate);
});
document.addEventListener("touchmove", (e) =>{
    const touch = e.changedTouches[0];
    if(touch){
    const mouse = getSVGPoint(touch);
    lookAt(mouse);
    }
});


const svg = document.querySelector("svg");
const leftEye = document.getElementById("eyeLeft");
const rightEye = document.getElementById("eyeRight");

const eyes = [
  { sclera:{cx:38.5, cy:63, rx:4.5, ry:5.5}, pupil:leftEye },
  { sclera:{cx:63,   cy:69, rx:4.5, ry:5.5}, pupil:rightEye }
];

// Converting mouse to SVG coordinates
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

        if(mousedown==true || touchstart==true){
            eye.pupil.setAttribute("cx", px);
            eye.pupil.setAttribute("cy", py);    
        }
    });
}

