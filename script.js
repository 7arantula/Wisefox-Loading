const foxBody = document.getElementById('foxbody');

if (foxBody && CSS.supports('clip-path', 'path("M 0 0 L 1 1 Z")')) {
    console.log("Start animation");

    const pathStart = "M 65 96 C 60 130, 35 130 , 42 179 Q 43 189, 47 198 L 53 197 L 56 185 C 67 188, 83 182, 89 195 C 90 200, 95 200, 99 195 C 100 192, 106 183, 120 192 C 130 200, 150 200, 161 190 Q 178 170, 175 140 C 170 120, 142 70, ";
    const pathMiddle = " ";
    const pathEnd = " C 130 80, 132 98, 140 120 C 146 140, 142 157, 131 157 C 120 157, 125 135, 120 127 C 110 110, 102 110, 102 93 L 102 94 Z";

    foxBody.animate(
        [
            { '--tail-tip-y': '40' },
            { '--tail-tip-y': '45' },
            { '--tail-tip-y': '50' },
            { '--tail-tip-y': '55' },
            { '--tail-tip-y': '50' },
            { '--tail-tip-y': '45' },
        ],
        {
            duration: 1000,
            iterations: Infinity,
            easing: 'ease-in-out',
            direction: 'alternate'
        }
    );

    foxBody.animate(
        [
            { '--tail-tip-x': '155' },
            { '--tail-tip-x': '150' }, 
            { '--tail-tip-x': '155' },
            { '--tail-tip-x': '160' }, 
            { '--tail-tip-x': '165' },
            { '--tail-tip-x': '160' },  
            { '--tail-tip-x': '155' },
            { '--tail-tip-x': '150' }
        ],
        {
            duration: 1000, 
            iterations: Infinity,
            easing: 'ease-in-out',
            direction: 'alternate'
        }
    );

    // Use requestAnimationFrame to sync the DOM update with the animation
    function updateClipPath() {
        const computedStyle = getComputedStyle(foxBody);
        const currentY = computedStyle.getPropertyValue('--tail-tip-y').trim();
        const currentX = computedStyle.getPropertyValue('--tail-tip-x').trim();

        foxBody.style.clipPath = `path("${pathStart}${currentX}${pathMiddle}${currentY}${pathEnd}")`;

        requestAnimationFrame(updateClipPath);
    }


    updateClipPath();


} else {
    console.warn("Animation not supported in this browser.");
}
