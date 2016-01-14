"use strict"

// register the application module
b4w.register("runner", function(exports, require) {

// import modules used by the app
var m_app  = require("app");
var m_cfg  = require("config");
var m_data = require("data");
var m_ver  = require("version");
var m_ctl   = require("controls");
var m_scs   = require("scenes");
var m_phy   = require("physics");
var m_cons  = require("constraints");
var m_obj   = require("objects");
var m_trans = require("transform");
var m_anim  = require("animation");

// detect application mode
var DEBUG = (m_ver.type() === "DEBUG");

// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_std_assets_path() + "runner/";

var _character;
var _schet_road = 1;
var _obj_okruzhenia;
var _igra_nachata = false;

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        show_fps: DEBUG,
        console_verbose: DEBUG,
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

    load();
}

/**
 * load the scene data
 */
function load() {
    m_data.load(APP_ASSETS_PATH + "runner.json", load_cb);
}

/**
 * callback executed when the scene is loaded
 */
function load_cb(data_id, success) {

    if (!success) {
        console.log("b4w load failure");
        return;
    }



    m_app.enable_controls();
/*
    m_app.enable_camera_controls();

    

    // place your code here
*/

    var camobj = m_scs.get_active_camera();
    _character = m_scs.get_first_character();
    m_cons.append_stiff_trans(camobj, _character, [0, 3.2, 12]);

    //Гравитация 
    //m_phy.set_gravity(_character,200);
    setup_movement();
    init_podarki();

    //Привязываем санту к колизии персонажа
    var OFFSET = new Float32Array([0, -0.3, 0]);
    var santa_obj = m_scs.get_object_by_name('ArmatureSanta');
    m_anim.stop(santa_obj);
    m_cons.append_stiff(santa_obj, _character, OFFSET);

    //Тащим колизию
    translate('terr1');
    translate('terr2');
    translate('terr3');

    //Тащим окружение
    _obj_okruzhenia = m_scs.get_object_children(m_scs.get_object_by_name('okruzhenie1'));
    for (var i = _obj_okruzhenia.length - 1; i >= 0; i--) {
        translate(_obj_okruzhenia[i]);
    };

    check_road();

/*
    var date = new Date();
    var terr_obj1 = m_scs.get_object_by_name('terr1');
    var terr_obj2 = m_scs.get_object_by_name('terr2');
    var terr_obj3 = m_scs.get_object_by_name('terr3');
    var new_name1 =  "terr1"+date.getTime().toString();
    var new_name2 =  "terr2"+date.getTime().toString();
    var new_name3 =  "terr3"+date.getTime().toString();
    var terr_obj_new1 = m_obj.copy(terr_obj1, new_name1);
    var terr_obj_new2 = m_obj.copy(terr_obj2, new_name2);
    var terr_obj_new3 = m_obj.copy(terr_obj3, new_name3);


    m_trans.move_local(terr_obj_new1, 0, 0, -32);
    m_trans.move_local(terr_obj_new2, 0, 0, -32);
    m_trans.move_local(terr_obj_new3, 0, 0, -32);

    m_scs.append_object(terr_obj_new1);
    m_scs.append_object(terr_obj_new2);
    m_scs.append_object(terr_obj_new3);
*/

}

function check_road(){
    var position = m_trans.get_translation(_character);

    if(Math.abs(position[2]) > 16*_schet_road){
        translate('terr1');
        translate('terr2');
        translate('terr3');

        //Тащим окружение
        _obj_okruzhenia = m_scs.get_object_children(m_scs.get_object_by_name('okruzhenie1'));
        for (var i = _obj_okruzhenia.length - 1; i >= 0; i--) {
            translate(_obj_okruzhenia[i]);
        };

        //Ставим препятствие
        if(_schet_road%4 == 0){
            generate_prep();
        }

        _schet_road++;
    }
    //console.log(position)
    //_schet_road;
    setTimeout(function(){check_road()}, 100);
}

function translate(obj_name){
    if (typeof obj_name == 'string'){
        var obj = m_scs.get_object_by_name(obj_name);
    }
    else{
        obj = obj_name;
    }
    //m_trans.move_local(obj, 0, 0, -16);
    m_trans.set_translation_obj_rel(obj, 0, 0, -16, obj);
}

function generate_prep(){
    var prep_nomer = randomInteger(1,4);

    if(prep_nomer == 1)
        var obj = m_scs.get_object_by_name('prep1');
    else if(prep_nomer == 2)
        var obj = m_scs.get_object_by_name('stena1');
    else if(prep_nomer == 3)
        var obj = m_scs.get_object_by_name('stena2');
    else if(prep_nomer == 4)
        var obj = m_scs.get_object_by_name('stena3');

    //var obj = m_scs.get_object_by_name('stena1');
    var poz_igroka = m_trans.get_translation(_character);
    poz_igroka[2] -= 48;
    poz_igroka[1] = 3.5;

    if(prep_nomer > 1){
       poz_igroka[0] = 3; 
       poz_igroka[1] = 3.2;
    }
    m_trans.set_translation_v(obj, poz_igroka)
    //m_trans.set_translation_obj_rel(obj, 0, -1, -48, );
}
//Логика для переключения типа перемещения
var switchStateMove = {
    state : m_phy.CM_WALK,
    lastStateWalk : m_phy.CM_WALK,
    ladderState: false,
    obj : 0,
    set : function(state, type){

        if(state == m_phy.CM_WALK || state == m_phy.CM_RUN){
            if(type != 'ladder'){
                this.lastStateWalk = state;
            }
        }
        
        if(type == 'ladder'){
            if(state == m_phy.CM_CLIMB){
                m_phy.set_character_move_type(this.obj, m_phy.CM_CLIMB);
                this.ladderState = true;
            }
            else{
                m_phy.set_character_move_type(this.obj, this.lastStateWalk);
                
                this.ladderState = false;
            }
        }
        else if(this.ladderState == false){
            m_phy.set_character_move_type(this.obj, state);
        }
    }
}

function init_podarki(){
    function sobitie_podarok(obj, id, pulse, param) {

        var collision_pt = m_ctl.get_sensor_payload(obj, id, 0);
        console.log({obj:obj, id:id, pulse:pulse, param:param, collision_pt:collision_pt});

    }

    function sobitie_pol(obj, id, pulse, param) {

        if (!_igra_nachata) return;
        //var collision_pt = m_ctl.get_sensor_payload(obj, id, 0);
        console.log({obj:obj, id:id, pulse:pulse, param:param});

        //Запуск и стоп анимации
        var santa_obj = m_scs.get_object_by_name('ArmatureSanta');
        if(pulse == 1){
            m_anim.play(santa_obj);
        }
        else{
            m_anim.stop(santa_obj);
        }
    }

    function sobitie_konec(obj, id, pulse, param) {

        if(pulse == 1){
            alert('HAPPY NEW YEAR !!!');
        }


    }

    var sensor_podarok = m_ctl.create_collision_sensor(_character, 'PODAROK', true);
    var sensor_pol = m_ctl.create_collision_sensor(_character, 'TERR_POL');
    var sensor_konec = m_ctl.create_collision_sensor(_character, 'KONEC');
    
    

    m_ctl.create_sensor_manifold(_character, "COLL_IN_PLAYER", m_ctl.CT_TRIGGER, [sensor_podarok],
        function(s) {
            return s[0];
        }, sobitie_podarok, 98);

    m_ctl.create_sensor_manifold(_character, "COLL2_IN_PLAYER", m_ctl.CT_TRIGGER, [sensor_pol],
        function(s) {
            return s[0];
        }, sobitie_pol, 98);

    m_ctl.create_sensor_manifold(_character, "COLL3_IN_PLAYER", m_ctl.CT_TRIGGER, [sensor_konec],
        function(s) {
            return s[0];
        }, sobitie_konec, 98);

}

function setup_movement() {

    var keyPresed = {
        keyForward:false,
        keyBackward:false,
        triggerForwardBackward:0,
        keyLeft:false,
        keyRight:false,
        triggerLeftRight:0,
        setKeyForward : function(stat){this.keyForward = stat; this.triggerForwardBackward = 1},
        setKeyBackward : function(stat){this.keyBackward = stat; this.triggerForwardBackward = -1},
        setKeyLeft : function(stat){this.keyLeft = stat; this.triggerLeftRight = 1},
        setKeyRight : function(stat){this.keyRight = stat; this.triggerLeftRight = -1},
        getForwardBackward : function(){
            if (this.keyForward && !this.keyBackward && this.triggerForwardBackward == 1) return 1;
            else if (this.keyForward && this.keyBackward && this.triggerForwardBackward == -1) return -1;
            else if (this.keyForward && !this.keyBackward && this.triggerForwardBackward == -1) return 1;

            else if (!this.keyForward && this.keyBackward && this.triggerForwardBackward == -1) return -1;
            else if (this.keyForward && this.keyBackward && this.triggerForwardBackward == 1) return 1;
            else if (!this.keyForward && this.keyBackward && this.triggerForwardBackward == 1) return -1;

            else if (!this.keyForward && !this.keyBackward) return 0;
        },
        getLeftRight : function(){
            if (this.keyLeft && !this.keyRight && this.triggerLeftRight == 1) return -1;
            else if (this.keyLeft && this.keyRight && this.triggerLeftRight == -1) return 1;
            else if (this.keyLeft && !this.keyRight && this.triggerLeftRight == -1) return -1;

            else if (!this.keyLeft && this.keyRight && this.triggerLeftRight == -1) return 1;
            else if (this.keyLeft && this.keyRight && this.triggerLeftRight == 1) return -1;
            else if (!this.keyLeft && this.keyRight && this.triggerLeftRight == 1) return 1;

            else if (!this.keyLeft && !this.keyRight) return 0;
        }
    }

    var key_a = m_ctl.create_keyboard_sensor(m_ctl.KEY_A);
    var key_s = m_ctl.create_keyboard_sensor(m_ctl.KEY_S);
    var key_d = m_ctl.create_keyboard_sensor(m_ctl.KEY_D);
    var key_w = m_ctl.create_keyboard_sensor(m_ctl.KEY_W);
    var key_space = m_ctl.create_keyboard_sensor(m_ctl.KEY_SPACE);
    var key_shift = m_ctl.create_keyboard_sensor(m_ctl.KEY_SHIFT);


    var move_state = {
        left_right: 0,
        forw_back: 0
    }

    var move_array = [key_w, key_s, key_a, key_d, key_shift];
    var character = m_scs.get_first_character();

    //init логики ходьбы
    switchStateMove.obj = character;


    var move_cb = function(obj, id, pulse) {

        //Игра начата
        if(_igra_nachata == false){
            _igra_nachata = true;
            //Запуск анимации
            
            var santa_obj = m_scs.get_object_by_name('ArmatureSanta');
            m_anim.play(santa_obj);
            
        }

        //Устанавливаем состояние кнопок
        if (pulse == 1) {
            switch (id) {
                /*
            case "FORWARD":
                keyPresed.setKeyForward(true);
                break;
            case "BACKWARD":
                keyPresed.setKeyBackward(true);
                break;
                */
            case "LEFT":
                keyPresed.setKeyLeft(true);
                break;
            case "RIGHT":
                keyPresed.setKeyRight(true);
                break;
            }
        } else {
            switch (id) {
                /*
            case "FORWARD":
                keyPresed.setKeyForward(false);
                break;
            case "BACKWARD":
                keyPresed.setKeyBackward(false);
                break;
                */
            case "LEFT":
                keyPresed.setKeyLeft(false);
                break;
            case "RIGHT":
                keyPresed.setKeyRight(false);
                break;
            }
        }

        move_state.forw_back = -1;// keyPresed.getForwardBackward();
        move_state.left_right = keyPresed.getLeftRight();

        if (pulse == 1 && id == 'RUNNING')
            switchStateMove.set(m_phy.CM_RUN);
        else if(pulse != 1 && id == 'RUNNING')
            switchStateMove.set(m_phy.CM_WALK);

        m_phy.set_character_move_dir(obj, move_state.forw_back, move_state.left_right);


    };



    m_ctl.create_sensor_manifold(character, "FORWARD", m_ctl.CT_TRIGGER,
            move_array, function(s) {return s[0]}, move_cb);
    m_ctl.create_sensor_manifold(character, "BACKWARD", m_ctl.CT_TRIGGER,
            move_array, function(s) {return s[1]}, move_cb);
    m_ctl.create_sensor_manifold(character, "LEFT", m_ctl.CT_TRIGGER,
            move_array, function(s) {return s[2]}, move_cb);
    m_ctl.create_sensor_manifold(character, "RIGHT", m_ctl.CT_TRIGGER,
            move_array, function(s) {return s[3]}, move_cb);

    var running_logic = function(s) {
        return (s[0] || s[1] || s[2] || s[3]) && s[4];
    }
    m_ctl.create_sensor_manifold(character, "RUNNING", m_ctl.CT_TRIGGER,
            move_array, running_logic, move_cb);

    var jump_cb = function(obj, id, pulse) {
        m_phy.character_jump(obj);
    }
    m_ctl.create_sensor_manifold(character, "JUMP", m_ctl.CT_SHOT,
            [key_space], null, jump_cb);
}

function randomInteger(min, max) {
  var rand = min + Math.random() * (max - min)
  rand = Math.round(rand);
  return rand;
}

});

// import the app module and start the app by calling the init method
b4w.require("runner").init();
