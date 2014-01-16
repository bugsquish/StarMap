var StarMap = {
    
    iLinkedCount: 1,
    oCanvas: document.getElementById('galaxy'),
    oContext: document.getElementById('galaxy').getContext('2d'),
    oStarPic: new Image(),
    bInitialised: false,
    
    fnInit: function() {
        StarMap.oContext.font="18px Arial white";
        StarMap.oContext.fillStyle = 'white';
		StarMap.oContext.strokeStyle = '#333';
        StarMap.oStarPic.src = 'img/star.png';
        StarMap.oStarPic.className = 'star-pic';
    },
    
    handleGenerate: function() {
        if (!StarMap.bInitialised) {
            StarMap.fnInit();
            StarMap.bInitialised = true;
            StarMap.oStarPic.onload = function() {
                StarMap.Galaxy.fnNewGalaxy();
            }
        } else {
            StarMap.Galaxy.fnNewGalaxy();
        }
    }
}
    
StarMap.Util = {
	fnGenerateRandomCoordinate: function(iPadding, iExtent) {
		return iPadding + (Math.random() * (iExtent - (iPadding*2)));
	},
	fnGenerateRandomInt: function(iMin, iMax) {
		return Math.floor(Math.random() * (iMax - iMin + 1)) + iMax;
	},
	fnGetDistance: function(iX1, iX2, iY1, iY2) {
		return Math.sqrt(((iX1-iX2)*(iX1-iX2))+((iY1-iY2)*(iY1-iY2)));
	},
	fnTestLineIntersect: function(x1,y1,x2,y2, x3,y3,x4,y4) {
		var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
		var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
		if (isNaN(x)||isNaN(y)) {
			return false;
		} else {
			if (x1>=x2) {
				if (!(x2<=x&&x<=x1)) {return false;}
			} else {
				if (!(x1<=x&&x<=x2)) {return false;}
			}
			if (y1>=y2) {
				if (!(y2<=y&&y<=y1)) {return false;}
			} else {
				if (!(y1<=y&&y<=y2)) {return false;}
			}
			if (x3>=x4) {
				if (!(x4<=x&&x<=x3)) {return false;}
			} else {
				if (!(x3<=x&&x<=x4)) {return false;}
			}
			if (y3>=y4) {
				if (!(y4<=y&&y<=y3)) {return false;}
			} else {
				if (!(y3<=y&&y<=y4)) {return false;}
			}
		}
		return true;
	}
}
            
StarMap.Galaxy = {
	iStarCount: 200,
	iGalaxyBorder: 50,
	aStars: [],
	aConnectionPipeline: [],

	fnNewGalaxy: function(){ 
		StarMap.Galaxy.iStarCount = document.getElementById('star-count').value;
		StarMap.Galaxy.fnResetGalaxy();
		StarMap.Galaxy.fnMakeStars();
	},

	fnResetGalaxy: function() {
		StarMap.oContext.clearRect(0, 0, StarMap.oCanvas.width, StarMap.oCanvas.height);
		StarMap.Galaxy.aConnectionPipeline = [];
		StarMap.Galaxy.aStars = [];
        $('.star-pic').remove();
	},

	fnMakeStars: function() {
		for (var s=0, sl= StarMap.Galaxy.iStarCount; s<sl; s++) {
			StarMap.Galaxy.aStars.push(new StarMap.Star(StarMap.Galaxy.aStars.length));
		}
		StarMap.Galaxy.fnConnectStars(StarMap.Galaxy.fnFindClosestStarToPoint(0,0), true);
	},

	fnFindClosestStarToPoint: function(iX, iY, bInPipeline) {
		var iClosestStar = null, nDistance = null, aStars = StarMap.Galaxy.aStars;
		for (var s=0, sl= aStars.length; s<sl; s++) {
			var oThisStar = aStars[s];
			if ((iX!=oThisStar.iX && iY!=oThisStar.i &&(!bInPipeline || !oThisStar.aLinkedStars.length))) {
				var nThisDistance = StarMap.Util.fnGetDistance(iX, oThisStar.iX, iY, oThisStar.iY);
				if (iClosestStar===null || nThisDistance < nDistance) {
					iClosestStar = s;
					nDistance = nThisDistance;
				}
			}
		}
		return aStars[iClosestStar];
	},

	fnGetNextPipeline: function() {
		for (var p=0, pl=StarMap.Galaxy.aConnectionPipeline.length; p<pl; p++) {
			var oNextStar = StarMap.Galaxy.aConnectionPipeline[p];
			if (oNextStar.bActivePipeline) {
				StarMap.Galaxy.fnConnectStars(oNextStar);
				break;
			}
		}
	},

	fnConnectStars: function(oStar, bFirst) {
		var nRandom = Math.random(), iBranches = nRandom > 0.9 && !bFirst ? 3 : nRandom > 0.7 && !bFirst ? 2 : 1;
		for (var l=0; l<iBranches; l++) {
			oStar.fnLinkToClosestStar(true, bFirst);
		}        
		StarMap.Galaxy.fnGetNextPipeline();
	},
	
	fnTestStarIntersectByIndex: function(iStar1, iStar2, iStar3, iStar4) {
		var aStars = StarMap.Galaxy.aStars;
		return StarMap.Galaxy.fnTestStarIntersectByObject(aStars[iStar1],aStars[iStar2],aStars[iStar3],aStars[iStar4]);
	},
	
	fnTestStarIntersectByObject: function(oStar1, oStar2, oStar3, oStar4) {
		return StarMap.Util.fnTestLineIntersect(oStar1.iX,oStar1.iY,oStar2.iX,oStar2.iY,oStar3.iX,oStar3.iY,oStar4.iX,oStar4.iY);
	},
	
	fnTestLineCollisionsByIndex: function(iStar1, iStar2) {
		var aStars = StarMap.Galaxy.aStars;
		return StarMap.Galaxy.fnTestLineCollisionsByObject(aStars[iStar1],aStars[iStar2]);
	},
	
	fnTestLineCollisionsByObject: function(oStar1, oStar2) {
		var bColliding = false, aStars = StarMap.Galaxy.aStars, hTested = {};
		for (var s=0, sl= aStars.length; s<sl; s++) {
			if (s != oStar1.iIndex && s != oStar2.iIndex) {
				for (var l=0, ls = aStars[s].aLinkedStars.length; l<ls; l++) {
					if (aStars[s].aLinkedStars[l]!=oStar1.iIndex&&aStars[s].aLinkedStars[l]!=oStar2.iIndex
						&&!hTested[s+'-'+aStars[s].aLinkedStars[l]]&&!hTested[aStars[s].aLinkedStars[l]+'-'+s]) {
						if (StarMap.Galaxy.fnTestStarIntersectByObject(oStar1, oStar2, aStars[s], aStars[aStars[s].aLinkedStars[l]])) {
							bColliding = true;
						}
						hTested[s+'-'+aStars[s].aLinkedStars[l]] = true;
					}
				}
			}
		}
		return bColliding;
	}
}
            
StarMap.Star = function(iIndex){
	this.iIndex = iIndex;
	this.sName = 'XYZ';
	this.iX = StarMap.Util.fnGenerateRandomCoordinate(StarMap.Galaxy.iGalaxyBorder, StarMap.oCanvas.width);
	this.iY = StarMap.Util.fnGenerateRandomCoordinate(StarMap.Galaxy.iGalaxyBorder, StarMap.oCanvas.height);
	this.aPlanets = [];
	this.aLinkedStars = [];  
	this.bActivePipeline = false;
	this.oStarPic = StarMap.oStarPic.cloneNode();
	this.oStarPic.style.left = (this.iX+20)+'px';
	this.oStarPic.style.top = (this.iY+20)+'px';
	document.getElementById('galaxy-container').appendChild(this.oStarPic);
	//StarMap.oContext.drawImage(StarMap.oStarPic, this.iX-5, this.iY-5);
	//StarMap.oContext.fillText(this.iIndex,this.iX+5,this.iY+5);

	this.fnGeneratePlanets = function() {
		var iPlanetCount = StarMap.Util.fnGenerateRandomInt(2,5);
		for (var p=0; p<iPlanetCount; p++) {
			this.aPlanets.push(new StarMap.Planet(this.aPlanets.length));
		}
	},

	this.fnLinkToStar = function(oStar) {
		StarMap.oContext.beginPath();
		StarMap.oContext.moveTo(this.iX,this.iY);
		StarMap.oContext.lineTo(oStar.iX,oStar.iY);
		StarMap.iLinkedCount++;
		StarMap.oContext.stroke();
		this.aLinkedStars.push(oStar.iIndex);
		oStar.aLinkedStars.push(this.iIndex);
	};
	
	this.fnFindBestStar = function() {
		
	}

	this.fnLinkToClosestStar = function(bPipeline, bFirst) {
		var oClosestStar = StarMap.Galaxy.fnFindClosestStarToPoint(this.iX,this.iY,bPipeline);
		StarMap.Galaxy.oConnectingStar = this;
		if (oClosestStar) {
			if (bPipeline) {
				if (!StarMap.Galaxy.fnTestLineCollisionsByObject(this,oClosestStar)) {
					StarMap.Galaxy.aConnectionPipeline.push(oClosestStar);
					this.fnLinkToStar(oClosestStar)
					oClosestStar.bActivePipeline = true;
				} 
			} else {
				this.fnLinkToStar(oClosestStar);
			}
		}
		this.bActivePipeline = false;
	};    
	
	this.handleClick = function() {
		StarMap.SolarSystem.fnShowPlanets(this);
	}
};


StarMap.SolarSystem = {
    
    fnShowPlanets: function(oStar) {
		
	}
};

StarMap.Planet = function(iIndex){
	this.iIndex = iIndex;
    this.iSize = StarMap.Util.fnGenerateRandomInt(1,5);
    this.iSpeed = StarMap.Util.fnGenerateRandomInt(2,5);
    this.iPosition = StarMap.Util.fnGenerateRandomInt(0,365);
};