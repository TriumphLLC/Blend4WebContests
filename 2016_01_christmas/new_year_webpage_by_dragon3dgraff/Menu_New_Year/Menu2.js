"use strict"

// register the application module
b4w.register("Menu2", function(exports, require) {

// import modules used by the app
var m_anim      = require("animation");
var m_app       = require("app");
var m_data      = require("data");
var m_scenes    = require("scenes");
var m_trans  = require("transform");
var m_cont   = require("container");
var _vec2_tmp = new Float32Array(2);

var _previous_selected_obj = null;
var _previous_MouseBottom_obj = null;
var _Current_MouseBottom_obj = null;

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "second_canvas_container",
        callback: init_cb,
        show_fps: false,
        console_verbose: true,
          track_container_position: true, //пересчитывать позицию Canvas’а
        autoresize: true
        
    });
}

/**
 * callback executed when the app is initizalized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }
        canvas_elem.addEventListener("mousedown", main_canvas_click, false);
        canvas_elem.onmousemove = object_onmousemove;  
		canvas_elem.onmouseover = CanvasGrow;
		canvas_elem.onmouseout = CanvasSmall; 
	//	canvas_elem.onkeydown = EscPressed;      
    load();
}

/**
 * load the scene data
 */
function load() {
    m_data.load("Menu.json", load_cb);
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id) {
    m_app.enable_controls();
    m_app.enable_camera_controls();

    // place your code here

}
function main_canvas_click(e) {
    if (e.preventDefault)
        e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;
    var canvas_xy = m_cont.client_to_canvas_coords(x, y, _vec2_tmp);
console.log("x=" + _vec2_tmp[0] + " " + "y=" + _vec2_tmp[1]);
var objPicked = m_scenes.pick_object(_vec2_tmp[0], _vec2_tmp[1]);
if (objPicked){
	InfoBoxText.innerHTML = GetObjectInfo(objPicked);
	
	}
   // var obj = m_scenes.pick_object(x, y);
//console.log(m_scenes.get_object_name(obj));
//if (obj) {
 //if (m_scenes.get_object_name(obj) == "MainMenu1"){
 //var SubMenuOpen = m_scenes.get_object_by_name("SMenu");
 // m_trans.set_translation(SubMenuOpen, 0, 0, 2);
// m_anim.apply_def(SubMenuOpen);
  //m_anim.set_behavior(SubMenuOpen, m_anim.AB_FINISH_STOP);
       // m_anim.play(SubMenuOpen);
       // }
        //}
        /*
    if (obj) {
        if (_previous_selected_obj) {
            m_anim.stop(_previous_selected_obj);
           // m_anim.set_frame(_previous_selected_obj, 0);
        }
        _previous_selected_obj = obj;

        m_anim.apply_def(obj);
       // m_anim.cyclic(obj, false);
     m_anim.set_behavior(obj, m_anim.AB_FINISH_RESET);
        m_anim.play(obj);
      //  m_anim.play(m_scenes.get_object_by_name("Mball"));
       
         
    }
    */
    var url = "";
    if (obj)
        switch(m_scenes.get_object_name(obj)) { // взяли имя и смотрим куда будем переходить
        case "Bottle":
           url="http://ilym.ru/index.php?route=product/category&path=59";
            break;        
        }
   // if (url) // значит что было нажатие на нужный объект
        // window.open(url, "_self");
}
function object_onmousemove(e) {
      var xW = e.clientX;
    var yW = e.clientY;
    var canvas_xy = m_cont.client_to_canvas_coords(xW, yW, _vec2_tmp);
     var x = _vec2_tmp[0];
    var y = _vec2_tmp[1];
    var objME = m_scenes.pick_object(x, y); 
     var SubMenuOpen = m_scenes.get_object_by_name("SMenu");   
    if (objME != _previous_MouseBottom_obj) {
    if (objME) {
    if (m_scenes.get_object_name(objME) == "MainMenu1"){
  m_trans.set_translation_obj_rel(SubMenuOpen, 0, 1.5, 0, objME);
  }
    console.log(m_scenes.get_object_name(objME));
    }
    _previous_MouseBottom_obj = objME;	   
    }
    else  {
    _Current_MouseBottom_obj = objME; 
        }    
    if (_Current_MouseBottom_obj && _Current_MouseBottom_obj != _previous_MouseBottom_obj) {
     m_trans.set_translation_obj_rel(SubMenuOpen, 0, 0, 0, m_scenes.get_object_by_name("MainMenu1"));
        console.log("MovedOut");
    }    
}
function GetObjectInfo(objPicked){
	var SummuryInfo="";
	var object_size = "";
	var object_name = "";
	var object_b_b_topPoint = "";
	var object_b_b_bottomPoint = "";
	var translation = "";
	var object_height = "";
	var Accuracy = 3;
	var Which_Canvas = "";
	object_name = "Имя: " + m_scenes.get_object_name(objPicked) + "<br>";
	object_b_b_topPoint = "Верхняя точка: " + m_trans.get_object_bounding_box(objPicked).max_y.toPrecision(Accuracy) + "<br>";
	object_b_b_bottomPoint = "Нижняя точка: " + m_trans.get_object_bounding_box(objPicked).min_y.toPrecision(Accuracy) + "<br>";
	translation = "Положение центра:" + "<br>" 
	            + "   X = " + m_trans.get_translation(objPicked)[0].toPrecision(Accuracy)+ "<br>"
	            + "   Y = " + m_trans.get_translation(objPicked)[1].toPrecision(Accuracy)+ "  - Это ВВЕРХ!!!" + "<br>"
			    + "   Z = " + m_trans.get_translation(objPicked)[2].toPrecision(Accuracy)+ "<br>";
	//m_trans.distance(objME,SubMenuOpen );
	object_height = "Высота объекта: " + (m_trans.get_object_bounding_box(objPicked).max_y - m_trans.get_object_bounding_box(objPicked).min_y)  + "<br>";
	//object_size = "Размер объекта:  " + m_trans.get_object_size(objPicked).toPrecision(Accuracy) + "<br>";
	Which_Canvas = "second_canvas_container" + "<br>";
	SummuryInfo = Which_Canvas + object_name + translation + object_b_b_topPoint + object_b_b_bottomPoint + object_height ;
	return SummuryInfo;
}
addEventListener("keydown", function(event) {
    if (event.keyCode == 27)   
   second_canvas_container.style.height = "";
second_canvas_container.style.width="";
  });
function CanvasGrow(){
second_canvas_container.style.height = "90%";
second_canvas_container.style.width = "65%";
second_canvas_container.style.zIndex = "1";
}
function CanvasSmall(){
second_canvas_container.style.height = "";
second_canvas_container.style.width="";
second_canvas_container.style.zIndex = "";
}


});

// import the app module and start the app by calling the init method
b4w.require("Menu2", "MENU_2").init();