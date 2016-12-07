"use strict"

// register the application module
b4w.register("Contest", function(exports, require) {

// import modules used by the app
var m_constraints = require("constraints");
var m_app       = require("app");
var m_data      = require("data");
var m_cfg       = require("config");
var m_obj	= require("objects");
var m_transform = require("transform");
var m_anim	= require("animation");
var m_scenes 	= require("scenes");
var m_ctl	= require("controls");
var m_time 	= require("time");
var m_cam	= require("camera");
var m_cam_anim	= require("camera_anim");
var m_tex	= require("textures");
var m_mat	= require("material");
var m_scrn	= require("screenshooter");
var m_input	= require("input");
var m_util	= require("util");
var m_main	= require("main");
var m_debug	= require("debug");

var m_preloader = require("preloader");
var m_ver       = require("version");

var FScr	= false;

//var FPS_num = 0;

var TARGET_POS;
var TARGET_PIVOT;
var TARGET_HORIZ_LIMITS;
var TARGET_VERT_LIMITS;
var DIST_LIMITS;
var PIVOT_LIMITS;

// detect application mode
var DEBUG = (m_ver.type() == "DEBUG");

// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_std_assets_path() + "Contest/";

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        show_fps: DEBUG,
        console_verbose: DEBUG,
        autoresize: true,
		quality: m_cfg.P_AUTO,
		callback: init_cb
    });
}

/**
 * callback executed when the app is initialized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

//    m_preloader.create_preloader();

    // ignore right-click on the canvas element
    canvas_elem.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
/*
	var QLevel = m_cfg.get("quality");
	
	if (QLevel == 3){
	m_cfg.set("canvas_resolution_factor", 2);
	}
*/
	m_cfg.set("canvas_resolution_factor", 2);
	m_app.set_camera_smooth_factor(1.2);
	
    load();
}

/**
 * load the scene data
 */
function load() {
	

    var preloader_cont = document.getElementById("preloader_cont");
    preloader_cont.style.visibility = "visible";

    m_data.load(APP_ASSETS_PATH + "Contest.json", load_cb, preloader_cb);

}

/**
 * update the app's preloader
 */
function preloader_cb(percentage) {
    var prelod_dynamic_path = document.getElementById("prelod_dynamic_path");
    var percantage_num      = prelod_dynamic_path.nextElementSibling;

    prelod_dynamic_path.style.width = percentage+"%";
    percantage_num.innerHTML = "Загрузка: " + percentage + "%";	   
    if (percentage == 100) {
        var preloader_cont = document.getElementById("preloader_cont");
	preloader_cont.style.visibility = "hidden";
        return;
    }
}
/**
 * callback executed when the scene data is loaded
 */
function load_cb(data_id, success) {
	
	//m_main.set_fps_callback(fps_cb);

    if (!success) {
        console.log("b4w load failure");
        return;
    }

    m_app.enable_camera_controls();

    // place your code here
	
	//var fps_callback = 0;
	var res = 2;
	
	var wheel = m_scenes.get_object_by_name("Wheel");
	var wheel_02 = m_scenes.get_object_by_name("Wheel_02");
	var asphalt = m_scenes.get_object_by_name("floor");
	var helm = m_scenes.get_object_by_name("helm");
	var main = m_scenes.get_object_by_name("main");

	var MainCanvas = document.getElementById("main_canvas_container");
	//функция создания иконок
	CreateIcons (MainCanvas);
	//создание остального интерфейса
	
	var LogoContainer = document.createElement("div");
	LogoContainer.setAttribute("id", "logo");
		
	var LogoMarginLeft = MainCanvas.offsetWidth/7*3;
	var LogoMarginTop = MainCanvas.offsetHeight/5.5;
	var LogoWidth = MainCanvas.offsetWidth/7;
	var LogoHeight = LogoWidth/2;
	
	LogoContainer.style.cssText="opacity: 0; width:"+LogoWidth+"px; height: "+LogoHeight+"px; margin-top: "+LogoMarginTop+"px; margin-left:"+LogoMarginLeft+"px; position: absolute;";
	
	LogoContainer.innerHTML = LogoContainer.innerHTML+"<img style=\"position: absolute;\" height="+LogoHeight+" width="+LogoWidth+" src=\"images/logo.svg\">";
	MainCanvas.appendChild(LogoContainer);
	
	//история
	var TextContainer = document.createElement("div");
	TextContainer.setAttribute("id", "mainText");

	var TextMarginLeft = MainCanvas.offsetWidth/8*5.7;
	var TextMarginTop = MainCanvas.offsetHeight/4;
	var TextWidth = MainCanvas.offsetWidth/5;
	var TextHeight = MainCanvas.offsetHeight/3;
	var FontSize = Math.round(TextWidth/25);

	TextContainer.style.cssText="opacity: 0; width:"+TextWidth+"px; height: "+TextHeight+"px; margin-top: "+TextMarginTop+"px; margin-left:"+TextMarginLeft+"px; position: absolute;";

	TextContainer.innerHTML = TextContainer.innerHTML+"<p style=\"font-style: italic; color: #EBEBFF; font-size:"+(FontSize*1.065)+"pt; text-align: right; font-family: 'Rubik', sans-serif;\"> \«Роскошный автомобиль, доступный для каждого жителя Америки\»</p>";
	TextContainer.innerHTML = TextContainer.innerHTML+"<p style=\"font-style: italic; color: #EBEBFF; font-size:"+(FontSize/1.5)+"pt; text-align: right; font-family: 'Rubik', sans-serif;\">Эд Коул, разработчик</p><br>";
	TextContainer.innerHTML = TextContainer.innerHTML+"<p style=\"font-size:"+(FontSize/1.2)+"pt; text-align: justify; font-family: 'Rubik', sans-serif;\">Impala 1958 года стала первым автомобилем легендарной серии, новые поколения которой выпускаются по сей день.</p>";
	TextContainer.innerHTML = TextContainer.innerHTML+"<p style=\"font-size:"+(FontSize/1.2)+"pt; text-align: justify; font-family: 'Rubik', sans-serif;\">Неповторимый стиль 50-х, роскошный салон и 315 лошадей под капотом (благодаря 5,7-литровому двигателю) сделали импалу самым дорогим и популярным автомобилем модельного ряда завода.</p>";

	MainCanvas.appendChild(TextContainer);
	//Цвета
	var ColorContainer = document.createElement("div");
	ColorContainer.setAttribute("id", "changeColors");
	var ColorMarginLeft = MainCanvas.offsetWidth/6;
	var ColorMarginTop = MainCanvas.offsetHeight/4;
	var ColorWidth = MainCanvas.offsetWidth/7;
	var ColorHeight = MainCanvas.offsetHeight/2;

	ColorContainer.style.cssText="opacity: 0; width:"+ColorWidth*0.9+"px; height: "+ColorHeight+"px; margin-top: "+ColorMarginTop+"px; margin-left:"+ColorMarginLeft+"px; color: #EBEBFF; position: absolute;";
	
	var ColorValue = [];
	var colorBtnHeight = ColorHeight/15;	
		
	ColorValue[0] = "<div class=\"ColorValue\" id=\"OnyxBlack\" style=\"background-color: #000000;";
	ColorValue[1] = "<div class=\"ColorValue\" id=\"GlenGreen\" style=\"background-color: #8EC2BA;";
	ColorValue[2] = "<div class=\"ColorValue\" id=\"ForestGreen\" style=\"background-color: #365654;";
	ColorValue[3] = "<div class=\"ColorValue\" id=\"CashemereBlue\" style=\"background-color: #5F95BF;";
	ColorValue[4] = "<div class=\"ColorValue\" id=\"FathomBlue\" style=\"background-color: #284267;";
	ColorValue[5] = "<div class=\"ColorValue\" id=\"TropicTurquoise\" style=\"background-color: #70A6BC;";
	ColorValue[6] = "<div class=\"ColorValue\" id=\"AegeanTurquoise\" style=\"background-color: #2F4E5C;";
	ColorValue[7] = "<div class=\"ColorValue\" id=\"SilverBlue\" style=\"background-color: #8197AA;";
	ColorValue[8] = "<div class=\"ColorValue\" id=\"AnniversaryGold\" style=\"background-color: #937C36;";
	ColorValue[9] = "<div class=\"ColorValue\" id=\"SierraGold\" style=\"background-color: #934131;";
	ColorValue[10] = "<div class=\"ColorValue\" id=\"ClayCoral\" style=\"background-color: #90625B;";
	ColorValue[11] = "<div class=\"ColorValue\" id=\"RioRed\" style=\"background-color: #C2372D;";
	ColorValue[12] = "<div class=\"ColorValue\" id=\"ColonialCream\" style=\"background-color: #DDDF9A;";
	ColorValue[13] = "<div class=\"ColorValue\" id=\"SnowcrestWhite\" style=\"background-color: #FCFFEC;";
	ColorValue[14] = "<div class=\"ColorValue\" id=\"HoneyBeige\" style=\"background-color: #F9ECC5;";
		
	var TextValue = [];
	
	TextValue[0] = "id=\"OnyxBlackT\">Onyx Black</p>";
	TextValue[1] = "id=\"GlenGreenT\">Glen Green</p>";
	TextValue[2] = "id=\"ForestGreen\">Forest Green</p>";
	TextValue[3] = "<p id=\"CashemereBlue\">Cashemere Blue</p>";
	TextValue[4] = "<p id=\"FathomBlue\">Fathom Blue</p>";
	TextValue[5] = "<p id=\"TropicTurquoise\">Tropic Turquoise</p>";
	TextValue[6] = "<p id=\"AegeanTurquoise\">Aegean Turquoise</p>";
	TextValue[7] = "<p id=\"SilverBlue\">Silver Blue</p>";
	TextValue[8] = "<p id=\"AnniversaryGold\">Anniversary Gold</p>";
	TextValue[9] = "<p id=\"SierraGold\">Sierra Gold</p>";
	TextValue[10] = "<p id=\"ClayCoral\">Clay Coral</p>";
	TextValue[11] = "<p id=\"RioRed\">Rio Red</p>";
	TextValue[12] = "<p id=\"ColonialCream\">Colonial Cream</p>";
	TextValue[13] = "<p id=\"SnowcrestWhite\">Snowcrest White</p>";
	TextValue[14] = "<p id=\"HoneyBeige\">Honey Beige</p>";	

	ColorContainer.innerHTML = ColorContainer.innerHTML + "<span id=\"colorTitle\" style=\"font-size: "+FontSize*1.5+"pt; margin-top: -"+ColorHeight/15*1.25+"pt;\">Заводские цвета:</span>";
	
	for (var i = 0; i < 15; i++) {
		ColorContainer.innerHTML = ColorContainer.innerHTML + "<div id=\"colorBtn_"+i+"\" style=\"height:"+ColorHeight/15+"px;\">"+ColorValue[i]+"position: absolute; height:"+colorBtnHeight*0.7+"px; width:"+colorBtnHeight*3*0.71+"px; margin-left:"+colorBtnHeight*0.064+"px;\"></div><img style=\"position: absolute;\" id=color"+i+" src=\"images/color_frame.png\" height="+ColorHeight/20+"><p  style=\"position: absolute; font-size:"+(FontSize/1.2)+"pt; margin-left:"+colorBtnHeight*3+"px; margin-top:"+colorBtnHeight*0.1+"px\" "+TextValue[i]+"</div>";
	}
	
	MainCanvas.appendChild(ColorContainer);

	var OnyxBlack = [0,0,0,0,0,0,0,0,0,0,0,0,0.068,0.068,0.068];
	var GlenGreen = [0.077,0.147,0.135,0.081,0.156,0.143,0.076,0.487,0.674,0.0,0.029,0.274,0.346,0.380,0.372];
	var ForestGreen = [0.037,0.093,0.089,0.037,0.093,0.089,0.081,0.361,0.393,0.057,0.147,0.140,0.317,0.388,0.417];
	var CashemereBlue =[0.054,0.137,0.233,0.044,0.110,0.186,0.158,0.380,0.165,0.085,0.163,0.149,0.288,0.395,0.462];
	var FathomBlue = [0.036,0.098,0.253,0.021,0.054,0.136,0.529,0.674,0,0.05,0.140,0.367,0.254,0.538,0.460];
	var TropicTurquoise = [0.061,0.137,0.179,0.056,0.125,0.163,0.359,0.711,0.651,0.13,0.253,0.231,0.331,0.417,0.477];
	var AegeanTurquoise = [0.04,0.109,0.155,0.023,0.060,0.084,0.363,0.729,0.663,0.037,0.068,0.063,0.331,0.417,0.477];
	var SilverBlue = [0.026,0.034,0.043,0.109,0.152,0.196,0.013,0.402,0.021,0.056,0.082,0.107,0.301,0.379,0.434];
	var AnniversaryGold = [0.119,0.084,0.017,0.073,0.052,0.012,0.729,0.460,0.109,0.292,0.202,0.037,0.523,0.505,0.456];
	var SierraGold = [0.223,0.042,0.025,0.047,0.011,0.007,0.604,0.354,0.002,0.292,0.053,0.031,0.367,0.314,0.264];
	var ClayCoral = [0.113,0.052,0.045,0.095,0.044,0.038,0.621,0.299,0.126,0.279,0.122,0.105,0.434,0.420,0.379];
	var RioRed = [0.434,0.006,0.000,0.233,0,0.007,0.287,0,1,0.141,0,0.003,0.787,0.323,0.212];
	var ColonialCream = [0.13,0.133,0.062,0.118,0.120,0.056,0.141,0.420,0.257,0.087,0.089,0.042,0.567,0.570,0.423];
	var SnowcrestWhite = [0.092,0.095,0.081,0.058,0.059,0.051,0.266,0.451,0.492,0.334,0.342,0.289,0.504,0.507,0.377];
	var HoneyBeige = [0.196,0.175,0.119,0.084,0.075,0.052,0.171,0.152,0.104,0.107,0.095,0.066,0.604,0.535,0.358];
	
	var AsphaltVPosition = 0;
	var angleObject = m_scenes.get_object_by_name("AngleObject");
	var angleToSpeed = 0;
	var speed = 0;
	var speedNum = 0;
	var speedArrow = m_scenes.get_object_by_name("arrow");

	var cam = m_scenes.get_active_camera();
	
	var move_sensor = m_ctl.create_motion_sensor(cam, 0.001, 0.001);
	m_constraints.append_track(angleObject, cam);

	var CamPosition = 0;
	var PivotPosition = 0;
	var CamPositionHud = document.createElement("div");
	
	var OpacityHUD = 0;

			m_anim.apply(wheel, "WheelRotate", m_anim.SLOT_0);
			m_anim.set_behavior(wheel, m_anim.AB_CYCLIC, m_anim.SLOT_0);
			m_anim.play(wheel, m_anim.SLOT_0);
			m_anim.set_speed(wheel, 0.001, m_anim.SLOT_0);

			m_anim.apply(wheel_02, "WheelRotate", m_anim.SLOT_0);
			m_anim.set_behavior(wheel_02, m_anim.AB_CYCLIC, m_anim.SLOT_0);
			m_anim.play(wheel_02, m_anim.SLOT_0);
			m_anim.set_speed(wheel_02, 0.001, m_anim.SLOT_0);

			m_anim.set_speed(asphalt, 0.001);
			
			m_anim.apply(speedArrow, "speed", m_anim.SLOT_0);

	var cam_move_cb = function(obj, id, pulse) {

		angleToSpeed = m_transform.get_rotation(angleObject);
		speed = Math.pow(angleToSpeed[2],1.2)*6;
		
		speedNum = speed/3.6*100;
		
		if (speedNum <= 100){
			m_anim.set_frame(speedArrow, speedNum/1.1, m_anim.SLOT_0);
		}
		else{
			m_anim.set_frame(speedArrow, 100/1.1, m_anim.SLOT_0);
		}
		
		if (speedNum < 0){
			m_anim.set_frame(speedArrow, 1, m_anim.SLOT_0);
		}
		
		//m_anim.play(camera, m_anim.SLOT_0);

			
		CamPosition = m_cam.get_translation(cam);
		
		
		//angleToSpeed = -CamPosition[1];
		//speed = (angleToSpeed-angleToSpeed/2)/5;
		
		//m_main.FPSCallback(fps_avg, phy_fps_avg)
		
		//CamPositionHud.innerHTML = CamPositionHud.innerHTML + "<span style=\"position: absolute; background-color: green; color: white; font-size: 30pt;\">"+FPS_num+"</span>";		
		//MainCanvas.appendChild(CamPositionHud);
		
		//if (FPS_num < 30){
//			res = res/4;
//			m_cfg.set("canvas_resolution_factor", res);
//		}
		
		

		if (m_anim.is_play(cam) == false){
			PivotPosition = m_cam.target_get_pivot(cam);
			
			if (PivotPosition[1] > 0){
				PivotPosition[1] = 0;
				m_cam.target_set_trans_pivot(cam, PivotPosition);
			}
		}

		if (speed > 0){
			m_anim.set_speed(asphalt, speed);
			m_anim.set_speed(wheel, speed);
			m_anim.set_speed(wheel_02, speed);
		}
		if (CamPosition[1] >= (-10) && (m_anim.is_play(cam) == false)){
			OpacityHUD = 1-(-CamPosition[1])/10;
			document.getElementById('changeColors').style.opacity = OpacityHUD;
			document.getElementById('changeColors').style.marginTop = ColorMarginTop+"px";
			
			document.getElementById('logo').style.opacity = OpacityHUD;
			document.getElementById('logo').style.marginTop = LogoMarginTop+"px";
						
			document.getElementById('mainText').style.opacity = OpacityHUD;
			document.getElementById('mainText').style.marginTop = TextMarginTop+"px";
		}
		else{
			document.getElementById('changeColors').style.marginTop = -4000+"px";
			document.getElementById('mainText').style.marginTop = -4000+"px";
			document.getElementById('logo').style.marginTop = -4000+"px";

		}
		
		if (CamPosition[0] > -25){
			document.getElementById('changeColors').style.marginTop = -4000+"px";
			document.getElementById('mainText').style.marginTop = -4000+"px";
			document.getElementById('logo').style.marginTop = -4000+"px";
			
		}	
	}
	
	m_ctl.create_sensor_manifold(cam, "CAM_MOVE", m_ctl.CT_POSITIVE, [move_sensor], function(s) { return s[0] }, cam_move_cb);

	document.getElementById('colorBtn_0').onclick = function (){
		ChangeColor(main, OnyxBlack);
		ChangeColor(wheel, OnyxBlack, true);
		ChangeColor(wheel_02, OnyxBlack, true);
		ChangeColor(helm, OnyxBlack);
	}
	document.getElementById('colorBtn_1').onclick = function (){
		ChangeColor(main, GlenGreen);
		ChangeColor(wheel, GlenGreen, true);
		ChangeColor(wheel_02, GlenGreen, true);
		ChangeColor(helm, GlenGreen);
	}
	document.getElementById('colorBtn_2').onclick = function (){
		ChangeColor(main, ForestGreen);
		ChangeColor(wheel, ForestGreen, true);
		ChangeColor(wheel_02, ForestGreen, true);
		ChangeColor(helm, ForestGreen);
	}
	document.getElementById('colorBtn_3').onclick = function (){
		ChangeColor(main, CashemereBlue);
		ChangeColor(wheel, CashemereBlue, true);
		ChangeColor(wheel_02, CashemereBlue, true);
		ChangeColor(helm, CashemereBlue);
	}
	document.getElementById('colorBtn_4').onclick = function (){
		ChangeColor(main, FathomBlue);
		ChangeColor(wheel, FathomBlue, true);
		ChangeColor(wheel_02, FathomBlue, true);
		ChangeColor(helm, FathomBlue);
	}
	document.getElementById('colorBtn_5').onclick = function (){
		ChangeColor(main, TropicTurquoise);
		ChangeColor(wheel, TropicTurquoise, true);
		ChangeColor(wheel_02, TropicTurquoise, true);
		ChangeColor(helm, TropicTurquoise);
	}
	document.getElementById('colorBtn_6').onclick = function (){
		ChangeColor(main, AegeanTurquoise);
		ChangeColor(wheel, AegeanTurquoise, true);
		ChangeColor(wheel_02, AegeanTurquoise, true);
		ChangeColor(helm, AegeanTurquoise);
	}
	document.getElementById('colorBtn_7').onclick = function (){
		ChangeColor(main, SilverBlue);
		ChangeColor(wheel, SilverBlue, true);
		ChangeColor(wheel_02, SilverBlue, true);
		ChangeColor(helm, SilverBlue);
	}
	document.getElementById('colorBtn_8').onclick = function (){
		ChangeColor(main, AnniversaryGold);
		ChangeColor(wheel, AnniversaryGold, true);
		ChangeColor(wheel_02, AnniversaryGold, true);
		ChangeColor(helm, AnniversaryGold);
	}
	document.getElementById('colorBtn_9').onclick = function (){
		ChangeColor(main, SierraGold);
		ChangeColor(wheel, SierraGold, true);
		ChangeColor(wheel_02, SierraGold, true);
		ChangeColor(helm, SierraGold);
	}
	document.getElementById('colorBtn_10').onclick = function (){
		ChangeColor(main, ClayCoral);
		ChangeColor(wheel, ClayCoral, true);
		ChangeColor(wheel_02, ClayCoral, true);
		ChangeColor(helm, ClayCoral);
	}
	document.getElementById('colorBtn_11').onclick = function (){
		ChangeColor(main, RioRed);
		ChangeColor(wheel, RioRed, true);
		ChangeColor(wheel_02, RioRed, true);
		ChangeColor(helm, RioRed);
	}
	document.getElementById('colorBtn_12').onclick = function (){
		ChangeColor(main, ColonialCream);
		ChangeColor(wheel, ColonialCream, true);
		ChangeColor(wheel_02, ColonialCream, true);
		ChangeColor(helm, ColonialCream);
	}
	document.getElementById('colorBtn_13').onclick = function (){
		ChangeColor(main, SnowcrestWhite);
		ChangeColor(wheel, SnowcrestWhite, true);
		ChangeColor(wheel_02, SnowcrestWhite, true);
		ChangeColor(helm, SnowcrestWhite);
	}
	document.getElementById('colorBtn_14').onclick = function (){
		ChangeColor(main, HoneyBeige);
		ChangeColor(wheel, HoneyBeige, true);
		ChangeColor(wheel_02, HoneyBeige, true);
		ChangeColor(helm, HoneyBeige);
	}

	document.getElementById('full_scrn').onclick = function (){
		enter_fullscreen();
	}

	document.getElementById('shot').onclick = function (){
		m_scrn.shot();
	}

	document.getElementById('movie').onclick = function (){
		cameraAnimation(cam);
	}

}

function ChangeColor(object, ColorData, animFlag) {

	m_mat.set_nodemat_rgb(object, ["Car_paint","Color_main_new"], ColorData[0], ColorData[1], ColorData[2]);
	m_mat.set_nodemat_rgb(object, ["Car_paint","Color_add_new"], ColorData[3], ColorData[4], ColorData[5]);
	m_mat.set_nodemat_rgb(object, ["Car_paint","Color_flack_new"], ColorData[6], ColorData[7], ColorData[8]);
	m_mat.set_nodemat_rgb(object, ["Car_paint","Color_reflect_01_new"], ColorData[9], ColorData[10], ColorData[11]);
	m_mat.set_nodemat_rgb(object, ["Car_paint","Color_reflect_02_new"], ColorData[12], ColorData[13], ColorData[14]);

	m_anim.apply(object, "ChangeColor", m_anim.SLOT_0);
	m_anim.set_behavior(object, m_anim.AB_FINISH_STOP);

	m_anim.play(object, function(){
		m_mat.set_nodemat_rgb(object, ["Car_paint","Color_main"], ColorData[0], ColorData[1], ColorData[2]);
		m_mat.set_nodemat_rgb(object, ["Car_paint","Color_add"], ColorData[3], ColorData[4], ColorData[5]);
		m_mat.set_nodemat_rgb(object, ["Car_paint","Color_flack"], ColorData[6], ColorData[7], ColorData[8]);
		m_mat.set_nodemat_rgb(object, ["Car_paint","Color_reflect_01"], ColorData[9], ColorData[10], ColorData[11]);
		m_mat.set_nodemat_rgb(object, ["Car_paint","Color_reflect_02"], ColorData[12], ColorData[13], ColorData[14]);

		if (animFlag == true){
			m_anim.apply(object, "WheelRotate", m_anim.SLOT_0);
			m_anim.set_behavior(object, m_anim.AB_CYCLIC, m_anim.SLOT_0);
			m_anim.play(object, m_anim.SLOT_0);
		}

	}, m_anim.SLOT_0);

};

function enter_fullscreen(e) {
	if (FScr == false){
			m_app.request_fullscreen(document.body);
			FScr = true;
	}
	else{
		m_app.exit_fullscreen();
		FScr = false;
		CreateInterface();
	}
}

function CreateIcons (MainCanvas){

	var IconsContainer = document.createElement("div");
	IconsContainer.setAttribute("id", "icons");
	var IconsHeight = MainCanvas.offsetHeight/8;
	var IconsWidth =IconsHeight*3;
	var IconsMarginLeft = MainCanvas.offsetWidth/2-IconsWidth/2;
	var IconsMarginTop = IconsHeight*6.8;

	IconsContainer.style.cssText="width:"+IconsWidth+"px; height: "+IconsHeight+"px; margin-top: "+IconsMarginTop+"px; margin-left:"+IconsMarginLeft+"px; position: absolute;";

	IconsContainer.innerHTML = IconsContainer.innerHTML+"<img class=\"icon\" id=\"shot\" height="+IconsHeight+" src=\"images/icon_photo.png\">";
	IconsContainer.innerHTML = IconsContainer.innerHTML+"<img class=\"icon\" id=\"movie\" height="+IconsHeight+" src=\"images/icon_camera.png\">";
	IconsContainer.innerHTML = IconsContainer.innerHTML+"<img class=\"icon\" id=\"full_scrn\" height="+IconsHeight+" src=\"images/icon_tv.png\">";

	MainCanvas.appendChild(IconsContainer);
}

function cameraAnimation(camera) {
	var camera = m_scenes.get_active_camera();	
	if (m_anim.is_play(camera) == false){
				
		TARGET_POS = m_cam.get_translation(camera);
		TARGET_PIVOT = m_cam.target_get_pivot(camera);
		TARGET_HORIZ_LIMITS = m_cam.target_get_horizontal_limits(camera);
		TARGET_VERT_LIMITS =  m_cam.target_get_vertical_limits(camera);
		DIST_LIMITS =  m_cam.target_get_distance_limits(camera);

		var STATIC_POS = new Float32Array([-14.5, -7, 2.6]);
		var STATIC_LOOK_AT = new Float32Array([0, 0, 0]);
   	
		m_cam.static_setup(camera, { pos: STATIC_POS, look_at: STATIC_LOOK_AT });
		m_cam.correct_up(camera, m_util.AXIS_Z, true);
		m_anim.apply(camera, "movie", m_anim.SLOT_0);
		var animLength = m_anim.get_anim_length(camera);
		m_anim.set_behavior(camera, m_anim.AB_CYCLIC, m_anim.SLOT_0);
		m_anim.play(camera, m_anim.SLOT_0);

		m_anim.set_frame(camera, (((Math.random()*(8-1))+1)*200), m_anim.SLOT_0);
	}
	else{
		m_anim.stop(camera, m_anim.SLOT_0);
		m_anim.remove_slot_animation(camera);

		m_cam.target_setup(camera, { pos: TARGET_POS, pivot: TARGET_PIVOT, 
		horiz_rot_lim: TARGET_HORIZ_LIMITS, vert_rot_lim: TARGET_VERT_LIMITS, 
		dist_lim: DIST_LIMITS/*, pivot_lim: PIVOT_LIMITS*/ });
	}
}
/*
function fps_cb(fps_avg, phy_fps_avg) {
        FPS_num = fps_avg;
    }
*/

});
b4w.require("Contest").init();
