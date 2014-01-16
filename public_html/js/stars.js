var StarMap = {
    
    iLinkedCount: 1
    
};

var oCanvas = document.getElementById('galaxy');
var oContext = oCanvas.getContext('2d');
oContext.font="30px Arial white";
oContext.fillStyle = 'white';
var oStarPic = new Image();
oStarPic.src = 'img/star.png';
oStarPic.width = 15;
oStarPic.height = 15;


var Util = {
  
    fnRandomLocation: function(iPadding, iExtent) {
        return iPadding + (Math.random() * (iExtent - (iPadding*2)));
    },
            
    fnGetDistance: function(iX1, iX2, iY1, iY2) {
        return Math.sqrt(((iX1-iX2)*(iX1-iX2))+((iY1-iY2)*(iY1-iY2)));
    }
    
};

var Galaxy = {

    iStarCount: 200,
    iGalaxyBorder: 50,
    aStars: [], // {sName,iX,iY,aPlanets,bLinked,Linking}

    handleGenerate: function() {
        //window.setInterval(Galaxy.fnNewGalaxy, 100);
        Galaxy.fnNewGalaxy();
    },
        
    fnNewGalaxy: function(){ 
        Galaxy.iStarCount = document.getElementById('star-count').value;
        Galaxy.fnResetGalaxy();
        Galaxy.fnMakeStars();
    },

    fnMakeStars: function() {
        for (var s=0, sl= Galaxy.iStarCount; s<sl; s++) {
            var jStar = {
                sName: 'XYZ',
                iX: Util.fnRandomLocation(Galaxy.iGalaxyBorder, oCanvas.width),
                iY: Util.fnRandomLocation(Galaxy.iGalaxyBorder, oCanvas.height)
            };
            Galaxy.aStars.push(jStar);
            //console.log(jStar.iX + ', ' + jStar.iY);
            oContext.drawImage(oStarPic, jStar.iX-5, jStar.iY-5);
        }        
        var iStar = Star.fnFindNearestStar(0,0);
        Galaxy.aStars[iStar].bLinked = true;
        Galaxy.aStars[iStar].bLinking = true;
        oContext.fillText(iStar+": 1",Galaxy.aStars[iStar].iX+5,Galaxy.aStars[iStar].iY+5);
        Star.fnConnectStars(iStar, true);

    },
            
    fnResetGalaxy: function() {
        oContext.clearRect(0, 0, oCanvas.width, oCanvas.height);
        Galaxy.aStars = [];
        Star.aConnectionPipeline = [];
        StarMap.iLinkedCount = 1;
    }

};

var Star = {
    
    aConnectionPipeline: [],
            
    fnGetNextPipeline: function() {
        for (var p=0, pl=Star.aConnectionPipeline.length; p<pl; p++) {
            if (!Galaxy.aStars[Star.aConnectionPipeline[p]].bLinking) {
                Star.fnConnectStars(Star.aConnectionPipeline[p]);
                break;
            }
        }
    },
    
    fnConnectStars: function(iStar, bFirst) {
        var nRand = Math.random(),
        iBranches = nRand > 0.7 && !bFirst ? 2 : 1;
        //Star.aConnectionPipeline = [];
        for (var l=0; l<iBranches; l++) {
            //if (StarMap.iLinkedCount < Galaxy.iStarCount) {
                Star.fnMakePath(iStar);
            //}
        }        
        if (StarMap.iLinkedCount < Galaxy.iStarCount) {
            Star.fnGetNextPipeline();
        }
    },
    
    fnMakePath: function(iStar) {
        var jStar = Galaxy.aStars[iStar],
        iClosestStar = Star.fnFindNearestStar(jStar.iX, jStar.iY, iStar), 
        jClosestStar = Galaxy.aStars[iClosestStar];
        jClosestStar.bLinked = true;
        jStar.bLinking = true;
        
        StarMap.iLinkedCount++;
        oContext.fillText(iClosestStar+': '+StarMap.iLinkedCount,jClosestStar.iX+5,jClosestStar.iY+5);
        oContext.beginPath();
        oContext.moveTo(jStar.iX,jStar.iY);
        oContext.lineTo(jClosestStar.iX,jClosestStar.iY);
        oContext.strokeStyle = '#ff0000';
        oContext.stroke();
        Star.aConnectionPipeline.push(iClosestStar);
    },
            
    fnFindNearestStar: function(iX, iY, iStar) {
        var iClosestStar = null, nDistance = null;
        for (var s=0, sl= Galaxy.aStars.length; s<sl; s++) {
            var jThisStar = Galaxy.aStars[s];
            if (s != iStar && !jThisStar.bLinked) {
                var nThisDistance = Util.fnGetDistance(iX, jThisStar.iX, iY, jThisStar.iY);
                if (iClosestStar===null || nThisDistance < nDistance) {
                    iClosestStar = s;
                    nDistance = nThisDistance;
                }
                console.log(iStar + ' - ' + s + ' - ' + iClosestStar + ' - ' + nThisDistance + ' - ' + nDistance);
            }
        }
        return iClosestStar;
    }
    
};
