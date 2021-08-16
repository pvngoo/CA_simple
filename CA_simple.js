window.onload = function () {
// Значения можно изменять, экспериментируя
n = 100; // клеток квадратной клеточной области по x и по y
px_map = 400; // сторона квадрата (клеточной области) на экране (px)
m_map = 200; // сторона квадрата (клеточной области) (м)
h_Ekm = 2.5;  // По умолчанию. Толщина квазиоднородныого слоя (м)
h_const = 4; // Глубина, постоянная для всей области (м)
dir_wind_gr = 45; // Направление ветра (от 0 до 360 град.)
w_wind = 4; // Скорость ветра (м/с)
c_barrier = 0.01; // Пороговое значение концентрации для раскраски (мг/л)
z_il_barrier = 0.001; // Пороговое значение толщины ила для раскраски (мм)
ro = 1.5; // Плотность осадка с учётом разрыхления, г/см3. 
ro = ro*100*100*100/1000; // Переводимм в кг/м3
dt = 60; // Время добавления взвеси (время вбросов, мин)
b_rab = 500; // Мощность источника по взвеси (кг/мин)
pc_fr = [75, 25]; // Содержание по фракциям, можно изменять, но: сумма === 100%;
gk_fr = [0.1, 0.01]; // Гидравлические крупности  (см/с), изменять в соответствии с pc_fr[];
// Координаты клетки с вбросами
i_flight = 10; // по оси X вниз (<= n)
j_flight = 90; // по оси Y вниз (<= n)
n_after_start_stops = 200; // Интервал времени для остановов
d_n_map = 1; // Через сколько циклов выводить карту (0 - нет карты)
// далее - неизменяемые значения
m_1cell = m_map/n; // длина стороны клетки (метров/1клетку)
m2_1cell = m_1cell*m_1cell; //  площадь клетки (кв.метров/1клетку)
h=new Array(n); // двумерный массив глубин (м)
for (var i=0; i<n; i++) {
	h[i] = new Array(n);
};
for (var i=0; i<n; i++) {
	for (var j=0; j<n; j++) {
	    h[i][j] = h_const;
	}
}
shkala = []; // Рабочий массив для размещения шкал цветовых карт
n_fr = pc_fr.length; // Число фракций
n_after_start = 0; // Для подсчёта числа циклов
t_cycles_flight = 0; // Для подсчёта времени с момента начала вбросов (мин)
n_flights = 0; // Для подсчёта циклов вбросов
t_flights = 0; // Для подсчёта времени вбросов (мин)
sum_subst_flights = 0;  // Для подсчёта вбрасываемой массы
sum_subst_flights_ = 0;  // -"-
f = 0; // флаг перед первым вбросом (можно использовать для развития: f = 1, тог-
// да - продолжить, либо - новый вброс)
//
// colour(zz) - раскраска по значению глубины, концентации взвеси или толщины осадка
function colour(zz) {
    // Массивы shkala_* интервалов и цветов формируется в grider_depth()
    for (var i=0; i<shkala.length; i++) {
        if (zz>=shkala[i][0] && zz<shkala[i][1]) {
            clr = shkala[i][2]; break;
        }
    }
	return clr;
}////////////////////////////End function colour(zz)
//
// show_depth() - отображение глубин в цвете                                      
function show_depth() {
    shkala = shkala_depth;
	for (var i=0; i<n; i++) {
		for (var j=0; j<n; j++) {
            if (h[i][j] > 0) {
                document.getElementById("depths").rows[i].cells[j].style.backgroundColor = colour(h[i][j]);
			}
		}
	}
    // Помечаем клетку с вбросами
    for (var l = -1; l<=1; l++) {
        for (var m = -1; m<=1; m++) {
    		document.getElementById("depths").rows[i_flight+l].cells[j_flight+m].style.backgroundColor="red";
    	}
	}
} // End show_depth()
//
// grider_depth():                                 
//  построение таблицы-сетки для отображения происходящего в клеточной области;
//	строим шкалы цветов для глубин, концентраций и толщин осадка                   
//  раскраска клеток таблицы цветами-глубинами                 
function grider_depth() {
    var tbl="<table id='depths' style='background-color: rgba(220,240,255,0.1)+'>";
    var h_dt = px_map/n+"px";
    var w_dt = h_dt;
    for (var i_str=0; i_str<n; i_str++) {
        tbl+="<tr id=i_str>";
        for (var i_col=0; i_col<n; i_col++) { 
            tbl+="<td id=i_col style='height:"+h_dt+";width:"+w_dt+"'></td>";
        }
        tbl+="</tr>";
    }
    tbl+="</table>";
    document.getElementById("grid").innerHTML=tbl;
    // Формируем и показываем шкалу глубин (м)
	shkala_depth=[
        [0,1,"rgb(180,255,255)"],
        [1,2,"rgb(0,210,210)"],
        [2,3,"rgb(0,170,170)"],
        [3,4,"rgb(0,90,210)"],
        [4,5,"rgb(0,30,230)"],
        [5,6,"rgb(0,0,150)"],
        [6,100,"rgb(0,0,98)"]
	];
    var tbl_shkala_depth="<table id='tbl_shkala_depth'>";
    var n_delta=shkala_depth.length;
    for (var i_str=0; i_str<=1; i_str++) {
        tbl_shkala_depth+="<tr>";
        for (var i_col=0; i_col<n_delta; i_col++) {
            if (i_str==0) { 
                tbl_shkala_depth+="<td style='background:"+shkala_depth[i_col][2]+"'></td>";
            } else {
				if (i_col==0) {
                    tbl_shkala_depth+="<td>"+0+"-"+shkala_depth[i_col][1]+"</td>";
				} else if (i_col<(n_delta-1) && i_col>0) {
                    tbl_shkala_depth+="<td>"+shkala_depth[i_col][0]+"-"+shkala_depth[i_col][1]+"</td>";
				} else {
                    tbl_shkala_depth+="<td> >"+shkala_depth[i_col][0]+"</td>";
                }
            }
        }
        tbl_shkala_depth+="</tr>";
    }
    tbl_shkala_depth+="</table>";
    document.getElementById("shkala_depth").innerHTML="Шкала глубин (м)";
    document.getElementById("shkala_depth").innerHTML+=tbl_shkala_depth;
    // Формируем и показываем шкалу концентрации взвеси (мг/л)
    shkala_subst=[
        [c_barrier,5,"rgb(180,220,180)"],
        /*[2,5,"rgb(160,200,140)"],*/
        [5,10,"rgb(255,215,0)"],
        [10,20,"rgb(218,165,32)"],
        [20,50,"rgb(255,127,80)"],
        [50,100,"rgb(225,69,0)"],
        [100,200,"rgb(178,34,34)"],
        [200,500,"rgb(139,0,0)"],
        [500,10000,"rgb(128,0,128)"]
    ];
    var tbl_shkala_subst="<table id='tbl_shkala_subst'>";
    var n_delta=shkala_subst.length;
    for (var i_str=0; i_str<=1; i_str++) {
        tbl_shkala_subst+="<tr>";
        for (var i_col=0; i_col<n_delta; i_col++) {
            if (i_str==0) { 
                tbl_shkala_subst+="<td style='background:"+shkala_subst[i_col][2]+"'></td>";
            } else {
                if (i_col<(n_delta-1)) {
                    tbl_shkala_subst+="<td>"+shkala_subst[i_col][0]+"-"+shkala_subst[i_col][1]+"</td>";
                } else {
                    tbl_shkala_subst+="<td> >"+shkala_subst[i_col][0]+"</td>";
                }
            }
        }
        tbl_shkala_subst+="</tr>";
    }
    tbl_shkala_subst+="</table>";
    document.getElementById("shkala_subst").innerHTML="Шкала концентрации взвеси (мг/л)";
    document.getElementById("shkala_subst").innerHTML+=tbl_shkala_subst;
    // Формируем и показываем шкалу толщин  осадка (мм)
    shkala_il=[
        [z_il_barrier,0.1,"rgb(255,230,140)"],
        [0.1,0.2,"rgb(218,165,32)"],
        [0.2,0.5,"rgb(180,140,120)"],
        [0.5,1,"rgb(219,110,39)"],
        [1,2,"rgb(110,50,13)"],
        [2,5,"rgb(128,0,0)"],
        [5,10,"rgb(0,0,0)"],
        [10,20,"rgb(96,96,96)"],
        [20,1000,"rgb(165,165,165)"]
    ];
    var tbl_shkala_il="<table id='tbl_shkala_il'>";
    var n_delta=shkala_il.length;
    for (var i_str=0; i_str<=1; i_str++) {
        tbl_shkala_il+="<tr>";
        for (var i_col=0; i_col<n_delta; i_col++) {
            if (i_str==0) { 
                tbl_shkala_il+="<td style='background:"+shkala_il[i_col][2]+"'></td>";
            } else {
                if (i_col<(n_delta-1)) {
                    tbl_shkala_il+="<td>"+shkala_il[i_col][0]+"-"+shkala_il[i_col][1]+"</td>";
                } else {
                    tbl_shkala_il+="<td> >"+shkala_il[i_col][0]+"</td>";
                }
            }
        }
        tbl_shkala_il+="</tr>";
    }
    tbl_shkala_il+="</table>";
    document.getElementById("shkala_il").innerHTML="Шкала осадка (мм)";
    document.getElementById("shkala_il").innerHTML+=tbl_shkala_il;
	show_depth();
} // End function grider_depth()
//
// turbulent_flows() - расчёт скоростей:           
//  рассчитывается трёхмерный массив составляющих скоростей основного потока
//    (в каждой точке - 9 составляющих: по румбам + вертикальная)           
function turbulent_flows() {
    var w=new Array(9); // для весовых коэффициентов, (w[4] - для центральной клетки
    ij_max=new Array(n);
    for (var k=0; k<n; k++) {
        ij_max[k] = new Array(n);
    };
    var stream;
    var stream_h = new Array(9);
    for (var ii = 0; ii<9; ii++) {
        stream_h[ii] = 0;
    }
    var stream_h_opt = new Array(9);
    for (var ii = 0; ii<9; ii++) {
        stream_h_opt[ii] = 0;
    }
    blnc_flow_cmpnts = new Array(n); // Для компонент течения
	for (var k=0; k<n; k++) {
		blnc_flow_cmpnts[k]=new Array(n);
	};
	for (var i=0; i<n; i++) {
		for (var j=0; j<n; j++) {
		    blnc_flow_cmpnts[i][j]=new Array(9);
		}
	};
	for (var i=0; i<n; i++) {
		for (var j=0; j<n; j++) {
		    for (var k=0; k<9; k++) {
		        blnc_flow_cmpnts[i][j][k]=0;
		    }
		}
	};
    subst_mod = new Array(n);
    subst_dir = new Array(n);
    for (var k=0; k<n; k++) {
        subst_mod[k] = new Array(n);
        subst_dir[k] = new Array(n);
    };
    var stream_w = new Array(n);
    var stream_dir = new Array(n);
    for (var k=0; k<n; k++) {
        stream_w[k] = new Array(n);
        stream_dir[k] = new Array(n);
    };
    // Параметры для расчёта массива составляющих, имитирующих турбулентное течение
	var tau = 100; // Лагранжев временной масштаб (с)
	tau = tau/60; // ... мин
    //  РАСЧЁТ МАССИВОВ ВЕТРОВОЙ (ДРЕЙФОВОЙ) СОСТАВЛЯЮЩЕЙ
    var drift_w=new Array(n);
    var drift_dir=new Array(n);
    for (var k=0; k<n; k++) {
        drift_w[k]=new Array(n);
        drift_dir[k]=new Array(n);
    };
    //
    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            drift_dir[i][j]=0;
            drift_w[i][j]=0;
        }
    }
    // Расчёт скорости и направления потока (без учёта турбулентности) по формуле ГГИ
    //   Рассчитываем два двумерных (квадратных) массива направлений и скоростей 
    //   дрейфового потока (глубина постоянна, поэтому упрощаем)
    //
    var b0_ggi = 0.7;
    var b1_ggi = 0.33;
    var b2_ggi = 1.5;
    var k_r_1 = 2.0; // Для расчёта скорости и направления основного потока, по умолчанию
    var k_r_2 = 2.0;  // -"-, по умолчанию
	var drift = 0.01*(b0_ggi-b1_ggi*0.43429448*Math.log(h_const))*Math.pow(w_wind,b2_ggi)*60; // м/мин
	var mean_drift_w = drift/60; // Упрощённо: средняя (м/с) по области скорость потока (без учёта турбулентности)
	document.getElementById("mean_advection_GGI").value=Math.round(mean_drift_w*1000)/1000;
    for (var i=1; i<n-1; i++) {
        for (var j=1; j<n-1; j++) {
        	drift_w[i][j] = drift;
        	drift_dir[i][j] = dir_wind_gr; // Направление потока равно направлению ветра (пока ещё)
        }
    }
    //  Определяем векторы дрейфового потока
    for (var i=1; i<n-1; i++) {
        for (var j=1; j<n-1; j++) {
            for (var ii = 0; ii<9; ii++) {
                stream_h[ii] = 0;
            }
            if (drift_w[i][j] > 0) {
                // Определяем две составлящие дрейфового потока в соответствующей "осьмушке"
                var drift_dir_rad = drift_dir[i][j]*(Math.PI/180);
                var stream = drift_w[i][j];
                switch (Math.floor(drift_dir[i][j]/45)+1) {
                    case 1:
                        stream_h[1] = stream*(Math.abs(Math.cos(drift_dir_rad))-Math.abs(Math.sin(drift_dir_rad)));
                        stream_h[2] = stream*Math.abs(Math.sin(drift_dir_rad))*Math.SQRT2;
                    break; 
                    case 2:
                        stream_h[5] = stream*(Math.abs(Math.sin(drift_dir_rad))-Math.abs(Math.cos(drift_dir_rad)));
                        stream_h[2] = stream*Math.abs(Math.cos(drift_dir_rad))*Math.SQRT2;
                    break; 
                    case 3:
                        stream_h[5] = stream*(Math.abs(Math.sin(drift_dir_rad))-Math.abs(Math.cos(drift_dir_rad)));
                        stream_h[8] = stream*Math.abs(Math.cos(drift_dir_rad))*Math.SQRT2;
                    break; 
                    case 4:
                        stream_h[7] = stream*(Math.abs(Math.cos(drift_dir_rad))-Math.abs(Math.sin(drift_dir_rad)));
                        stream_h[8] = stream*Math.abs(Math.sin(drift_dir_rad))*Math.SQRT2;
                    break;
                    case 5:
                        stream_h[7] = stream*(Math.abs(Math.cos(drift_dir_rad))-Math.abs(Math.sin(drift_dir_rad)));
                        stream_h[6] = stream*Math.abs(Math.sin(drift_dir_rad))*Math.SQRT2;
                    break;
                    case 6:
                        stream_h[3] = stream*(Math.abs(Math.sin(drift_dir_rad))-Math.abs(Math.cos(drift_dir_rad)));
                        stream_h[6] = stream*Math.abs(Math.cos(drift_dir_rad))*Math.SQRT2;
                    break; 
                    case 7:
                        stream_h[3] = stream*(Math.abs(Math.sin(drift_dir_rad))-Math.abs(Math.cos(drift_dir_rad)));
                        stream_h[0] = stream*Math.abs(Math.cos(drift_dir_rad))*Math.SQRT2;
                    break;
                    case 8:
                        stream_h[1] = stream*(Math.abs(Math.cos(drift_dir_rad))-Math.abs(Math.sin(drift_dir_rad)));
                        stream_h[0] = stream*Math.abs(Math.sin(drift_dir_rad))*Math.SQRT2;
                };
            }

		    // 	направление потока в градусах (как и ветер - в компас)
		    stream_dir[i][j] = drift_dir[i][j];
		    stream_w[i][j] = drift_w[i][j];
        }
    }
	var ll = m_map; // Задаём масштаб колебательных движений
	var d_h_Ekm = h_Ekm/9;
    for (var i=1; i<n-1; i++) {
        for (var j=1; j<n-1; j++) {
            for (var ii = 0; ii<9; ii++) {
                stream_h[ii] = 0;
            }
		    // Рассчитываем эффективный коэффициент турбулентной диффузии 
            //  и используем его для определения полуширины струи (а её - для скорости увеличения облака):
            if (stream_w[i][j] > 0) {
		    	var K_l = tau * (1.44 + 0.273 * stream_w[i][j]*stream_w[i][j]);
		    } else {
		    	var K_l = 0;
		    }
			var u_k_befor = 2*K_l*(n/ll);
        	var w_4 = h[i][j]/d_h_Ekm;
        	if (w_4 > 8.9) {
				w_4 = 8.9;
			}
        	var w_k = (9-w_4)/9; // Упрощённо, нужно оптимизировать
        	var u_4 = w_4*u_k_befor;
        	var u_k = w_k*u_k_befor;
            // Определяем две составлящие скорости суммарного основного потока в соответствующей "осьмушке"
            // 	(слишком сложно при постоянной глубине, но ... пусть остаётся) 
            var dir_w = stream_dir[i][j] * Math.PI/180;
            switch (Math.floor(stream_dir[i][j]/45)+1) {
	            case 1:
                    stream_h[1] = stream_w[i][j]*(Math.abs(Math.cos(dir_w))-Math.abs(Math.sin(dir_w)));
                    stream_h[2] = stream_w[i][j]*Math.abs(Math.sin(dir_w))*Math.SQRT2;
	            break; 
	            case 2:
                    stream_h[5] = stream_w[i][j]*(Math.abs(Math.sin(dir_w))-Math.abs(Math.cos(dir_w)));
                    stream_h[2] = stream_w[i][j]*Math.abs(Math.cos(dir_w))*Math.SQRT2;
	            break; 
	            case 3:
                    stream_h[5] = stream_w[i][j]*(Math.abs(Math.sin(dir_w))-Math.abs(Math.cos(dir_w)));
                    stream_h[8] = stream_w[i][j]*Math.abs(Math.cos(dir_w))*Math.SQRT2;
	            break; 
	            case 4:
                    stream_h[7] = stream_w[i][j]*(Math.abs(Math.cos(dir_w))-Math.abs(Math.sin(dir_w)));
                    stream_h[8] = stream_w[i][j]*Math.abs(Math.sin(dir_w))*Math.SQRT2;
	            break;
	            case 5:
                    stream_h[7] = stream_w[i][j]*(Math.abs(Math.cos(dir_w))-Math.abs(Math.sin(dir_w)));
                    stream_h[6] = stream_w[i][j]*Math.abs(Math.sin(dir_w))*Math.SQRT2;
	            break;
	            case 6:
                    stream_h[3] = stream_w[i][j]*(Math.abs(Math.sin(dir_w))-Math.abs(Math.cos(dir_w)));
                    stream_h[6] = stream_w[i][j]*Math.abs(Math.cos(dir_w))*Math.SQRT2;
	            break; 
	            case 7:
                    stream_h[3] = stream_w[i][j]*(Math.abs(Math.sin(dir_w))-Math.abs(Math.cos(dir_w)));
                    stream_h[0] = stream_w[i][j]*Math.abs(Math.cos(dir_w))*Math.SQRT2;
	            break;
	            case 8:
                    stream_h[1] = stream_w[i][j]*(Math.abs(Math.cos(dir_w))-Math.abs(Math.sin(dir_w)));
                    stream_h[0] = stream_w[i][j]*Math.abs(Math.sin(dir_w))*Math.SQRT2;
	        };
            for (var ii = 0; ii<=8; ii++) {
            	if (ii != 4) {
					stream_h_opt[ii] = stream_h[ii]+u_k;
				} else {
					stream_h_opt[ii] = stream_h[ii]+u_4;
				}
			};
            for (var ii = 0; ii<=8; ii++) {
            	blnc_flow_cmpnts[i][j][ii]=stream_h_opt[ii];
            };
			//	Рассчитываем сумму векторов (вектор скорости адвекции) - в три этапа
			//	1-й_этап) складываем восемь попарно противоположных - получаем четыре
			var half_mod = [0,0,0,0];
			var half_dir = [0,0,0,0];
			for (var k=0; k<4; k++) {
				half_mod[k] = blnc_flow_cmpnts[i][j][k] - blnc_flow_cmpnts[i][j][8-k];
				if (half_mod[k] >= 0) {
					half_dir[k] = k;
				} else {
					half_dir[k] = 8-k;
					half_mod[k] = -half_mod[k];
				}
			}
			// 2-й_этап) складываем четыре вектора, полученных на этапе 1), получаем вектор адвекции
			//	получаем модуль скорости
			var half_mod_x = [0,0,0,0];
			var half_mod_y = [0,0,0,0];
            for (var k=0; k<4; k++) {
				switch (half_dir[k]) {
					case 0:
					    half_mod_x[k] =-half_mod[k]*Math.SQRT1_2;
						half_mod_y[k] = half_mod[k]*Math.SQRT1_2;
					break; 
					case 1:
					    half_mod_x[k] = 0;
						half_mod_y[k] = half_mod[k];
					break; 
					case 2:
					    half_mod_x[k] = half_mod[k]*Math.SQRT1_2;
						half_mod_y[k] = half_mod[k]*Math.SQRT1_2;
					break; 
					case 3:
					    half_mod_x[k] =-half_mod[k];
						half_mod_y[k] = 0;
					break;
					case 5:
					    half_mod_x[k] = half_mod[k];
						half_mod_y[k] = 0;
					break; 
					case 6:
					    half_mod_x[k] =-half_mod[k]*Math.SQRT1_2;
						half_mod_y[k] =-half_mod[k]*Math.SQRT1_2;
					break;
					case 7:
					    half_mod_x[k] = 0;
						half_mod_y[k] =-half_mod[k];
					break;
					case 8:
					    half_mod_x[k] = half_mod[k]*Math.SQRT1_2;
						half_mod_y[k] =-half_mod[k]*Math.SQRT1_2;
					break;
				};
            }				
			var subst_max;
			var subst_max_x = 0;
			var subst_max_y = 0;
            for (var k=0; k<4; k++) {
				subst_max_x = subst_max_x + half_mod_x[k];
				subst_max_y = subst_max_y + half_mod_y[k];
				subst_max = subst_max_x*subst_max_x + subst_max_y*subst_max_y;
			}
			subst_mod[i][j] = Math.sqrt(subst_max);
			// 	получаем направление адвекции в градусах (пока ещё - в компас)
			// 		направляющие косинусы
			var cos_x = subst_max_x/subst_mod[i][j];
			var cos_y = subst_max_y/subst_mod[i][j];
			// 		направляющие углы
			var angle_x = Math.acos(cos_x);
			var angle_y = Math.acos(cos_y);
			// 		и, наконец, направление от 0 до 360
			if (cos_x >= 0 && cos_y >= 0) {
				ij_max[i][j] = angle_y*(180/Math.PI);
			} else if (cos_x >= 0 && cos_y <= 0) {
				ij_max[i][j] = angle_y*(180/Math.PI);
			} else if (cos_x <= 0 && cos_y <= 0) {
				ij_max[i][j] = 360 - angle_y*(180/Math.PI);
			} else if (cos_x <= 0 && cos_y >= 0) {
				ij_max[i][j] = 360 - angle_y*(180/Math.PI);
			} else {
            	ij_max[i][j] = dir_wind_gr;
			}
            //
         };
    };
	// Рассчитываем средние по области модуль вектора адвекции с учётом турбулентности
	//	и интервалы времени прохождения одной клетки
	// 	(слишком сложно, осталось от варианта для непостоянных глубин)
	var sum_cells = n*n;
	var sum_mod = 0;
    var sum_dt_adv = 0;
	var sum_subst = 0; // для расчёта времени цикла
    for (var i=1; i<n-1; i++) {
		for (var j=1; j<n-1; j++) {
	        var m_1_rab_for_dt;
	        var dt_adv;
	        var dir_rad_rab = ij_max[i][j] * Math.PI/180;
	        if (Math.abs(Math.cos(dir_rad_rab)) >= Math.abs(Math.sin(dir_rad_rab))) {
	            m_1_rab_for_dt=1/Math.abs(Math.cos(dir_rad_rab));
	        } else {
	            m_1_rab_for_dt=1/Math.abs(Math.sin(dir_rad_rab));
	        }
            dt_adv=m_1_rab_for_dt/subst_mod[i][j]; 	//интервал времени для одной клетки 
            sum_dt_adv=sum_dt_adv+dt_adv;
            sum_mod = sum_mod + subst_mod[i][j];
        }
    }
    mean_dt_adv = sum_dt_adv/sum_cells;  // вариант интервала: по средней скорости
    mean_adv=sum_mod/sum_cells;
	document.getElementById("mean_advection").value=Math.round((mean_adv/60)*1000)/1000; // м/с
};// End turbulent_flows()
//
// transitionCloud() - расчёт концентрации и седимента для очередной фракции
function transitionCloud(i_fr, w_sedim, c, b) {
	var result = {};
    var z = new Array(n); // для седимента на текущем цикле
    for (var i=0; i<n; i++) {
        z[i] = new Array(n)
    };
    for (var i = 0; i<n; i++) {
        for (var j = 0; j<n; j++) {
            z[i][j] = 0;
        };
    };
    var w_cell = new Array(9);
    var w = new Array(9); // для весов течений
    for (var i = 1; i < n-1; i++) {
        for (var j = 1; j < n-1; j++) {
            for (var ii = 0; ii<=8; ii++) {
                w_cell[ii] = 0;
                w[ii] = 0;
            }
        }
    }
    for (var i = 1; i < n-1; i++) {
        for (var j = 1; j < n-1; j++) {
            // Формируем скорости для расчёта весов
  	        var ii = 0;
 	        for (var l = -1; l<=1; l++) {
                for (var m = -1; m<=1; m++) {
					w_cell[ii] = blnc_flow_cmpnts[i][j][ii];
                    ii = ii + 1;
                }
      	    }
            //  Клеточный автомат! В каждой клетке:
            //  - рассчитываем веса скоростей и количество вещества в облаке
            //  - рассчитываем веса седимента и количество седимента
            var s=0;
  	        var ii = 0;
 	        for (var l = -1; l<=1; l++) {
                for (var m = -1; m<=1; m++) {      	                        
                	s=s+w_cell[ii];
                	ii = ii + 1;
                }
      	    }
            if (s > 0) {
            	var ii = 0;
	            for (var l = -1; l<=1; l++) {
	                for (var m = -1; m<=1; m++) {
						w[ii] = w_cell[ii]/s;
	                	ii = ii + 1;
                	}
      	    	}
            }
            var c_k;
            var z_k;
			var ii = 0;
 	        for (var l = -1; l <= 1; l++) {
		        for (var m = -1; m <= 1; m++) {
                    c_k = w[ii] * b[i+l][j+m];
                	z_k = (w_sedim*1/w_cell[ii])/h[i+l][j+m] * c_k;
					if (c_k > 0 && c_k-z_k > 0) {
                    	c_k = c_k-z_k;
					} else if (c_k > 0 && c_k-z_k < 0) {
						z_k = c_k;
						c_k = 0;
					} else {
						z_k = 0;
						c_k = 0;
					}
			        c[i][j] = c[i][j] + c_k;
			        z[i][j] = z[i][j] + z_k;
					ii++;
				}
			}
        }
    }
    // Клеточный автомат! Обновляем исходные клетки
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
			b[i][j] = c[i][j];
        }
    }
	result={"c" : c,"b" : b,"z" : z};
	return result;
}/////////////////// End function transitionCloud() ///////////////
//
// mixer() - цикл расчёта масс: вброшенной взвеси,  
//	в облаке и седиментированной в узлах квадратной сетки
//  (поле скорости рассчитано ранее - массив: blnc_flow_cmpnts[i][j][k])                              
function mixer() {
    n_after_start = n_after_start + 1;
    conc_subst = new Array (n); // для  концентрации взвеси
    for (var i=0; i<n; i++) {conc_subst[i] = new Array(n)}; 
    for (var i = 0; i<n; i++) {
        for (var j = 0; j<n; j++) {
            conc_subst[i][j] = 0;
        }
    }
    if (f===0){ // Создаём глобальные динамические массивы, если самый первый вброс
        b = new Array(n);
        c = new Array(n);
        for (var i = 0; i<n; i++) {
            b[i] = new Array(n);
            c[i] = new Array(n);
        }
        for (var i = 0; i<n; i++) {
            for (var j = 0; j<n; j++) {
                b[i][j] = new Array(n_fr);
                c[i][j] = new Array(n_fr);
            };
        };
        z = new Array(n); // для текущего седимента
        for (var i=0; i<n; i++) {
            z[i] = new Array(n)
        };
        for (var i = 0; i<n; i++) {
            for (var j = 0; j<n; j++) {
                z[i][j] = new Array(n_fr);
            };
        };
        s_c = new Array (n); // для накопления вещества за счёт отдельных фракций в облаке 
        for (var i=0; i<n; i++) { //  и использования для расчёта концентрации
            s_c[i] = new Array(n);
        };
        z_sed = new Array(n); // для накопления седимента 
        for (var i=0; i<n; i++) {
            z_sed[i] = new Array(n);
        };
        z_il = new Array(n); // для накопления ила 
        for (var i=0; i<n; i++) {
            z_il[i] = new Array(n);
        };
        for (var i = 0; i<n; i++) {
            for (var j = 0; j<n; j++) {
                for (var i_fr=0; i_fr<n_fr; i_fr++) {
                    b[i][j][i_fr] = 0;
                    c[i][j][i_fr] = 0;
                    z[i][j][i_fr] = 0;
                }
                z_sed[i][j] = 0;
                z_il[i][j] = 0;
            }
        }
        f=f+1; // флаг: >0 - значит это уже не первый вброс
    } //end if - если самый первый вброс
    // Рассчитываем поочерёдно для каждой фракции массы взвеси:
    //  вброшенной, в облаке, седиментированной,
    //  и складываем их (суперпозиция без учёта флокуляции)
    //  для последующих расчётов: концентрации и седимента
    for (var i = 0; i<n; i++) {
        for (var j = 0; j<n; j++) {
            s_c[i][j] = 0;
        }
    }
    for (var i = 0; i<n; i++) {
        for (var j = 0; j<n; j++) {
            for (var i_fr=0; i_fr<n_fr; i_fr++) {
                c[i][j][i_fr] = 0;
			}
		}
	}
    // Добавляем взвеси в клетку с указанными координатами (полидисперсной)
    //  пока ещё не разделённой на фракции
	d_t_main_flights = mean_dt_adv; // С 23.08.17-го mean_dt_adv - см. в расчёте течений
	t_cycles_flight=t_cycles_flight+d_t_main_flights; // время с начала вброса в клетке с вбросами
    var d_substs = 0;
    if (t_flights < dt) {
        d_substs = d_t_main_flights*b_rab;  
        sum_subst_flights = sum_subst_flights + d_substs;
        t_flights=t_flights+d_t_main_flights;
        n_flights=n_flights+1;
    }
    if (t_flights > dt && (t_flights-dt) <= d_t_main_flights && t_flights != d_t_main_flights) {
        d_substs = - (t_flights-dt)*b_rab;
        sum_subst_flights = sum_subst_flights + d_substs;
        t_flights=t_flights - (t_flights-dt); // Подправляем время вброса за счёт последнего менее длинного цикла
    }
    if (t_flights == d_t_main_flights && t_flights > dt) {
        d_substs = - d_t_main_flights*b_rab + dt*b_rab;
        sum_subst_flights = sum_subst_flights + d_substs;
        t_flights=dt;
    }
    var d_subst = new Array(); // Вброс взвеси по фракциям на данном цикле
    for (var i_fr=0; i_fr<n_fr; i_fr++) {
        d_subst[i_fr] = 0;
    }
    var d_substs_=sum_subst_flights-sum_subst_flights_;
    sum_subst_flights_=sum_subst_flights;
    for (var i_fr=0; i_fr<n_fr; i_fr++) {
        var i_pc_fr="i_pc_fraction_"+i_fr;
        var i_gk_fr="i_gk_fraction_"+i_fr;
        d_subst[i_fr] = d_substs_ * pc_fr[i_fr]/100;
        c[i_flight][j_flight][i_fr] = c[i_flight][j_flight][i_fr] + d_subst[i_fr];
        var w_sedim = 60*gk_fr[i_fr]/100;
        // Рассчитываем растекание и седимент для очередного облака взвеси
		var b_i_fr = new Array(n);
		var c_i_fr = new Array(n);
		for (var i = 0; i<n; i++) {
			b_i_fr[i] = new Array(n);
			c_i_fr[i] = new Array(n);
		}
		for (var i = 0; i<n; i++) {
		    for (var j = 0; j<n; j++) {
				b_i_fr[i][j] = b[i][j][i_fr];
				c_i_fr[i][j] = c[i][j][i_fr];
			}
		}
        var res = transitionCloud(i_fr, w_sedim, c_i_fr, b_i_fr);
		for (var i = 0; i<n; i++) {
		    for (var j = 0; j<n; j++) {
				b[i][j][i_fr] = res.b[i][j];
				z[i][j][i_fr] = res.z[i][j];
			}
		}
    } //цикл с i_fr
    // Суммируем облака (суперпозиция облаков) и накапливаем суммарную седиментацию (по клеткам)
    for (var i_fr=0; i_fr<n_fr; i_fr++) {
        for (var i = 1; i<n-1; i++) {
            for (var j = 1; j<n-1; j++) {
                s_c[i][j] = s_c[i][j]+b[i][j][i_fr];
                z_sed[i][j] = z_sed[i][j]+z[i][j][i_fr];                
            }
        }
    }
    // Рассчитываем концентрацию взвеси и толщину ила
    for (var i = 1; i<n-1; i++) {
        for (var j = 1; j<n-1; j++) {
            if (h[i][j] > 0) {
                var consentr1=1000*s_c[i][j]/(h[i][j]*m2_1cell);
            } else {
                var consentr1=0;
            }
            conc_subst[i][j]=consentr1;
            // Рассчитываем среднюю по клетке толщину наилка по накопленному седименту
            //   при этом помним, что исходное ro мы перевели в кг/куб.м
            z_il[i][j] = 1000 * z_sed[i][j]/(ro*m2_1cell);
        }
    }
    // Отображаем на карте текущее распределение концентрации и ила
    if ((n_after_start + 1) % Math.abs(d_n_map) == 0 && d_n_map != 0) {
		if (d_n_map > 0) {
		    // Расцвечиваем клетки с толщиной осадка больше порогового значения
		    shkala = shkala_il;
		    for (var i = 0; i<n; i++) {
		        for (var j = 0; j<n; j++) {
		    	    if (z_il[i][j] >= z_il_barrier) {
		                document.getElementById("depths").rows[i].cells[j].style.backgroundColor = colour(z_il[i][j]);
		            }
		        }
		    }
		}
        // Расцвечиваем клетки с концентрацией взвеси
		if (d_n_map > 0) {
		    for (var i = 0; i<n; i++) {
		        for (var j = 0; j<n; j++) {
		    	    if (conc_subst[i][j]>=c_barrier) {
		    	    	shkala = shkala_subst;
		                document.getElementById("depths").rows[i].cells[j].style.backgroundColor=colour(conc_subst[i][j]);
		            }
		            // Закрашиваем глубинами следы прошедшей взвеси
		    	    if (conc_subst[i][j]<c_barrier && z_il[i][j]<z_il_barrier && h[i][j] > 0) {
		                shkala = shkala_depth;
		                document.getElementById("depths").rows[i].cells[j].style.backgroundColor=colour(h[i][j]);
		            }
		        }
		    }
		}
    }
    // Помечаем клетку с вбросами ещё раз (закрасили)
    for (var l = -1; l<=1; l++) {
        for (var m = -1; m<=1; m++) {
    		document.getElementById("depths").rows[i_flight+l].cells[j_flight+m].style.backgroundColor="red";
    	}
	}
    document.getElementById("n_after_flight").value=n_flights;
    document.getElementById("t_after_flight").value=Math.round(t_flights*100)/100;
    document.getElementById("n_cycles_all").value=n_after_start;
    document.getElementById("t_cycles_all_flight").value=Math.round(t_cycles_flight*100)/100;
    document.getElementById("inp_sum_subst_flights").value=Math.round(sum_subst_flights*10)/10;
    y_n = true;
    if (n_after_start % n_after_start_stops == 0) {
    	y_n = confirm("Продолжаем ?");
    }
    if (!y_n) {
    	clearInterval(var_time);
    }
}; // End function mixer()

function transfer_clouds(restart) {
    // Вызываем периодически mixer()
    var_time=setInterval(mixer,0);
} // End transfer_clouds()
grider_depth();
turbulent_flows();
alert("Старт!");
transfer_clouds(0);
}; // End Window.onload()
