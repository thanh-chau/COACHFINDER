import { useState } from "react";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Calendar,
  Video, Star, Eye, Clock, Award, Zap, Target,
  BarChart2, ArrowUpRight, ArrowDownRight, RefreshCw,
  ChevronDown, Play, Heart, BookOpen, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────
const MONTHS_12 = [
  { m:"T4/25", gross:8500000,  net:7480000,  students:9,  sessions:18, newHV:2, retainHV:7  },
  { m:"T5/25", gross:9200000,  net:8096000,  students:10, sessions:20, newHV:2, retainHV:8  },
  { m:"T6/25", gross:8900000,  net:7832000,  students:10, sessions:19, newHV:1, retainHV:9  },
  { m:"T7/25", gross:10500000, net:9240000,  students:12, sessions:23, newHV:3, retainHV:9  },
  { m:"T8/25", gross:11200000, net:9856000,  students:13, sessions:24, newHV:2, retainHV:11 },
  { m:"T9/25", gross:9800000,  net:8624000,  students:12, sessions:21, newHV:1, retainHV:11 },
  { m:"T10/25",gross:9800000,  net:8624000,  students:11, sessions:21, newHV:2, retainHV:9  },
  { m:"T11/25",gross:11200000, net:9856000,  students:13, sessions:24, newHV:3, retainHV:10 },
  { m:"T12/25",gross:14500000, net:12760000, students:16, sessions:31, newHV:4, retainHV:12 },
  { m:"T1/26", gross:12300000, net:10824000, students:14, sessions:26, newHV:2, retainHV:12 },
  { m:"T2/26", gross:13800000, net:12144000, students:15, sessions:30, newHV:3, retainHV:12 },
  { m:"T3/26", gross:17727273, net:15600000, students:17, sessions:35, newHV:4, retainHV:13 },
];

const SOURCE_PIE = [
  { name:"Buổi lẻ",     value:36, color:"#3b82f6" },
  { name:"Gói 8 buổi",  value:27, color:"#8b5cf6" },
  { name:"Gói tháng",   value:24, color:"#10b981" },
  { name:"Gói 3 tháng", value:13, color:"#f59e0b" },
];

const STUDENTS_PROGRESS = [
  { name:"Nguyễn Minh Anh", progress:87, sessions:26, retention:94, sport:"Thể hình", nps:10, paid:13200000 },
  { name:"Võ Thị Hoa",      progress:95, sessions:22, retention:98, sport:"Yoga",     nps:10, paid:8200000  },
  { name:"Bùi Văn Nam",     progress:73, sessions:18, retention:82, sport:"Cardio",   nps:9,  paid:7000000  },
  { name:"Lê Thúy Nga",     progress:91, sessions:11, retention:96, sport:"Yoga",     nps:10, paid:4200000  },
  { name:"Trần Bảo Long",   progress:68, sessions:12, retention:75, sport:"Thể hình", nps:8,  paid:4400000  },
  { name:"Đặng Quốc Tuấn",  progress:79, sessions:15, retention:88, sport:"Cardio",   nps:9,  paid:5500000  },
  { name:"Phạm Đức Hải",    progress:62, sessions:8,  retention:70, sport:"Boxing",   nps:8,  paid:3200000  },
];

const VIDEOS_PERF = [
  { title:"HIIT Jump Rope",         category:"Cardio",   views:1456, completion:78, likes:367, watchTime:48.3 },
  { title:"Tour phòng tập 8K 360°", category:"Thể hình", views:1847, completion:91, likes:456, watchTime:12.1 },
  { title:"Bench Press – 3 lỗi",    category:"Thể hình", views:1203, completion:82, likes:287, watchTime:22.4 },
  { title:"Chạy bộ Sprinting",      category:"Cardio",   views:734,  completion:74, likes:189, watchTime:18.2 },
  { title:"Pull-up 0→10 rep",       category:"Thể hình", views:423,  completion:88, likes:112, watchTime:31.6 },
  { title:"Yoga – Flexibility",     category:"Yoga",     views:892,  completion:85, likes:234, watchTime:39.8 },
  { title:"Boxing Jab & Cross",     category:"Boxing",   views:567,  completion:71, likes:143, watchTime:20.8 },
  { title:"Squat Form A→Z",         category:"Thể hình", views:347,  completion:93, likes:89,  watchTime:26.4 },
];

const VIEWS_TREND = [
  { m:"T10/25", views:2100 }, { m:"T11/25", views:2800 },
  { m:"T12/25", views:3900 }, { m:"T1/26",  views:3200 },
  { m:"T2/26",  views:4500 }, { m:"T3/26",  views:6200 },
];

const CAT_VIEWS = [
  { cat:"Thể hình", views:3820, videos:7 },
  { cat:"Yoga",     views:1660, videos:3 },
  { cat:"Cardio",   views:2190, videos:3 },
  { cat:"Boxing",   views:1232, videos:3 },
  { cat:"Tennis",   views:699,  videos:2 },
  { cat:"Bơi lội",  views:545,  videos:2 },
  { cat:"CrossFit", views:623,  videos:1 },
  { cat:"Pilates",  views:278,  videos:1 },
];

// Heatmap: day(0-6=Mon-Sun) x slot(0-7=6h-20h)
const HEATMAP_DATA: number[][] = [
  [0,0,1,2,3,2,1,0,0,1,2,3,2,1], // Mon
  [0,0,2,3,2,1,0,0,1,2,3,2,1,0], // Tue
  [0,1,3,4,3,2,1,0,1,3,4,3,2,1], // Wed
  [0,0,1,2,3,2,1,0,0,2,3,2,1,0], // Thu
  [0,1,2,3,2,1,0,0,1,3,4,3,2,1], // Fri
  [1,2,4,5,4,3,2,1,2,4,5,4,3,2], // Sat
  [0,1,3,4,3,2,1,0,1,3,4,3,1,0], // Sun
];
const DAYS  = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];
const HOURS = ["6h","7h","8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h"];

const RADAR_DATA = [
  { subject:"Thể hình", A:95, fullMark:100 },
  { subject:"Cardio",   A:80, fullMark:100 },
  { subject:"Yoga",     A:70, fullMark:100 },
  { subject:"Boxing",   A:88, fullMark:100 },
  { subject:"Tennis",   A:60, fullMark:100 },
  { subject:"Bơi lội",  A:55, fullMark:100 },
];

const SESSION_TYPE = [
  { name:"Online",  value:62, color:"#3b82f6" },
  { name:"Offline", value:38, color:"#10b981" },
];

const SCHEDULE_WEEK = [
  { day:"T2", sessions:5 }, { day:"T3", sessions:4 }, { day:"T4", sessions:7 },
  { day:"T5", sessions:5 }, { day:"T6", sessions:6 }, { day:"T7", sessions:9 }, { day:"CN", sessions:8 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtM  = (n:number) => n>=1000000?(n/1000000).toFixed(1)+"M":(n/1000).toFixed(0)+"K";
const heatC = (v:number) => {
  if (v===0) return "bg-gray-100";
  if (v===1) return "bg-blue-100";
  if (v===2) return "bg-blue-200";
  if (v===3) return "bg-blue-400";
  if (v===4) return "bg-blue-500";
  return "bg-blue-700";
};

function Tip({ active, payload, label }:any) {
  if (!active||!payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-xs min-w-28">
      <div className="font-bold text-gray-700 mb-1.5">{label}</div>
      {payload.map((p:any,i:number)=>(
        <div key={i} className="flex justify-between gap-3">
          <span style={{color:p.color||p.stroke}} className="truncate">{p.name}</span>
          <span className="font-bold text-gray-800">{typeof p.value==="number"&&p.value>100000?fmtM(p.value):p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPI({ icon:Icon, label, value, sub, trend, trendUp, bg, color }:any) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`}/>
        </div>
        {trend&&(
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${trendUp?"bg-emerald-50 text-emerald-600":"bg-red-50 text-red-500"}`}>
            {trendUp?<TrendingUp className="w-2.5 h-2.5"/>:<TrendingDown className="w-2.5 h-2.5"/>}{trend}
          </span>
        )}
      </div>
      <div style={{fontWeight:800,fontSize:"1.3rem",lineHeight:1}} className="text-gray-900 mb-0.5">{value}</div>
      <div style={{fontWeight:600,fontSize:"0.78rem"}} className="text-gray-700 mb-0.5">{label}</div>
      <div style={{fontSize:"0.7rem"}} className="text-gray-400">{sub}</div>
    </div>
  );
}

// ─── REVENUE TAB ─────────────────────────────────────────────────────────────
function RevenueTab() {
  const cur  = MONTHS_12[11];
  const prev = MONTHS_12[10];
  const growG = ((cur.gross-prev.gross)/prev.gross*100).toFixed(1);
  const growN = ((cur.net-prev.net)/prev.net*100).toFixed(1);
  const avgPerSession = Math.round(cur.net/cur.sessions);
  const forecast = Math.round(cur.net*1.08);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={DollarSign}   label="Thu nhập thực T3"     value={fmtM(cur.net)}          sub="Sau hoa hồng 12%"     trend={`+${growN}%`}  trendUp bg="bg-emerald-50" color="text-emerald-500"/>
        <KPI icon={TrendingUp}   label="Doanh thu gộp T3"     value={fmtM(cur.gross)}         sub="Trước hoa hồng"       trend={`+${growG}%`}  trendUp bg="bg-blue-50"    color="text-blue-500"/>
        <KPI icon={Zap}          label="TB thu/buổi"           value={fmtM(avgPerSession)}     sub={`${cur.sessions} buổi T3`} trend="+5%"     trendUp bg="bg-purple-50"  color="text-purple-500"/>
        <KPI icon={Target}       label="Dự báo T4"             value={fmtM(forecast)}          sub="Dự kiến +8%"          trend="~+8%"          trendUp bg="bg-amber-50"   color="text-amber-500"/>
      </div>

      {/* Area chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900">Xu hướng doanh thu 12 tháng</div>
            <div style={{fontSize:"0.75rem"}} className="text-gray-400">Doanh thu gộp vs thu nhập thực (sau HH 12%)</div>
          </div>
          <div className="flex gap-3">
            {[{c:"#3b82f6",l:"Doanh thu gộp"},{c:"#10b981",l:"Thu thực"}].map(({c,l})=>(
              <div key={l} className="flex items-center gap-1.5"><div className="w-2.5 h-1.5 rounded-full" style={{backgroundColor:c}}/><span style={{fontSize:"0.7rem"}} className="text-gray-400">{l}</span></div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MONTHS_12} margin={{top:5,right:5,left:-10,bottom:0}}>
            <defs key="ca-defs1">
              <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.18}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid key="ca-grid1" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
            <XAxis key="ca-xaxis1" dataKey="m" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
            <YAxis key="ca-yaxis1" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={fmtM}/>
            <Tooltip key="ca-tooltip1" content={<Tip/>}/>
            <Area key="ca-gross" type="monotone" dataKey="gross" name="Doanh thu gộp" stroke="#3b82f6" strokeWidth={2}   fill="url(#gG)"/>
            <Area key="ca-net" type="monotone" dataKey="net"   name="Thu nhập thực" stroke="#10b981" strokeWidth={2.5} fill="url(#gN)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source pie */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Phân bổ nguồn thu</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">Tháng 3/2026</div>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={120} height={120}>
              <PieChart><Pie data={SOURCE_PIE} cx="50%" cy="50%" innerRadius={35} outerRadius={56} dataKey="value" strokeWidth={2} stroke="#fff">
                {SOURCE_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {SOURCE_PIE.map(s=>(
                <div key={s.name}>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-gray-700" style={{fontSize:"0.78rem"}}><span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:s.color}}/>{s.name}</span>
                    <span style={{fontSize:"0.78rem",fontWeight:700}} className="text-gray-900">{s.value}%</span>
                  </div>
                  <div className="mt-0.5 h-1 bg-gray-100 rounded-full"><div className="h-1 rounded-full" style={{width:`${s.value}%`,backgroundColor:s.color}}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MoM growth */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Tăng trưởng theo tháng</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">MoM % thay đổi doanh thu gộp</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={MONTHS_12.slice(1).map((m,i)=>({
              m:m.m,
              growth:Number(((m.gross-MONTHS_12[i].gross)/MONTHS_12[i].gross*100).toFixed(1))
            }))} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="m" tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"}/>
              <Tooltip content={<Tip/>} formatter={(v:any)=>[v+"%","Tăng trưởng"]}/>
              <Bar dataKey="growth" name="Tăng trưởng" radius={[4,4,0,0]}
                fill="#3b82f6"
                label={false}>
                {MONTHS_12.slice(1).map((_,i)=>{
                  const g=(MONTHS_12[i+1].gross-MONTHS_12[i].gross)/MONTHS_12[i].gross*100;
                  return <Cell key={i} fill={g>=0?"#10b981":"#ef4444"}/>;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ─────────────────────────────────────────────────────────────
function StudentsTab() {
  const active   = STUDENTS_PROGRESS.filter(s=>s.retention>=80).length;
  const avgRetain= Math.round(STUDENTS_PROGRESS.reduce((a,s)=>a+s.retention,0)/STUDENTS_PROGRESS.length);
  const avgProg  = Math.round(STUDENTS_PROGRESS.reduce((a,s)=>a+s.progress,0)/STUDENTS_PROGRESS.length);
  const avgNPS   = (STUDENTS_PROGRESS.reduce((a,s)=>a+s.nps,0)/STUDENTS_PROGRESS.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={Users}    label="Học viên tháng 3"  value="17"         sub="+4 so với T2"     trend="+31%"  trendUp bg="bg-blue-50"    color="text-blue-500"/>
        <KPI icon={Activity} label="Active (≥80% RT)"  value={active+""}  sub="retention cao"    trend="93%"   trendUp bg="bg-emerald-50" color="text-emerald-500"/>
        <KPI icon={Star}     label="Tiến độ TB"         value={avgProg+"%"} sub="Điểm AI TB"      trend="+3%"   trendUp bg="bg-purple-50"  color="text-purple-500"/>
        <KPI icon={Award}    label="NPS Score"          value={avgNPS}     sub="Trung bình 0–10"  trend="Xuất sắc" trendUp bg="bg-amber-50" color="text-amber-500"/>
      </div>

      {/* New vs Returning */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Học viên mới vs Quay lại</div>
        <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-4">Phân tích acquisition & retention theo tháng</div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={MONTHS_12} margin={{top:5,right:5,left:-15,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
            <XAxis dataKey="m" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="newHV"    name="Học viên mới"    fill="#3b82f6" radius={[3,3,0,0]} stackId="a"/>
            <Bar dataKey="retainHV" name="Học viên cũ"     fill="#10b981" radius={[3,3,0,0]} stackId="a"/>
            <Line type="monotone" dataKey="students" name="Tổng HV" stroke="#f59e0b" strokeWidth={2.5} dot={{r:3,fill:"#f59e0b"}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Student radar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Phân bổ theo môn</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">Chuyên môn của HLV theo đánh giá HV</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={65}>
              <PolarGrid stroke="#f3f4f6"/>
              <PolarAngleAxis dataKey="subject" tick={{fontSize:10,fill:"#6b7280"}}/>
              <PolarRadiusAxis angle={30} domain={[0,100]} tick={false} axisLine={false}/>
              <Radar name="Điểm" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2}/>
              <Tooltip content={<Tip/>}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress table */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Tiến độ học viên</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">Điểm AI & retention rate</div>
          <div className="space-y-2">
            {STUDENTS_PROGRESS.sort((a,b)=>b.progress-a.progress).map(s=>(
              <div key={s.name} className="flex items-center gap-2.5 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5">
                    <span style={{fontSize:"0.78rem",fontWeight:500}} className="text-gray-700 truncate">{s.name}</span>
                    <span style={{fontSize:"0.72rem",fontWeight:700}} className={s.progress>=80?"text-emerald-600":s.progress>=60?"text-blue-500":"text-amber-500"}>{s.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className={`h-1.5 rounded-full transition-all ${s.progress>=80?"bg-emerald-400":s.progress>=60?"bg-blue-400":"bg-amber-400"}`} style={{width:`${s.progress}%`}}/>
                  </div>
                </div>
                <div className="shrink-0 text-right" style={{minWidth:40}}>
                  <div style={{fontSize:"0.7rem",fontWeight:700}} className="text-gray-500">{s.retention}%</div>
                  <div style={{fontSize:"0.6rem"}} className="text-gray-300">retain</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retention info bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-blue-600"/>
        </div>
        <div className="flex-1">
          <div style={{fontWeight:700,fontSize:"0.9rem"}} className="text-blue-900">Tỷ lệ giữ chân học viên: {avgRetain}%</div>
          <p style={{fontSize:"0.78rem",lineHeight:1.7}} className="text-blue-700">
            Trung bình ngành là 65%. Bạn đang vượt <strong>{avgRetain-65}%</strong>. Học viên có tiến độ ≥80% thường gắn bó hơn 2.4× so với nhóm còn lại.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div style={{fontWeight:800,fontSize:"1.8rem",lineHeight:1}} className="text-blue-600">{avgRetain}%</div>
          <div style={{fontSize:"0.68rem"}} className="text-blue-400">Retention rate</div>
        </div>
      </div>
    </div>
  );
}

// ─── VIDEO TAB ────────────────────────────────────────────────────────────────
function VideoTab() {
  const totalViews  = VIDEOS_PERF.reduce((a,v)=>a+v.views,0);
  const totalLikes  = VIDEOS_PERF.reduce((a,v)=>a+v.likes,0);
  const avgComplete = Math.round(VIDEOS_PERF.reduce((a,v)=>a+v.completion,0)/VIDEOS_PERF.length);
  const totalHours  = VIDEOS_PERF.reduce((a,v)=>a+v.watchTime,0).toFixed(0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={Eye}      label="Tổng lượt xem"    value={totalViews>1000?(totalViews/1000).toFixed(1)+"K":totalViews+""} sub="Tất cả video"  trend="+38%"  trendUp bg="bg-blue-50"    color="text-blue-500"/>
        <KPI icon={Play}     label="Tỷ lệ hoàn thành" value={avgComplete+"%"}  sub="Trung bình"          trend="+4%"   trendUp bg="bg-emerald-50" color="text-emerald-500"/>
        <KPI icon={Clock}    label="Giờ xem TB"        value={totalHours+"h"}  sub="Tháng 3"             trend="+22%"  trendUp bg="bg-purple-50"  color="text-purple-500"/>
        <KPI icon={Heart}    label="Tổng lượt thích"   value={totalLikes+""}   sub="Từ tất cả video"     trend="+18%"  trendUp bg="bg-rose-50"    color="text-rose-500"/>
      </div>

      {/* Views trend */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Xu hướng lượt xem</div>
        <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-4">Tổng lượt xem toàn kênh theo tháng</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={VIEWS_TREND} margin={{top:5,right:5,left:-15,bottom:0}}>
            <defs><linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
            <XAxis dataKey="m" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="views" name="Lượt xem" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gV)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category views */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Lượt xem theo danh mục</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">Top danh mục được xem nhiều nhất</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CAT_VIEWS} layout="vertical" margin={{top:0,right:10,left:40,bottom:0}}>
              <XAxis type="number" tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="cat" type="category" tick={{fontSize:10,fill:"#6b7280"}} axisLine={false} tickLine={false} width={50}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="views" name="Lượt xem" fill="#3b82f6" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top video table */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Top video hiệu suất</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">Sắp xếp theo lượt xem</div>
          <div className="space-y-2">
            {VIDEOS_PERF.sort((a,b)=>b.views-a.views).slice(0,6).map((v,i)=>(
              <div key={v.title} className="flex items-center gap-2.5 py-1 border-b border-gray-50 last:border-0">
                <span style={{fontWeight:800,fontSize:"0.85rem",width:18,textAlign:"center"}}
                  className={i===0?"text-amber-400":i===1?"text-gray-400":i===2?"text-orange-400":"text-gray-200"}>{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div style={{fontSize:"0.78rem",fontWeight:500}} className="text-gray-800 truncate">{v.title}</div>
                  <div style={{fontSize:"0.65rem"}} className="text-gray-400">{v.category} · {v.completion}% hoàn thành</div>
                </div>
                <div className="text-right shrink-0">
                  <div style={{fontSize:"0.78rem",fontWeight:700}} className="text-gray-700">{v.views.toLocaleString()}</div>
                  <div style={{fontSize:"0.62rem"}} className="text-gray-400">{v.likes}❤️</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={Calendar} label="Buổi dạy T3"       value="35"    sub="Tổng số buổi"          trend="+17%"  trendUp bg="bg-blue-50"    color="text-blue-500"/>
        <KPI icon={BookOpen} label="Tỷ lệ hoàn thành"  value="97%"   sub="33/35 buổi"            trend="+1%"   trendUp bg="bg-emerald-50" color="text-emerald-500"/>
        <KPI icon={Clock}    label="Thời lượng TB"      value="87'"   sub="Phút/buổi"             trend="Tốt"   trendUp bg="bg-purple-50"  color="text-purple-500"/>
        <KPI icon={Zap}      label="Ngày bận nhất"      value="T7/CN" sub="9 buổi/ngày"           bg="bg-amber-50"   color="text-amber-500"/>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Bản đồ nhiệt — Giờ dạy</div>
        <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-4">Số buổi theo khung giờ & ngày trong tuần</div>
        <div className="overflow-x-auto">
          <div style={{minWidth:480}}>
            {/* Hour labels */}
            <div className="flex mb-1 ml-14">
              {HOURS.map(h=>(
                <div key={h} className="flex-1 text-center text-gray-400" style={{fontSize:"0.6rem"}}>{h}</div>
              ))}
            </div>
            {HEATMAP_DATA.map((row,di)=>(
              <div key={di} className="flex items-center mb-1">
                <div className="w-12 text-right pr-2 text-gray-500 shrink-0" style={{fontSize:"0.72rem"}}>{DAYS[di]}</div>
                {row.map((val,hi)=>(
                  <div key={hi} className={`flex-1 aspect-square rounded-sm mx-0.5 ${heatC(val)} flex items-center justify-center`}>
                    {val>0&&<span style={{fontSize:"0.55rem",fontWeight:700}} className={val>=4?"text-white":"text-blue-600"}>{val}</span>}
                  </div>
                ))}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 ml-14">
              <span style={{fontSize:"0.65rem"}} className="text-gray-400">Ít</span>
              {[0,1,2,3,4,5].map(v=><div key={v} className={`w-4 h-4 rounded-sm ${heatC(v)}`}/>)}
              <span style={{fontSize:"0.65rem"}} className="text-gray-400">Nhiều</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By day of week */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Buổi dạy theo thứ</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">Tổng tuần hiện tại</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SCHEDULE_WEEK} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="day" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="sessions" name="Số buổi" radius={[5,5,0,0]}>
                {SCHEDULE_WEEK.map((e,i)=><Cell key={i} fill={e.sessions>=8?"#3b82f6":e.sessions>=6?"#6366f1":"#a5b4fc"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Online vs Offline */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Online vs Offline</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-3">Tỷ lệ hình thức buổi dạy</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={SESSION_TYPE} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={2} stroke="#fff">
                  {SESSION_TYPE.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {SESSION_TYPE.map(s=>(
                <div key={s.name}>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-gray-700" style={{fontSize:"0.82rem",fontWeight:500}}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:s.color}}/>{s.name}
                    </span>
                    <span style={{fontWeight:700,fontSize:"0.85rem"}} className="text-gray-900">{s.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 rounded-full" style={{width:`${s.value}%`,backgroundColor:s.color}}/>
                  </div>
                  <div style={{fontSize:"0.68rem"}} className="text-gray-400 mt-0.5">{Math.round(35*s.value/100)} buổi tháng 3</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 bg-blue-50 rounded-xl p-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500 shrink-0"/>
            <p style={{fontSize:"0.75rem",lineHeight:1.6}} className="text-blue-700">
              Online tăng <strong>+8%</strong> so với Q4/2025. Học viên ưa tiện lợi sau Tết Nguyên Đán.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
type ATab = "revenue"|"students"|"video"|"schedule";

export function CoachAnalytics() {
  const [tab,setTab] = useState<ATab>("revenue");

  const TABS: {id:ATab;emoji:string;label:string}[] = [
    {id:"revenue",  emoji:"💰", label:"Doanh thu"},
    {id:"students", emoji:"👥", label:"Học viên"},
    {id:"video",    emoji:"🎬", label:"Video"},
    {id:"schedule", emoji:"📅", label:"Lịch dạy"},
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{fontWeight:800,fontSize:"1.2rem"}} className="text-gray-900">Analytics</h1>
          <p style={{fontSize:"0.78rem"}} className="text-gray-400 mt-0.5">Phân tích chi tiết hiệu suất huấn luyện · Tháng 3, 2026</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          style={{fontSize:"0.8rem",fontWeight:500}}>
          <RefreshCw className="w-3.5 h-3.5"/> Cập nhật
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-fit">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 transition-colors border-r border-gray-100 last:border-0 ${tab===t.id?"bg-blue-500 text-white":"text-gray-500 hover:bg-gray-50"}`}
            style={{fontSize:"0.82rem",fontWeight:tab===t.id?700:500}}>
            <span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab==="revenue"  && <RevenueTab/>}
      {tab==="students" && <StudentsTab/>}
      {tab==="video"    && <VideoTab/>}
      {tab==="schedule" && <ScheduleTab/>}
    </div>
  );
}