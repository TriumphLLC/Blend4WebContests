"use strict"

// register the application module
b4w.register("Menu", function(exports, require) {

// import modules used by the app
var m_anim      = require("animation");
var m_app       = require("app");
var m_data      = require("data");
var m_scenes    = require("scenes");
var m_trans  = require("transform");
var m_cont   = require("container");
var m_tex    = require("textures");
var m_obj    = require("objects");
var m_material    = require("material");
var m_rgba    = require("rgba");

var _vec2_tmp = new Float32Array(2);

var _previous_selected_obj = null;
var _previous_MouseBottom_obj = null;
var _Current_MouseBottom_obj = null;
var CurrentSubMenu = null;
var previousSubMenu = null;
var LoadPosition = 0;
var SubMenuArray = [];

var ColorDefault = m_rgba.from_values(0.045, 0.661, 1, 0);
var Color_Lighted = m_rgba.from_values(0.59, 1, 1, 0);
var Color_Lighted_Logos = m_rgba.from_values(0, 0, 1, 0);
// var Color_Lighted = Color_Lighted_Logos;

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
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
		//canvas_elem.onmouseover = CanvasGrow;
		//canvas_elem.onmouseout = CanvasSmall; 
		//canvas_elem.onkeydown = EscPressed;
	LoadMainMenu.onclick = LoadMainMenuF;
//	LoadSubMenu.onclick = LoadSubMenuF;
         
    load();
}

/**
 * load the scene data
 */
function load() {
  m_data.load("Menu.json", load_cb);
  LoadMainMenu.disabled = false;
  
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id) {
   m_app.enable_controls();
    m_app.enable_camera_controls();
	m_scenes.hide_object(m_scenes.get_object_by_name("AlertBox"));
	m_scenes.hide_object(m_scenes.get_object_by_name("ClickToHide"));
LoadMainMenuF();
    // place your code here

}
//Событие на нажатие кнопки LoadMenu
function LoadMainMenuF() {
	LoadMainMenu.disabled = true;
	LoadMainMenu.value = "Reload page";
// m_data.unload(1);	
m_data.load("MainMenu.json", loaded_cb, null, null, true );
 }
 //Событие при загрузке сцены
 function loaded_cb(data_id, success) { 
 var MenuData = GetMenuArray() //собрали массив из таблицы
  // SubMenuArray = [];
 var LoadedMAIN = m_scenes.get_object_by_name("MainMenu_", 1);//получили нужный объект из сцены
  var LoadedSUB = m_scenes.get_object_by_name("SMenu", 1);//получили нужный объект из сцены 
var LenghtOfObject = 2*m_trans.get_object_bounding_box(LoadedMAIN).max_x;
var LenghtOfLogo = m_trans.get_object_bounding_box(m_scenes.get_object_by_name("Text")).min_x;
   LoadPosition = LenghtOfLogo + LenghtOfObject/2;
   //скачем по массиву
  for (var a = 0;  a < MenuData.length; a++){	  
	 var CopiedMAINName = m_scenes.get_object_name(LoadedMAIN)+a;//имя нового элемента
     var CopiedMAIN = m_obj.copy(LoadedMAIN,CopiedMAINName, true);//получаем копию загруженного элемента, глубокое копирование!
 m_scenes.append_object(CopiedMAIN); //добавляем его в сцену
m_trans.set_translation(CopiedMAIN, LoadPosition, 0, 0); //перемещаем его куда надо
//console.log(m_scenes.get_object_name(CopiedMAIN) + " moved to " +LoadPosition);
 CanvasTexPrint(CopiedMAIN,"CT",MenuData[a][0], 300, "60px Arial"); //пишем на нем элемент массива
  m_scenes.show_object(CopiedMAIN);
// var J = 0.3;
 //Добавляем ПОДМЕНЮ
 var SubArray= [];
for (var smc = 1;  smc < MenuData[a].length; smc++){
	 var SubMenuDATA = MenuData[a][smc].split('_SPLIT_');
	 var CopiedSUBName = CopiedMAINName + "_" + smc + "_" + m_scenes.get_object_name(LoadedSUB);//имя нового элемента
     var CopiedSUB = m_obj.copy(LoadedSUB,CopiedSUBName, true);//получаем копию загруженного элемента, глубокое копирование!
	// console.log(m_scenes.get_object_name(CopiedSUB));
	 
	  m_scenes.append_object(CopiedSUB); //добавляем его в сцену
	  m_trans.set_translation(CopiedSUB, LoadPosition, 0, 0); //перемещаем его куда надо
	  CanvasTexPrint(CopiedSUB,"SMCanvasMat",SubMenuDATA[0],300, "60px Arial"); 
	   m_scenes.show_object(CopiedSUB);
	   var SMenuDataHash = {};
	   SMenuDataHash.name = CopiedSUBName;
	    SMenuDataHash.url = SubMenuDATA[1];
	   SubArray[smc-1] = SMenuDataHash;
	    // SubArray[smc-1] = SubMenuDATA[1];
	    // console.log(SubArray[smc-1].url);
	  // J = J + 0.35;
	   
}
SubMenuArray[a] = SubArray;
LoadPosition = LoadPosition + LenghtOfObject + 0.1 ;
 }
// console.log("Count of Selectable objects: " + m_obj.get_selectable_objects().length);
// console.log(SubMenuArray.length);
   // console.log(SubMenuArray[0][0]);
 }
 //Функция создания надписи на канвас-текстуре
 function CanvasTexPrint (objCanvas,TexName,PrintData, delY, FONT){
	  var ctx_image = m_tex.get_canvas_ctx(objCanvas, TexName);
  if (ctx_image) {
        var img = new Image();
        img.src = "Background.png";
        img.onload = function() {
            ctx_image.drawImage(img, 0, 0, ctx_image.canvas.width, 
                    ctx_image.canvas.height);					 
            ctx_image.fillStyle = "rgba(255,255,255,255)";
            ctx_image.font = FONT;
		    // ctx_image.shadowColor = "#000";
            // ctx_image.shadowOffsetX = 5;
            // ctx_image.shadowOffsetY = 5;			
            ctx_image.fillText(PrintData,5, delY);
            m_tex.update_canvas_ctx(objCanvas, TexName);
        }
    }
	 
 }
 //Соберем массив для меню
 function GetMenuArray(){
 var table = document.getElementById("InputTable");
 var ColumnCount = table.rows[0].cells.length;
 var RowCount = table.getElementsByTagName("tr").length;
 var MenuArray = [];
for (var j=0;j<ColumnCount;j++)
   {
   var SubArray= [];
   for (var row=0;row<RowCount;row++)
   {
   var SellValue = table.rows[row].cells[j].firstElementChild.value;
		SubArray[row] = SellValue;
   }
   MenuArray[j] = SubArray;
   }  
   return MenuArray;
 }
 
function main_canvas_click(e) {
    if (e.preventDefault)
        e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;
    var canvas_xy = m_cont.client_to_canvas_coords(x, y, _vec2_tmp);
//console.log("x=" + _vec2_tmp[0] + " " + "y=" + _vec2_tmp[1]);
var objPicked = m_scenes.pick_object(_vec2_tmp[0], _vec2_tmp[1]);
if (objPicked){
	InfoBoxText.innerHTML = GetObjectInfo(objPicked);	
	var NameOfOject = m_scenes.get_object_name(objPicked);
	// console.log(NameOfOject);
		  var NameArray = NameOfOject.split('_');
	//NameArray[0] - MainMenu
	//NameArray[1] - номер MainMenu
	//NameArray[2] - номер SubMenu
	//NameArray[3] - SMenu
    // if (objME != _previous_MouseBottom_obj) {
		// console.log(NameArray[0]);
    if (NameArray[0] == "MainMenu"){
		for (var c=0;c<SubMenuArray[NameArray[1]].length;c++){
    if(SubMenuArray[NameArray[1]][c].name === NameOfOject){
		console.log(SubMenuArray[NameArray[1]][c].url);
		CanvasTexPrint(m_scenes.get_object_by_name("AlertBox"),"CanvasAlertTeture",SubMenuArray[NameArray[1]][c].url,475, "23px Arial");
		m_scenes.show_object(m_scenes.get_object_by_name("AlertBox"));
		m_scenes.show_object(m_scenes.get_object_by_name("ClickToHide"));		
		//Танцует Снеговик
		if(SubMenuArray[NameArray[1]][c].url === "С Новым Годом!!!"){
		var SnowManDance = m_scenes.get_object_by_name("Icosphere.001");
		var SnowManDanceHead = m_scenes.get_object_by_name("Icosphere.002");
		 m_anim.apply_def(SnowManDance);
		 m_anim.apply_def(SnowManDanceHead);
     m_anim.set_behavior(SnowManDance, m_anim.AB_FINISH_RESET);
	 m_anim.set_behavior(SnowManDanceHead, m_anim.AB_FINISH_RESET);
       m_anim.play(SnowManDance);
	   m_anim.play(SnowManDanceHead);
	}
	}
		}
	}
	if(NameOfOject == "AlertBox"|| NameOfOject == "ClickToHide"){
		m_scenes.hide_object(objPicked);
	}
	if(NameOfOject == "B4W"){
		window.open("https://www.blend4web.com/", "_self");
	}
	if(NameOfOject == "Dragon3DGraff"){
		window.open("http://vk.com/denisovi", "_self");
	}
	}
   // var obj = m_scenes.pick_object(x, y);
//console.log(m_scenes.get_object_name(obj));
//if (obj) {
 //if (m_scenes.get_object_name(obj) == "MainMenu_"){
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
    
    var url = "";
    if (obj)
        switch(m_scenes.get_object_name(obj)) { // взяли имя и смотрим куда будем переходить
        case "Bottle":
           url="http://ilym.ru/index.php?route=product/category&path=59";
            break;        
        }
        */
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
	  if (objME) {
		  var NameOfOject = m_scenes.get_object_name(objME);
		  var NameArray = NameOfOject.split('_');
	//NameArray[0] - MainMenu
	//NameArray[1] - номер MainMenu
	//NameArray[2] - номер SubMenu
	//NameArray[3] - SMenu
    if (NameArray[0] == "MainMenu"){
		 _Current_MouseBottom_obj = NameArray[1];
		if (_Current_MouseBottom_obj != _previous_MouseBottom_obj) {
		var MainMenuSelected = m_scenes.get_object_by_name("MainMenu_" + [NameArray[1]] , 1);
		var HegihtMMenu =  m_trans.get_object_bounding_box( m_scenes.get_object_by_name("MainMenu_", 1)).max_y;
		var HegihtSMenu =  m_trans.get_object_bounding_box(m_scenes.get_object_by_name("SMenu", 1)).max_y;
		//Нужно перечислить номера SubMenu
		for (var s=0;s<SubMenuArray[NameArray[1]].length;s++){
		 var SubMenuOpen = m_scenes.get_object_by_name(SubMenuArray[NameArray[1]][s].name,1);
		var SmenuJump = (s+1)*(HegihtMMenu + HegihtSMenu);
		//переместить все подменю относительно своего главного меню
  m_trans.set_translation_obj_rel(SubMenuOpen, 0, SmenuJump, 0, MainMenuSelected);
		}
  //Увеличить соответствующее главное меню
 m_trans.set_scale(MainMenuSelected,1.1);
 //Убираем подменю предыдущего
 if(_previous_MouseBottom_obj != null){
	  var MainMenuSelectedCURR = m_scenes.get_object_by_name("MainMenu_"+_previous_MouseBottom_obj, 1);
		//тут надо все подменю убрать в ноль относительно своего главного меню
		for (var c=0;c<SubMenuArray[_previous_MouseBottom_obj].length;c++){
		 var SubMenuOpenC = m_scenes.get_object_by_name(SubMenuArray[_previous_MouseBottom_obj][c].name,1);
     m_trans.set_translation_obj_rel(SubMenuOpenC, 0, 0, 0, MainMenuSelectedCURR);
		}
		 	m_trans.set_scale(MainMenuSelectedCURR,1);
		}
		}
		else {
		//Подсвечиваем подменю
        	for (var cu=0;cu<SubMenuArray[NameArray[1]].length;cu++){
    if(SubMenuArray[NameArray[1]][cu].name === NameOfOject){
		CurrentSubMenu = SubMenuArray[NameArray[1]][cu].name;
		var SubMenuCURRENT_obj = m_scenes.get_object_by_name(CurrentSubMenu, 1);
		if(CurrentSubMenu != previousSubMenu ){
			m_material.set_diffuse_color(SubMenuCURRENT_obj,"Material.002", Color_Lighted);
		  //Убираем подсветку с предыдущего
		  if(previousSubMenu != null){
			  var SubMenuPREVIOUS_obj = m_scenes.get_object_by_name(previousSubMenu, 1);
			m_material.set_diffuse_color(SubMenuPREVIOUS_obj,"Material.002", ColorDefault);
		  }
		}
	    }
		else{
		  if(NameArray[3] != "SMenu"){
			 if(previousSubMenu != null){
			m_material.set_diffuse_color(m_scenes.get_object_by_name(previousSubMenu, 1),"Material.002", ColorDefault);
			previousSubMenu = null;
		CurrentSubMenu = null;
			 }
		  }	
		}
		}
		 previousSubMenu = CurrentSubMenu;
		}
		 _previous_MouseBottom_obj = NameArray[1];
  }  
    else  {
		HideALLSubMenu();
		_Current_MouseBottom_obj = null;
		_previous_MouseBottom_obj = null;
		previousSubMenu = null;
		CurrentSubMenu = null;
	}
	// 
	if(NameOfOject == "B4W"){
		
		m_material.set_diffuse_color(m_scenes.get_object_by_name("B4W"),"Material.002", Color_Lighted_Logos);
	}
	else{
		m_material.set_diffuse_color(m_scenes.get_object_by_name("B4W"),"Material.002", ColorDefault);
	}
	if(NameOfOject == "Dragon3DGraff"){
		
		m_material.set_diffuse_color(m_scenes.get_object_by_name("Dragon3DGraff"),"Material.002", Color_Lighted_Logos);
	}
	else{
		m_material.set_diffuse_color(m_scenes.get_object_by_name("Dragon3DGraff"),"Material.002", ColorDefault);
	}
	  }
	  else{
		  HideALLSubMenu();
		  _Current_MouseBottom_obj = null;
		_previous_MouseBottom_obj = null;
		previousSubMenu = null;
		CurrentSubMenu = null;
		m_material.set_diffuse_color(m_scenes.get_object_by_name("B4W"),"Material.002", ColorDefault);
		m_material.set_diffuse_color(m_scenes.get_object_by_name("Dragon3DGraff"),"Material.002", ColorDefault);
	  }
}
function HideALLSubMenu(){
	if(SubMenuArray.length !=0){
	for (var m=0;m<SubMenuArray.length;m++){
	  var MainMenuSelectedCURR = m_scenes.get_object_by_name("MainMenu_"+m, 1);
	 
		//тут надо все подменю убрать в ноль относительно своего главного меню
		for (var c=0;c<SubMenuArray[m].length;c++){
		 var SubMenuOpenC = m_scenes.get_object_by_name(SubMenuArray[m][c].name,1);
     m_trans.set_translation_obj_rel(SubMenuOpenC, 0, 0, 0, MainMenuSelectedCURR);
	 m_material.set_diffuse_color(SubMenuOpenC,"Material.002", ColorDefault);
		}
		 	m_trans.set_scale(MainMenuSelectedCURR,1);
	}	
  
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
	var Object_Data_id = "";
	object_name = "Имя: " + m_scenes.get_object_name(objPicked) + "<br>";
	object_b_b_topPoint = "Верхняя точка: " + m_trans.get_object_bounding_box(objPicked).max_y.toPrecision(Accuracy) + "<br>";
	object_b_b_bottomPoint = "Нижняя точка: " + m_trans.get_object_bounding_box(objPicked).min_y.toPrecision(Accuracy) + "<br>";
	translation = "Положение центра:" + "<br>" 
	            + "   X = " + m_trans.get_translation(objPicked)[0].toPrecision(Accuracy)+ "<br>"
	            + "   Y = " + m_trans.get_translation(objPicked)[1].toPrecision(Accuracy)+ "  - Это ВВЕРХ!!!" + "<br>"
			    + "   Z = " + m_trans.get_translation(objPicked)[2].toPrecision(Accuracy)+ "<br>";
	//m_trans.distance(objME,SubMenuOpen );
	object_height = "Высота объекта: " + (m_trans.get_object_bounding_box(objPicked).max_y - m_trans.get_object_bounding_box(objPicked).min_y)  + "<br>";
Object_Data_id = "Object_Data_id " + m_scenes.get_object_data_id(objPicked) + "<br>";
	//object_size = "Размер объекта:  " + m_trans.get_object_size(objPicked).toPrecision(Accuracy) + "<br>";
	Which_Canvas = "main_canvas_container" + "<br>";
	SummuryInfo = Which_Canvas + object_name + translation + object_b_b_topPoint + object_b_b_bottomPoint + object_height + Object_Data_id;
	return SummuryInfo;
}
addEventListener("keydown", function(event) {
    if (event.keyCode == 27)   
   CanvasSmall();
  });
function CanvasGrow(){
main_canvas_container.style.height = "80%";
main_canvas_container.style.width = "55%";
main_canvas_container.style.zIndex = "1";
 m_app.enable_controls();
    m_app.enable_camera_controls();
}
function CanvasSmall(){
main_canvas_container.style.height = "";
main_canvas_container.style.width="";
main_canvas_container.style.zIndex = "";
 m_app.disable_camera_controls();
  m_app.disable_controls(); 
}


});

// import the app module and start the app by calling the init method
b4w.require("Menu", "MENU_1").init();