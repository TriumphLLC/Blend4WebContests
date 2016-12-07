var BTN_CAM=document.getElementById("driveBtn");
var _TXT=document.getElementById("txt");
var _MENU=document.getElementById("colorPicker");
var _ICO=document.getElementById("ico");

var doorOpen=false,doorOpen2=false;
var m_obj, BTN_BC, BTN_GC;
var drift, _smokeDrift, smoke_parts=0,speedS;
	 
	
var driving=false;
var CAM_SOFTNESS = 0.2;
var CAM_OFFSET = new Float32Array([0, 10,  2.5]);
var POS = new Float32Array([0,-12,0.56]);
var LOOK_AT = new Float32Array([0,0,0]);
var EYE_HORIZ_LIMITS = { left: Math.PI/4, right: -Math.PI/4 };
var EYE_VERT_LIMITS = { down: -Math.PI/4, up: Math.PI/4 };
var TARGET_DIST_LIMITS = { min: 3.760, max: 20 };
var HOVER_DIST_LIMITS = { min: 1, max: 10 };
var HOVER_ANGLE_LIMITS = { down: 0, up: -Math.PI/4 };
var HOVER_HORIZ_TRANS_LIMITS = { min: -5, max: 3 };
var HOVER_VERT_TRANS_LIMITS = { min: -1, max: 1 };
	 
"use strict"

// register the application module
b4w.register("shelbyMGT500", function(exports, require) {

// import modules used by the app
var m_app       = require("app");
var m_cfg       = require("config");
var m_data      = require("data");
var m_preloader = require("preloader");
var m_ver       = require("version");
var m_scenes  = require("scenes");
var m_cont    = require("container");
var m_mouse   = require("mouse");
var m_trans   = require("transform");
m_obj = require("objects");
var m_cam=require("camera")
var m_cons  = require("constraints");
var m_anim  = require("animation");
var m_part  = require("particles");
var m_phy  = require("physics");
var m_sfx  = require("sfx");
var m_tex     = require("textures");
var m_mat   = require("material");
var m_ctl = require("controls");
// detect application mode
var DEBUG = (m_ver.type() == "DEBUG");

// automatically detect assets path
var APP_ASSETS_PATH =_themeURL + "assets/shelbyMGT500/";

/**
 * export the method to initialize the app (called at the bottom of this file)
 */


exports.init = function() {
	
	if(detect_mobile())
        var quality = m_cfg.P_LOW;
    else
        var quality = m_cfg.P_HIGH;
			        
			        
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        show_fps: DEBUG,
        console_verbose: DEBUG,
         quality: quality,
        autoresize: true
    });
};

/**
 * callback executed when the app is initialized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    m_preloader.create_preloader();

    // ignore right-click on the canvas element
    canvas_elem.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    load();
}
function detect_mobile() {
			    if( navigator.userAgent.match(/Android/i)
			     || navigator.userAgent.match(/webOS/i)
			     || navigator.userAgent.match(/iPhone/i)
			     || navigator.userAgent.match(/iPad/i)
			     || navigator.userAgent.match(/iPod/i)
			     || navigator.userAgent.match(/BlackBerry/i)
			     || navigator.userAgent.match(/Windows Phone/i)) {
			        return true;
			    } else {
			        return false;
			    }
			}
/**
 * load the scene data
 */
function load() {
    m_data.load(APP_ASSETS_PATH + "shelbyMGT500.json", load_cb, preloader_cb);
}

/**
 * update the app's preloader
 */
function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
}

/**
 * callback executed when the scene data is loaded
 */
function load_cb(data_id, success) {

    if (!success) {
        console.log("b4w load failure");
        return;
    }

    m_app.enable_camera_controls();
	
    // place your code here
    var container = m_cont.get_canvas();   
    
    _smokeDrift = m_scenes.get_object_by_name("smoke-emitter");
    _doorL_sensor=m_scenes.get_object_by_name("select-door-left");
    _doorR_sensor=m_scenes.get_object_by_name("select-door-right");
    m_anim.stop(_smokeDrift);
    m_part.set_factor(_smokeDrift, "smoke",0);
  	car = m_scenes.get_object_by_name("car-ctrl");
  	car_chassis = m_scenes.get_object_by_name("car");
  	car_seats = m_scenes.get_object_by_name("seat");
	var BTN1=document.getElementById("btnStartEngine");
	BTN1.addEventListener("mousedown", menu_ctrl, false);
	
	
	
	BTN_CAM.addEventListener("mousedown",changeCamera,false)
	
	BTN_BC=document.getElementById("base-color");
	BTN_GC=document.getElementById("graphics-color");
	//plugin colorpicker.js
	BTN_GC.className += " {onFineChange:'changeMat(this)'}";
 
	 
 	drift=m_sfx.get_speaker_objects()[1];
	var engine=m_sfx.get_speaker_objects()[2];
	m_sfx.play_def(engine);
 	speedS=m_sfx.get_speaker_objects()[0];
	 
	 
	 _character_rig= m_scenes.get_object_by_name( "Armature");	
	 container.addEventListener("mousedown", main_canvas_clicked_cb, false);
	
	 	 m_anim.apply(_character_rig,"door-left-open_B4W_BAKED",0);
	 	 
		
		
	 m_anim.set_behavior(_character_rig, m_anim.AB_FINISH_STOP); 
	 m_anim.set_frame(_character_rig, 0);
	 
	//animateScene2();
	

	var key_w     = m_ctl.create_keyboard_sensor(m_ctl.KEY_W);
    var key_s     = m_ctl.create_keyboard_sensor(m_ctl.KEY_S);
    var key_up    = m_ctl.create_keyboard_sensor(m_ctl.KEY_UP);
    var key_down  = m_ctl.create_keyboard_sensor(m_ctl.KEY_DOWN);
	var key_space     = m_ctl.create_keyboard_sensor(m_ctl.KEY_SPACE);
	

	var key_a     = m_ctl.create_keyboard_sensor(m_ctl.KEY_A);
    var key_d     = m_ctl.create_keyboard_sensor(m_ctl.KEY_D);
    var key_left  = m_ctl.create_keyboard_sensor(m_ctl.KEY_LEFT);
    var key_right = m_ctl.create_keyboard_sensor(m_ctl.KEY_RIGHT);
    var elapsed_sensor = m_ctl.create_elapsed_sensor();

    var rotate_array = [
        key_a, key_left,
        key_d, key_right,
        elapsed_sensor
    ];

    var left_logic  = function(s){return (s[0] || s[1])};
    var right_logic = function(s){return (s[2] || s[3])};
    
    var move_array = [
        key_w, key_up,
        key_s, key_down
    ];

    var forward_logic  = function(s){return (s[0] || s[1])};
    var backward_logic = function(s){return (s[2] || s[3])};
 
    function move_cb(obj, id, pulse) {
    	if( driving) {
    	
    
	        if (pulse == 1) {
	            switch(id) {
	            case "FORWARD":	             	
	                m_phy.vehicle_throttle (car, 1);
	                m_part.set_factor(_smokeDrift, "smoke",20);
	                if(  m_phy.get_vehicle_speed(car)<1){
		                m_anim.play(_smokeDrift); 
		                m_sfx.play_def(drift); 
		                m_sfx.play_def(speedS);
		               }
	                break;
	            case "BACKWARD": 
	            	m_sfx.play_def(speedS);
	                m_phy.vehicle_throttle (car, -1);
	                break;        	                         
	            }
	        } else {
	        	m_sfx.stop(drift);
	        	m_sfx.stop(speedS);
            	m_phy.vehicle_throttle_inc(car,0 ,-1);
            	m_phy.vehicle_throttle  (car, 0 )
	               
	        }
		}
        
    };
     
	function rotate_car(obj, id, pulse){
		if( driving) {
	 		if (pulse == 1) {
	            switch(id) {
	            	case "LEFT":
	            	m_phy.vehicle_steer_inc(car, 0.01, -1)
	            	break;
	        	case "RIGHT":
	            	m_phy.vehicle_steer_inc(car, 0.01, 1)
	            	break;   
	            }
	        }else {
            	m_phy.vehicle_steer(car,0);           
        	}
    	}
	}
	function stop_car(obj, id, pulse){
		if( driving) {
	 		if (pulse == 1) {
		 		m_sfx.stop(drift);
		 		console.log(m_phy.get_vehicle_speed(car),m_phy.get_vehicle_throttle(car))
				m_phy.vehicle_throttle(car, 0);
				m_phy.vehicle_throttle_inc(car,0,0)
			}else{
				console.log("UP")
			}
		}
	}
    m_ctl.create_sensor_manifold(car, "FORWARD", m_ctl.CT_TRIGGER,  move_array, forward_logic, move_cb);
    m_ctl.create_sensor_manifold(car, "BACKWARD", m_ctl.CT_TRIGGER, move_array, backward_logic, move_cb);  
  
    m_ctl.create_sensor_manifold(car, "BREAK", m_ctl.CT_TRIGGER, [key_space], function(s){return s[0]}, stop_car);   
        
    m_ctl.create_sensor_manifold(car, "LEFT", m_ctl.CT_CONTINUOUS, rotate_array, left_logic, rotate_car);
    m_ctl.create_sensor_manifold(car, "RIGHT", m_ctl.CT_CONTINUOUS, rotate_array, right_logic, rotate_car);    
	
	   m_ctl.create_sensor_manifold(_doorL_sensor, "DOORL", m_ctl.CT_TRIGGER, rotate_array, right_logic, rotate_car);    
       
}



function main_canvas_clicked_cb(e) { 
    var x = m_mouse.get_coords_x(e);
    var y = m_mouse.get_coords_y(e);

    var obj = m_scenes.pick_object(x, y);
    if (obj ) {  
        switch(m_scenes.get_object_name(obj)) {
	        case "select-door-left":
	            if(!doorOpen) { 
	            	doorOpen=true;  
	            	m_anim.apply(_character_rig,"door-left-open_B4W_BAKED",0);
					 m_anim.set_behavior(_character_rig, m_anim.AB_FINISH_STOP); 
	            	 m_anim.play(_character_rig,null,0);     
	            	        	            	
	            }else{
	            	doorOpen=false;
	            	m_anim.apply(_character_rig,"door-left-close_B4W_BAKED",1);	
	            	m_anim.set_behavior(_character_rig, m_anim.AB_FINISH_STOP); 
	            	m_anim.play(_character_rig,null,1);
	            }
	        break;
	        /*
	    	case "select-door-right":
	            if(!doorOpen2) {
	            	doorOpen2=true;    
	            	m_anim.apply(_character_rig,"door-right-open_B4W_BAKED",2);	    
	            	m_anim.set_behavior(_character_rig, m_anim.AB_FINISH_STOP);  	
	            	 m_anim.play(_character_rig,null,2);         	
	            }else{
	            	doorOpen2=false;
	            	m_anim.apply(_character_rig,"door-right-close_B4W_BAKED",3);	
	            	m_anim.set_behavior(_character_rig, m_anim.AB_FINISH_STOP); 
	            	m_anim.play(_character_rig,null,3);
	            	
	            }
	        break;
	*/
	        default:
            return;
        }
       
    }
}
 



	function changeCamera(e){
		e.preventDefault();
		var camera = m_scenes.get_active_camera();
		LOOK_AT=m_trans.get_translation(car);
		POS=m_trans.get_translation(camera);
		if(!driving){
			_TXT.innerHTML = 'DRIVE';
			_ICO.className = "";
			doorOpen=false;
			m_anim.apply(_character_rig,"door-left-close_B4W_BAKED",1);
			 m_anim.set_behavior(_character_rig, m_anim.AB_FINISH_STOP); 
        	 m_anim.play(_character_rig,null,1); 
			driving=true;
			m_cam.eye_setup(camera);
			m_cons.append_semi_soft_cam(camera, car, CAM_OFFSET, CAM_SOFTNESS);
			
		}else{
			_TXT.innerHTML = 'EXPLORE';
			_ICO.className += " open"
			driving=false;
			m_cons.remove(camera);
			m_cam.target_setup(camera, { pos: POS, pivot:LOOK_AT });
		}       
	}
	 

});

// import the app module and start the app by calling the init method
b4w.require("shelbyMGT500").init();


function changeMat(color){
		switch(color,color.valueElement.id){
			case "base-color":
				m_obj.set_nodemat_rgb(car_chassis, ["mat-car","base-color" ], color.rgb[0]/255,color.rgb[1]/255,color.rgb[2]/255);
				m_obj.set_nodemat_rgb(car_seats, ["mat-seat","color" ], color.rgb[0]/255,color.rgb[1]/255,color.rgb[2]/255);
			break;
			case "graphics-color":
				m_obj.set_nodemat_rgb(car_chassis, ["mat-car","stripes-color" ], color.rgb[0]/255,color.rgb[1]/255,color.rgb[2]/255);
			break;
	};
	
	
}
menuOpen=false;
function menu_ctrl(e){
	e.preventDefault();
	
	
	//plugin colorpicker.js
	if(!menuOpen){ 
		menuOpen=true;
		_MENU.className += " open"
	}else{
		menuOpen=false;
		_MENU.className = ""}
}
