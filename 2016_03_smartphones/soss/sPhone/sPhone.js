"use strict"

	var emptyMpButton;
	var emptyRocker;
	var emptyMc;
	var emptyUsb;
	var emptyPower;
	var emptySim;
	var emptyJag;
	

// register the application module
b4w.register("sPhone", function(exports, require) {

// import modules used by the app
var m_app       = require("app");
var m_data      = require("data");
var m_scenes    = require("scenes");
var m_anim      = require("animation");
var m_preloader = require("preloader");

var PRELOADING = true;
/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        console_verbose: true,
        autoresize: true
	    });
}

/**
 * callback executed when the app is initialized 
 */
function init_cb(canvas_elem, success) {
	m_preloader.create_simple_preloader({
		bg_color:"#00000000",
		bar_color:"#46dae5",
		background_container_id: "preloader",
		canvas_container_id: "canvas3d",
		preloader_fadeout: true})

    if (!success) {
        console.log("b4w init failure");
        return;
    }	
    canvas_elem.addEventListener("mousedown", main_canvas_click, false);
    load();
}

/**
 * load the scene data
 */
function load() {
	var p_cb = preloader_cb;
    m_data.load("sPhone.json", load_cb,p_cb,true);
}
function preloader_cb(percentage) {
       m_preloader.update_preloader(percentage);
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id) {
    m_app.enable_controls();
    m_app.enable_camera_controls();

	emptyMpButton = m_scenes.get_object_by_name("Empty_MP-Button");
	emptyRocker = m_scenes.get_object_by_name("Empty_Rocker");
	emptyMc = m_scenes.get_object_by_name("Empty_MC");
	emptyUsb = m_scenes.get_object_by_name("Empty_USB");
	emptyPower = m_scenes.get_object_by_name("Empty_Power");
	emptySim = m_scenes.get_object_by_name("Empty_SIM");
	emptyJag = m_scenes.get_object_by_name("Empty_Jag");
	
	
	m_scenes.hide_object(emptyMpButton);
	m_scenes.hide_object(emptyRocker);
	m_scenes.hide_object(emptyMc);
	m_scenes.hide_object(emptyUsb);
	m_scenes.hide_object(emptyPower);
	m_scenes.hide_object(emptySim);
	m_scenes.hide_object(emptyJag);
}

function main_canvas_click(e) {
	
    if (e.preventDefault)
        e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;
	
    var obj = m_scenes.pick_object(x, y);
	
	
	if (obj && m_scenes.get_object_name(obj) === "b_info")
	{
		if (m_scenes.is_hidden(emptyJag))
		{
			m_scenes.show_object(emptyMpButton);
			m_scenes.show_object(emptyRocker);
			m_scenes.show_object(emptyMc);
			m_scenes.show_object(emptyUsb);
			m_scenes.show_object(emptyPower);
			m_scenes.show_object(emptySim);
			m_scenes.show_object(emptyJag);
		}
		else
		{
			m_scenes.hide_object(emptyMpButton);
			m_scenes.hide_object(emptyRocker);
			m_scenes.hide_object(emptyMc);
			m_scenes.hide_object(emptyUsb);
			m_scenes.hide_object(emptyPower);
			m_scenes.hide_object(emptySim);
			m_scenes.hide_object(emptyJag);
		}
	}
}

});


// import the app module and start the app by calling the init method
b4w.require("sPhone").init();
