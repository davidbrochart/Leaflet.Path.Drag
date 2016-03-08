"use strict";if(L.Browser.svg){L.Path.include({_resetTransform:function(){this._container.setAttributeNS(null,"transform","")},_applyTransform:function(t){this._container.setAttributeNS(null,"transform","matrix("+t.join(" ")+")")}})}else{L.Path.include({_resetTransform:function(){if(this._skew){this._skew.on=false;this._container.removeChild(this._skew);this._skew=null}},_applyTransform:function(t){var i=this._skew;if(!i){i=this._createElement("skew");this._container.appendChild(i);i.style.behavior="url(#default#VML)";this._skew=i}var a=t[0].toFixed(8)+" "+t[1].toFixed(8)+" "+t[2].toFixed(8)+" "+t[3].toFixed(8)+" 0 0";var r=Math.floor(t[4]).toFixed()+", "+Math.floor(t[5]).toFixed()+"";var n=this._container.style;var o=parseFloat(n.left);var s=parseFloat(n.top);var e=parseFloat(n.width);var h=parseFloat(n.height);if(isNaN(o))o=0;if(isNaN(s))s=0;if(isNaN(e)||!e)e=1;if(isNaN(h)||!h)h=1;var g=(-o/e-.5).toFixed(8)+" "+(-s/h-.5).toFixed(8);i.on="f";i.matrix=a;i.origin=g;i.offset=r;i.on=true}})}L.Path.include({_onMouseClick:function(t){if(this.dragging&&this.dragging.moved()||this._map.dragging&&this._map.dragging.moved()){return}this._fireMouseEvent(t)}});"use strict";L.Handler.PathDrag=L.Handler.extend({statics:{DRAGGABLE_CLS:"leaflet-path-draggable"},initialize:function(t){this._path=t;this._matrix=null;this._startPoint=null;this._dragStartPoint=null;this._dragInProgress=false},addHooks:function(){var t=L.Handler.PathDrag.DRAGGABLE_CLS;var i=this._path._path;this._path.on("mousedown",this._onDragStart,this);this._path.options.className=(this._path.options.className||"")+" "+t;if(!L.Path.CANVAS&&i){L.DomUtil.addClass(i,t)}},removeHooks:function(){var t=L.Handler.PathDrag.DRAGGABLE_CLS;var i=this._path._path;this._path.off("mousedown",this._onDragStart,this);this._path.options.className=(this._path.options.className||"").replace(t,"");if(!L.Path.CANVAS&&i){L.DomUtil.removeClass(i,t)}},moved:function(){return this._path._dragMoved},inProgress:function(){return this._dragInProgress},_onDragStart:function(t){this._dragInProgress=true;this._startPoint=t.containerPoint.clone();this._dragStartPoint=t.containerPoint.clone();this._matrix=[1,0,0,1,0,0];if(this._path._point){this._point=this._path._point.clone()}this._path._map.on("mousemove",this._onDrag,this).on("mouseup",this._onDragEnd,this);this._path._dragMoved=false},_onDrag:function(t){var i=t.containerPoint.x;var a=t.containerPoint.y;var r=this._matrix;var n=this._path;var o=this._startPoint;var s=i-o.x;var e=a-o.y;if(!n._dragMoved&&(s||e)){n._dragMoved=true;n.fire("dragstart");if(n._popup){n._popup._close();n.off("click",n._openPopup,n)}}r[4]+=s;r[5]+=e;o.x=i;o.y=a;n._applyTransform(r);if(n._point){n._point.x=this._point.x+s;n._point.y=this._point.y+e}n.fire("drag");L.DomEvent.stop(t.originalEvent)},_onDragEnd:function(t){L.DomEvent.stop(t);this._dragInProgress=false;this._path._resetTransform();this._transformPoints(this._matrix);this._path._map.off("mousemove",this._onDrag,this).off("mouseup",this._onDragEnd,this);this._path.fire("dragend",{distance:Math.sqrt(L.LineUtil._sqDist(this._dragStartPoint,t.containerPoint))});if(this._path._popup){L.Util.requestAnimFrame(function(){this._path.on("click",this._path._openPopup,this._path)},this)}this._matrix=null;this._startPoint=null;this._point=null;this._dragStartPoint=null;this._path._dragMoved=false},_transformPoint:function(t,i){var a=this._path;var r=L.point(i[4],i[5]);var n=a._map.options.crs;var o=n.transformation;var s=n.scale(a._map.getZoom());var e=n.projection;var h=o.untransform(r,s).subtract(o.untransform(L.point(0,0),s));return e.unproject(e.project(t)._add(h))},_transformPoints:function(t){var i=this._path;var a,r,n;var o=L.point(t[4],t[5]);var s=i._map.options.crs;var e=s.transformation;var h=s.scale(i._map.getZoom());var g=s.projection;var _=e.untransform(o,h).subtract(e.untransform(L.point(0,0),h));if(i._point){i._latlng=g.unproject(g.project(i._latlng)._add(_));i._point=this._point._add(o)}else if(i._originalPoints){for(a=0,r=i._originalPoints.length;a<r;a++){n=i._latlngs[a];i._latlngs[a]=g.unproject(g.project(n)._add(_));i._originalPoints[a]._add(o)}}if(i._holes){for(a=0,r=i._holes.length;a<r;a++){for(var l=0,p=i._holes[a].length;l<p;l++){n=i._holes[a][l];i._holes[a][l]=g.unproject(g.project(n)._add(_));i._holePoints[a][l]._add(o)}}}i._updatePath()}});L.Path.addInitHook(function(){if(this.options.draggable){if(this.dragging){this.dragging.enable()}else{this.dragging=new L.Handler.PathDrag(this);this.dragging.enable()}}else if(this.dragging){this.dragging.disable()}});L.Circle.prototype._getLatLng=L.Circle.prototype.getLatLng;L.Circle.prototype.getLatLng=function(){if(this.dragging&&this.dragging.inProgress()){return this.dragging._transformPoint(this._latlng,this.dragging._matrix)}else{return this._getLatLng()}};L.Polyline.prototype._getLatLngs=L.Polyline.prototype.getLatLngs;L.Polyline.prototype.getLatLngs=function(){if(this.dragging&&this.dragging.inProgress()){var t=this.dragging._matrix;var i=this._getLatLngs();for(var a=0,r=i.length;a<r;a++){i[a]=this.dragging._transformPoint(i[a],t)}return i}else{return this._getLatLngs()}};(function(){L.FeatureGroup.EVENTS+=" dragstart";function t(t,i,a){for(var r=0,n=t.length;r<n;r++){var o=t[r];o.prototype["_"+i]=o.prototype[i];o.prototype[i]=a}}function i(t){if(this.hasLayer(t)){return this}t.on("drag",this._onDrag,this).on("dragend",this._onDragEnd,this);return this._addLayer.call(this,t)}function a(t){if(!this.hasLayer(t)){return this}t.off("drag",this._onDrag,this).off("dragend",this._onDragEnd,this);return this._removeLayer.call(this,t)}t([L.MultiPolygon,L.MultiPolyline],"addLayer",i);t([L.MultiPolygon,L.MultiPolyline],"removeLayer",a);var r={_onDrag:function(t){var i=t.target;this.eachLayer(function(t){if(t!==i){t._applyTransform(i.dragging._matrix)}});this._propagateEvent(t)},_onDragEnd:function(t){var i=t.target;this.eachLayer(function(t){if(t!==i){t._resetTransform();t.dragging._transformPoints(i.dragging._matrix)}});this._propagateEvent(t)}};L.MultiPolygon.include(r);L.MultiPolyline.include(r)})();