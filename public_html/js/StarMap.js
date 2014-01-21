var StarMap = {
    
    iLinkedCount: 1,
    oGalaxyCanvas: document.getElementById('galaxy'),
    oPlanetsCanvas: document.getElementById('planets'),
    oStarPic: new Image(),
    oPlanetPic: new Image(),
    bInitialised: false,
    
    fnInit: function() {
		StarMap.oGalaxyContext = StarMap.oGalaxyCanvas.getContext('2d');
        StarMap.oGalaxyContext.font="18px Arial white";
        StarMap.oGalaxyContext.fillStyle = 'white';
		StarMap.oGalaxyContext.strokeStyle = '#333';
		StarMap.oPlanetsContext = StarMap.oPlanetsCanvas.getContext('2d');
        StarMap.oPlanetsContext.fillStyle = 'white';
		StarMap.oPlanetsContext.strokeStyle = '#333';
        StarMap.oStarPic.src = 'img/star.png';
        StarMap.oStarPic.className = 'star-pic';
        StarMap.oPlanetPic.src = 'img/planet.png';
        StarMap.oPlanetPic.className = 'planet-pic';
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
		return iMin + Math.floor(Math.random() * (iMax - iMin + 1));
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
		StarMap.oGalaxyContext.clearRect(0, 0, StarMap.oGalaxyCanvas.width, StarMap.oGalaxyCanvas.height);
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
	this.iX = StarMap.Util.fnGenerateRandomCoordinate(StarMap.Galaxy.iGalaxyBorder, StarMap.oGalaxyCanvas.width);
	this.iY = StarMap.Util.fnGenerateRandomCoordinate(StarMap.Galaxy.iGalaxyBorder, StarMap.oGalaxyCanvas.height);
	this.aPlanets = [];
	this.aLinkedStars = [];  
	this.bActivePipeline = false;
	this.oStarPic = StarMap.oStarPic.cloneNode();
	this.oStarPic.style.left = (this.iX-5)+'px';
	this.oStarPic.style.top = (this.iY-5)+'px';
	this.iPlanetBuffer = StarMap.Util.fnGenerateRandomInt(30,60);
	document.getElementById('galaxy-container').appendChild(this.oStarPic);
	var oThis = this;
	//StarMap.oGalaxyContext.drawImage(StarMap.oStarPic, this.iX-5, this.iY-5);
	//StarMap.oGalaxyContext.fillText(this.iIndex,this.iX+5,this.iY+5);
	
	$(this.oStarPic).click(function() {
		oThis.handleClick();
	});

	this.fnGeneratePlanets = function() {
		var iPlanetCount = StarMap.Util.fnGenerateRandomInt(1,7);
		for (var p=0; p<iPlanetCount; p++) {
			this.aPlanets.push(new StarMap.Planet(this, this.aPlanets.length));
		}
	},

	this.fnLinkToStar = function(oStar) {
		StarMap.oGalaxyContext.beginPath();
		StarMap.oGalaxyContext.moveTo(this.iX,this.iY);
		StarMap.oGalaxyContext.lineTo(oStar.iX,oStar.iY);
		StarMap.iLinkedCount++;
		StarMap.oGalaxyContext.stroke();
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
		if (!oThis.aPlanets.length) {
			oThis.fnGeneratePlanets();
		}
		StarMap.SolarSystem.fnShowPlanets(oThis);
	}
};


StarMap.SolarSystem = {
    iCenterX: StarMap.oPlanetsCanvas.width/2,
	iCenterY: StarMap.oPlanetsCanvas.height/2,
	fnClearPlanets: function() {		
		StarMap.oPlanetsContext.clearRect(0, 0, StarMap.oPlanetsCanvas.width, StarMap.oPlanetsCanvas.height);
        $('.planet-pic').remove();
	},
    fnShowPlanets: function(oStar) {
		StarMap.SolarSystem.fnClearPlanets();
		// Sun
		this.oStarPic = StarMap.oStarPic.cloneNode();
		this.oStarPic.style.left = (this.iCenterX-5)+'px';
		this.oStarPic.style.top = (this.iCenterY-5)+'px';
		document.getElementById('planets-container').appendChild(this.oStarPic);
		// Planets 
		for (var p=0; p<oStar.aPlanets.length; p++) {
			var oPlanet = oStar.aPlanets[p];
			oPlanet.fnCalculatePosition();
			oPlanet.fnPositionPlanet();
			document.getElementById('planets-container').appendChild(oPlanet.oPlanetPic);
			StarMap.oPlanetsContext.beginPath();
			StarMap.oPlanetsContext.arc(StarMap.SolarSystem.iCenterX, StarMap.SolarSystem.iCenterY, oPlanet.iDistance, 0, 2 * Math.PI, false);
			StarMap.oPlanetsContext.stroke();
			oPlanet.bIsVisible = true;
			oPlanet.fnMoveInterval = window.setInterval(function(oPlanet) {
				oPlanet.fnUpdatePosition();
				oPlanet.fnCalculatePosition();
				if (oPlanet.bIsVisible) {
					oPlanet.fnPositionPlanet();
				}
			}, 100, oPlanet);
		}
	}
};

StarMap.Planet = function(oStar, iIndex){
	this.iIndex = iIndex;
    this.iPosition = StarMap.Util.fnGenerateRandomInt(0,365);
	this.iPositionX = (Math.cos(this.iPosition)*this.iDistance)+StarMap.SolarSystem.iCenterX;
	this.iPositionY = (Math.sin(this.iPosition)*this.iDistance)+StarMap.SolarSystem.iCenterY;
    this.iSize = StarMap.Util.fnGenerateRandomInt(1,5);
    this.iSpeed = StarMap.Util.fnGenerateRandomInt(2,5);
	this.iDistance = iIndex?oStar.iPlanetBuffer + (iIndex*StarMap.Util.fnGenerateRandomInt(15,20)):oStar.aPlanets[iIndex-1]+StarMap.Util.fnGenerateRandomInt(30,50);
	this.oPlanetPic = StarMap.oPlanetPic.cloneNode();
	this.bIsVisible = false;
	
	
	this.fnUpdatePosition = function() {
		this.iPosition+=0.001*this.iSpeed;
		//this.iPosition = this.iPosition<=360?this.iPosition:0;
	}
	
	this.fnCalculatePosition = function() {
		this.iPositionX = (Math.cos(this.iPosition)*this.iDistance)+StarMap.SolarSystem.iCenterX-5;
		this.iPositionY = (Math.sin(this.iPosition)*this.iDistance)+StarMap.SolarSystem.iCenterY-5;
	}
	
	this.fnPositionPlanet = function() {
		this.oPlanetPic.style.left = this.iPositionX+'px';
		this.oPlanetPic.style.top = this.iPositionY+'px';
	}
};